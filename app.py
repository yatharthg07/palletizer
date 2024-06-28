from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import socket
import struct
import time
import math
from threading import Event

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ... (keep all the existing classes and functions)

box_coords = []
pickup_point = None
transfer_point = None
master_point = None
num_layers = None

user_input_event = Event()

@app.route('/send-coordinates', methods=['POST'])
def receive_coordinates():
    global box_coords, num_layers
    data = request.json
    coordinates = data['coordinates']
    
    # Filter coordinates for layer 1 and extract x, y, z
    box_coords = [[coord['x'], coord['y'], coord['z']] for coord in coordinates if coord['layer'] == 1]
    
    # Get total layers
    num_layers = coordinates[0]['totalLayers']
    
    return jsonify({'message': 'Coordinates received successfully'})

def wait_for_user_input():
    user_input_event.clear()
    user_input_event.wait()

def get_master_point():
    global pickup_point, transfer_point, master_point, num_layers
    robot_ip = '192.168.1.200'
    
    socketio.emit('prompt', {'message': 'Press done after reaching desired master location and switch robot to Remote mode'})
    wait_for_user_input()
    result = robot_ip
    socketio.emit('info', {'message': f'Master point: {result}'})
    
    socketio.emit('prompt', {'message': 'Press done after reaching desired transfer location'})
    wait_for_user_input()
    transfer = robot_ip
    socketio.emit('info', {'message': f'Transfer point: {transfer}'})
    
    socketio.emit('prompt', {'message': 'Press done after reaching desired pickup location'})
    wait_for_user_input()
    pickup = robot_ip
    socketio.emit('info', {'message': f'Pickup point: {pickup}'})
    
    return pickup, transfer, result

@socketio.on('done')
def handle_done():
    user_input_event.set()

@app.route('/start-process', methods=['POST'])
def start_process():
    global pickup_point, transfer_point, master_point, num_layers, box_coords
    
    pickup_point, transfer_point, master_point = get_master_point()
    
    rb = RobotData()
    try:
        rb.connect('192.168.1.200')

        for layer in range(num_layers):
            for box in box_coords:
                box_abs = [master_point[i] + box['x'] for i in range(2)] + [master_point[2]] + master_point[3:]
                rotation_angle = box['z']  # Assuming 'z' contains the rotation angle
                pre_pickup = calculate_pre_point(pickup_point)
                pre_place = calculate_pre_point(box_abs)

                rb.movel(pre_pickup)
                socketio.emit('info', {'message': 'Moving to pre-pickup position'})
                wait_for_user_input()

                rb.movel(pickup_point)
                socketio.emit('info', {'message': 'Moving to pickup position'})
                wait_for_user_input()

                rb.movel(pre_pickup)
                socketio.emit('info', {'message': 'Moving back to pre-pickup position'})
                wait_for_user_input()

                transfer_point_rotated = apply_rotation(transfer_point.copy(), rotation_angle)
                rb.movel(transfer_point_rotated)
                socketio.emit('info', {'message': 'Moving to rotated transfer point'})
                wait_for_user_input()

                rb.movel(pre_place)
                socketio.emit('info', {'message': 'Moving to pre-place position'})
                wait_for_user_input()

                rb.movel(box_abs)
                socketio.emit('info', {'message': 'Moving to place position'})
                wait_for_user_input()

                rb.movel(pre_place)
                socketio.emit('info', {'message': 'Moving back to pre-place position'})
                wait_for_user_input()

                rb.movel(transfer_point)
                socketio.emit('info', {'message': 'Moving to transfer point'})
                wait_for_user_input()

            pickup_point[2] += 0
            master_point[2] += 0.1
            socketio.emit('info', {'message': f'Completed layer {layer + 1}'})

        socketio.emit('info', {'message': 'Task completed successfully'})
    except (socket.error, socket.timeout) as e:
        socketio.emit('error', {'message': f'Socket error: {e}'})
    finally:
        rb.disconnect()

    return jsonify({'message': 'Process completed'})

if __name__ == '__main__':
    socketio.run(app, debug=True)