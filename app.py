from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import socket
import struct
import time
import math
from flask_cors import CORS
app = Flask(__name__)
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Placeholder for coordinates
coordinates = []

@app.route('/send-coordinates', methods=['POST'])
def receive_coordinates():
    global coordinates
    coordinates = request.json['coordinates']
    socketio.emit('update', {'message': 'Coordinates received successfully'})
    return jsonify({'status': 'success'})

def get_tcp_pose(robot_ip):
    rb = RobotData()
    try:
        rb.connect(robot_ip)
    except Exception as e:
        print(f"Failed to connect to robot: {e}")
        return None

    data = rb.get_data()
    if data:
        tcp_position = [data['tcp_x'], data['tcp_y'], data['tcp_z'], data['rot_x'], data['rot_y'], data['rot_z']]
        print("TCP Position [x, y, z, rx, ry, rz]:", tcp_position)
    else:
        print('Warning: No Data')
        tcp_position = None

    rb.disconnect()
    return tcp_position

def getMasterPoint():
    robot_ip = '192.168.1.200'
    socketio.emit('update', {'message': 'Set the home position and click Done'})
    socketio.sleep(0)
    socketio.sleep(0)
    result = get_tcp_pose(robot_ip)
    socketio.emit('update', {'message': 'Home position set'})
    socketio.sleep(0)

    socketio.emit('update', {'message': 'Set the transfer position and click Done'})
    socketio.sleep(0)
    transfer = get_tcp_pose(robot_ip)
    socketio.emit('update', {'message': 'Transfer position set'})
    socketio.sleep(0)

    socketio.emit('update', {'message': 'Set the pickup position and click Done'})
    socketio.sleep(0)
    pickup = get_tcp_pose(robot_ip)
    socketio.emit('update', {'message': 'Pickup position set'})
    socketio.sleep(0)

    num_layers = 2  # Default value for number of layers
    socketio.emit('update', {'message': 'Enter the number of layers', 'prompt': 'num_layers'})
    socketio.sleep(0)

    return pickup, transfer, result, num_layers

def process_box_coordinates():
    pickup_point, transfer_point, master_point, num_layers = getMasterPoint()

    box_coords = coordinates

    rb = RobotData()
    try:
        rb.connect('192.168.1.200')

        for layer in range(num_layers):
            for box in box_coords:
                box_abs = [master_point[i] + box[i] for i in range(2)] + [master_point[2]] + master_point[3:]
                rotation_angle = box[2]
                pre_pickup = calculate_pre_point(pickup_point)
                pre_place = calculate_pre_point(box_abs)

                rb.movel(pre_pickup)
                time.sleep(2)
                rb.movel(pickup_point)
                time.sleep(2)
                rb.movel(pre_pickup)
                time.sleep(2)

                transfer_point_rotated = apply_rotation(transfer_point.copy(), rotation_angle)
                rb.movel(transfer_point_rotated)
                time.sleep(3)

                rb.movel(pre_place)
                time.sleep(3.5)
                rb.movel(box_abs)
                time.sleep(3)
                rb.movel(pre_place)
                time.sleep(2)
                rb.movel(transfer_point)
                time.sleep(3)

            pickup_point[2] += 0
            master_point[2] += 0.1

    except (socket.error, socket.timeout) as e:
        print(f"Socket error: {e}")
    finally:
        rb.disconnect()

    print("Pickup Point:", pickup_point)
    print("Transfer Point:", transfer_point)
    print("Master Point:", master_point)
    print("Number of Layers:", num_layers)

@socketio.on('start-process')
def handle_start_process():
    process_box_coordinates()
    socketio.emit('update', {'message': 'Task completed'})

if __name__ == '__main__':
    socketio.run(app, debug=True)
