import socket
import struct
import time
import math
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from threading import Event

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

pallet_data = {
    'left': {
        'box_coords_odd': [],
        'box_coords_even': []
    },
    'right': {
        'box_coords_odd': [],
        'box_coords_even': []
    }
}
pickup_point = None
master_points = {'left': None, 'right': None}
num_layers = None
num_pallets = None
layer_config = None

user_input_event = Event()
pause_event = Event()
stop_event = Event()

DEFAULT_TIMEOUT = 10

@app.route('/send-coordinates', methods=['POST'])
def receive_coordinates():
    global pallet_data, num_layers, num_pallets
    data = request.json
    coordinates = data['coordinates']
    
    # Clear previous data
    for pallet in pallet_data.keys():
        pallet_data[pallet]['box_coords_odd'] = []
        pallet_data[pallet]['box_coords_even'] = []

    for coord in coordinates:
        pallet = coord['pallet']
        if coord['layerType'] == 'odd' and coord['layer'] == 1:
            pallet_data[pallet]['box_coords_odd'].append([coord['x'], coord['y'], coord['rotate'] * math.pi / 2])
        elif coord['layerType'] == 'even' and coord['layer'] == 2:
            pallet_data[pallet]['box_coords_even'].append([coord['x'], coord['y'], coord['rotate'] * math.pi / 2])
    
    num_layers = coordinates[0]['totalLayers']
    num_pallets = 2 if pallet_data['right']['box_coords_odd'] or pallet_data['right']['box_coords_even'] else 1
    print(pallet_data)
    
    return jsonify({'message': 'Coordinates received successfully'})


def wait_for_user_input():
    user_input_event.clear()
    user_input_event.wait()

def wait_for_pause():
    while pause_event.is_set():
        time.sleep(0.1)
        
conname = ['total_message_len', 'total_message_type', 'mode_sub_len', 'mode_sub_type', 'timestamp', 'reserver',
           'reserver', 'is_robot_power_on', 'is_emergency_stopped', 'is_robot_protective_stopped', 'is_program_running',
           'is_program_paused', 'get_robot_mode', 'get_robot_control_mode', 'get_target_speed_fraction',
           'get_speed_scaling',
           'get_target_speed_fraction_limit', 'get_robot_speed_mode', 'is_robot_system_in_alarm', 'is_in_package_mode',
           'reverse', 'joint_sub_len', 'joint_sub_type', 'actual_joint0', 'target_joint0', 'actual_velocity0',
           'target_pluse0',
           'actual_pluse0', 'zero_pluse0', 'current0', 'voltage0', 'temperature0', 'torques0', 'mode0', 'reverse0',
           'actual_joint1',
           'target_joint1', 'actual_velocity1', 'target_pluse1', 'actual_pluse1', 'zero_pluse1', 'current1', 'voltage1',
           'temperature1', 'torques1', 'mode1', 'reverse1', 'actual_joint2', 'target_joint2', 'actual_velocity2',
           'target_pluse2',
           'actual_pluse2', 'zero_pluse2', 'current2', 'voltage2', 'temperature2', 'torques2', 'mode2', 'reverse2',
           'actual_joint3',
           'target_joint3', 'actual_velocity3', 'target_pluse3', 'actual_pluse3', 'zero_pluse3', 'current3', 'voltage3',
           'temperature3', 'torques3', 'mode3', 'reverse3', 'actual_joint4', 'target_joint4', 'actual_velocity4',
           'target_pluse4',
           'actual_pluse4', 'zero_pluse4', 'current4', 'voltage4', 'temperature4', 'torques4', 'mode4', 'reverse4',
           'actual_joint5',
           'target_joint5', 'actual_velocity5', 'target_pluse5', 'actual_pluse5', 'zero_pluse5', 'current5', 'voltage5',
           'temperature5', 'torques5', 'mode5', 'reverse5', 'cartesial_sub_len', 'cartesial_sub_type', 'tcp_x', 'tcp_y',
           'tcp_z',
           'rot_x', 'rot_y', 'rot_z', 'offset_px', 'offset_py', 'offset_pz', 'offset_rotx', 'offset_roty',
           'offset_rotz',
           'configuration_sub_len', 'configuration_sub_type', 'limit_min_joint_x0', 'limit_max_joint_x0',
           'limit_min_joint_x1',
           'limit_max_joint_x1', 'limit_min_joint_x2', 'limit_max_joint_x2', 'limit_min_joint_x3', 'limit_max_joint_x3',
           'limit_min_joint_x4', 'limit_max_joint_x4', 'limit_min_joint_x5', 'limit_max_joint_x5',
           'max_velocity_joint_x0',
           'max_acc_joint_x0', 'max_velocity_joint_x1', 'max_acc_joint_x1', 'max_velocity_joint_x2', 'max_acc_joint_x2',
           'max_velocity_joint_x3', 'max_acc_joint_x3', 'max_velocity_joint_x4', 'max_acc_joint_x4',
           'max_velocity_joint_x5',
           'max_acc_joint_x5', 'default_velocity_joint', 'default_acc_joint', 'default_tool_velocity',
           'default_tool_acc', 'eq_radius',
           'dh_a_joint_x0', 'dh_a_joint_x1', 'dh_a_joint_x2', 'dh_a_joint_x3', 'dh_a_joint_x4', 'dh_a_joint_x5',
           'dh_d_joint_d0',
           'dh_d_joint_d1', 'dh_d_joint_d2', 'dh_d_joint_d3', 'dh_d_joint_d4', 'dh_d_joint_d5', 'dh_alpha_joint_x0',
           'dh_alpha_joint_x1',
           'dh_alpha_joint_x2', 'dh_alpha_joint_x3', 'dh_alpha_joint_x4', 'dh_alpha_joint_x5', 'reserver0', 'reserver1',
           'reserver2',
           'reserver3', 'reserver4', 'reserver5', 'board_version', 'control_box_type', 'robot_type', 'robot_struct',
           'masterboard_sub_len',
           'masterboard_sub_type', 'digital_input_bits', 'digital_output_bits', 'standard_analog_input_domain0',
           'standard_analog_input_domain1', 'tool_analog_input_domain', 'standard_analog_input_value0',
           'standard_analog_input_value1',
           'tool_analog_input_value', 'standard_analog_output_domain0', 'standard_analog_output_domain1',
           'tool_analog_output_domain',
           'standard_analog_output_value0', 'standard_analog_output_value1', 'tool_analog_output_value',
           'bord_temperature',
           'robot_voltage', 'robot_current', 'io_current', 'bord_safe_mode', 'is_robot_in_reduced_mode',
           'get_operational_mode_selector_input',
           'get_threeposition_enabling_device_input', 'masterboard_safety_mode', 'additional_sub_len',
           'additional_sub_type',
           'is_freedrive_button_pressed', 'reserve', 'is_freedrive_io_enabled', 'is_dynamic_collision_detect_enabled',
           'reserver',
           'tool_sub_len', 'tool_sub_type', 'tool_analog_output_domain', 'tool_analog_input_domain',
           'tool_analog_output_value',
           'tool_analog_input_value', 'tool_voltage', 'tool_output_voltage', 'tool_current', 'tool_temperature',
           'tool_mode',
           'safe_sub_len', 'safe_sub_type', 'safety_crc_num', 'safety_operational_mode', 'reserver',
           'current_elbow_position_x',
           'current_elbow_position_y', 'current_elbow_position_z', 'elbow_radius', 'tool_comm_sub_len',
           'tool_comm_sub_type', 'is_enable',
           'baudrate', 'parity', 'stopbits', 'tci_modbus_status', 'tci_usage', 'reserved0', 'reserved1', ]
confmt = 'IBIBQ???????BBdddB??IIBdddiiiffffBidddiiiffffBidddiiiffffBidddiiiffffBidddiiiffffBidddiiiffffBiIBddddddddddddIBdddddddddddddddddddddddddddddddddddddddddddddddddddddIIIIIBIIBBBdddBBBdddffffB???BIB????BIBBBddfBffBIBIbBddddIB?III?Bff'        

class RobotData():
    def __init__(self):
        self.data = {}

    def connect(self, ip, port=30001):
        try:
            self.__sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.__sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.__sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            self.__sock.settimeout(DEFAULT_TIMEOUT)
            self.hostname = ip
            self.port = port
            self.__sock.connect((self.hostname, self.port))
            self.__buf = bytes()
        except (socket.timeout, socket.error):
            self.__sock = None
            raise

    def disconnect(self):
        if self.__sock:
            self.__sock.close()
            self.__sock = None

    def get_data(self):
        while True:
            try:
                data_chunk = self.__sock.recv(4096)
                if len(data_chunk) == 0:
                    break
                self.__buf += data_chunk

                while len(self.__buf) >= 4:
                    data_length = struct.unpack(">i", self.__buf[0:4])[0]
                    if len(self.__buf) < data_length:
                        break

                    data_type = struct.unpack("B", self.__buf[4:5])[0]
                    data, self.__buf = self.__buf[0:data_length], self.__buf[data_length:]

                    if data_type == 16:
                        dic1 = {}
                        data_offset = 0
                        for i in range(len(conname)):
                            fmtsize = struct.calcsize(confmt[i])
                            data1 = data[data_offset:data_offset + fmtsize]
                            if len(data1) < fmtsize:
                                raise ValueError(
                                    f"Expected {fmtsize} bytes but got {len(data1)} bytes for {conname[i]}")

                            fmt = ">" + confmt[i]
                            dic1[conname[i]] = struct.unpack(fmt, data1)[0]
                            data_offset += fmtsize

                        self.data = dic1
                        return self.data
            except (socket.timeout, socket.error):
                self.__sock = None
                raise
        return None

    def send_data(self, mes):
        self.__sock.send(mes)

    def movel(self, position, a=1.5, v=0.7):
        if len(position) != 6:
            raise ValueError("Position must be a list of 6 elements: [x, y, z, rx, ry, rz]")
        mes = f"def mov():\r\n    movel([{position[0]},{position[1]},{position[2]},{position[3]},{position[4]},{position[5]}],a={a},v={v},t=0,r=0)\r\nend\r\n"
        self.send_data(mes.encode())

    def wait_for_motion_complete(self, target_pose, timeout=10):
        start_time = time.time()
        while time.time() - start_time < timeout:
            data = self.get_data()
            if data:
                current_pose = [
                    data['tcp_x'], data['tcp_y'], data['tcp_z'],
                    data['rot_x'], data['rot_y'], data['rot_z']
                ]
                if self.is_pose_reached(current_pose, target_pose):
                    return True
            time.sleep(0.1)
        return False

    @staticmethod
    def is_pose_reached(current_pose, target_pose, threshold=0.0001):
        return all(abs(c - t) < threshold for c, t in zip(current_pose, target_pose))


def get_tcp_pose(robot_ip):
    rb = RobotData()
    try:
        rb.connect(robot_ip)
    except Exception as e:
        print(f"Failed to connect to robot: {e}")
        socketio.emit('error', {'message': f"Failed to connect to robot: {e}"})
        exit(1)

    data = rb.get_data()
    if data:
        tcp_position = [data['tcp_x'], data['tcp_y'], data['tcp_z'], data['rot_x'], data['rot_y'], data['rot_z']]
        print("TCP Position [x, y, z, rx, ry, rz]:", tcp_position)
    else:
        print('Warning: No Data')
        tcp_position = None

    rb.disconnect()
    return tcp_position


def get_master_point():
    global pickup_point, master_points, num_layers, num_pallets, layer_config
    robot_ip = '192.168.1.200'
    
    socketio.emit('prompt', {'message': 'Press done after reaching desired master location for Pallet 1 and switch robot to Remote mode'})
    wait_for_user_input()
    master_points['left'] = get_tcp_pose(robot_ip)
    socketio.emit('info', {'message': f'Master point for Pallet 1: {master_points["left"]}'})

    if num_pallets == 2:
        socketio.emit('prompt', {'message': 'Press done after reaching desired master location for Pallet 2 and switch robot to Remote mode'})
        wait_for_user_input()
        master_points['right'] = get_tcp_pose(robot_ip)
        socketio.emit('info', {'message': f'Master point for Pallet 2: {master_points["right"]}'})

    socketio.emit('prompt', {'message': 'Press done after reaching desired pickup location'})
    wait_for_user_input()
    pickup_point = get_tcp_pose(robot_ip)
    socketio.emit('info', {'message': f'Pickup point: {pickup_point}'})
    layer_config = int(input("Enter layer configuration type (1 for same configuration every layer, 2 for odd/even configuration): "))

    return pickup_point, master_points, num_layers, num_pallets, layer_config


def calculate_pre_pickup_point(point, z_offset=0.2):
    return [point[0], point[1], point[2] + z_offset, point[3], point[4], point[5]]

def calculate_pre_place_point(point, x_offset=0.05, y_offset=0.05, z_offset=0.2):
    return [point[0] + x_offset, point[1] + y_offset, point[2] + z_offset, point[3], point[4], point[5]]


def apply_rotation(position, angle_rad):
    position[5] += angle_rad
    return position

@socketio.on('done')
def handle_done():
    user_input_event.set()

@socketio.on('pause')
def handle_pause():
    pause_event.set()
    socketio.emit('info', {'message': 'Process paused'})

@socketio.on('resume')
def handle_resume():
    pause_event.clear()
    socketio.emit('info', {'message': 'Process resumed'})

@socketio.on('stop')
def handle_stop():
    stop_event.set()
    socketio.emit('info', {'message': 'Process stopped'})

@app.route('/start-process', methods=['POST'])
def start_process():
    global pickup_point, master_points, num_layers, pallet_data, num_pallets
    pickup_point, master_points, num_layers, num_pallets, layer_config = get_master_point()

    box_coords_odd_pallet1 = pallet_data['left']['box_coords_odd']

    box_coords_even_pallet1 = pallet_data['left']['box_coords_even']

    box_coords_odd_pallet2 =   pallet_data['right']['box_coords_odd']   
    box_coords_even_pallet2 =  pallet_data['right']['box_coords_even']  
    master1_point = master_points['left']
    master2_point = master_points['right']
    
    rb = RobotData()
    try:
        rb.connect('192.168.1.200')

        max_boxes = max(len(box_coords_odd_pallet1), len(box_coords_even_pallet1), len(box_coords_odd_pallet2), len(box_coords_even_pallet2))

        initial_pre_pickup_move_done = False

        for layer in range(num_layers):
            wait_for_pause()
            if stop_event.is_set():
                break
            box_coords_pallet1 = box_coords_odd_pallet1 if layer_config == 1 or layer % 2 == 0 else box_coords_even_pallet1
            box_coords_pallet2 = box_coords_odd_pallet2 if layer_config == 1 or layer % 2 == 0 else box_coords_even_pallet2

            for i in range(max_boxes):
                wait_for_pause()
                if stop_event.is_set():
                    break
                if not initial_pre_pickup_move_done:
                    pre_pickup = calculate_pre_pickup_point(pickup_point)
                    rb.movel(pre_pickup)
                    rb.wait_for_motion_complete(pre_pickup)
                    initial_pre_pickup_move_done = True

                if i < len(box_coords_pallet1):
                    box = box_coords_pallet1[i]
                    box_abs = [master1_point[j] + box[j] for j in range(2)] + [master1_point[2]] + master1_point[3:]
                    rotation_angle = box[2]
                    pre_place = calculate_pre_place_point(box_abs)

                    rb.movel(pickup_point)
                    rb.wait_for_motion_complete(pickup_point)
                    rb.movel(pre_pickup)
                    rb.wait_for_motion_complete(pre_pickup)

                    pre_place_rotated = apply_rotation(pre_place.copy(), rotation_angle)
                    box_abs_rotated = apply_rotation(box_abs.copy(), rotation_angle)

                    rb.movel(pre_place_rotated)
                    rb.wait_for_motion_complete(pre_place_rotated)
                    rb.movel(box_abs_rotated)
                    rb.wait_for_motion_complete(box_abs_rotated)
                    rb.movel(pre_place_rotated)
                    rb.wait_for_motion_complete(pre_place_rotated)
                    rb.movel(pre_pickup)
                    rb.wait_for_motion_complete(pre_pickup)

                if num_pallets == 2 and i < len(box_coords_pallet2):
                    wait_for_pause()
                    if stop_event.is_set():
                        break
                    box = box_coords_pallet2[i]
                    box_abs = [master2_point[j] + box[j] for j in range(2)] + [master2_point[2]] + master2_point[3:]
                    rotation_angle = box[2]
                    pre_place = calculate_pre_place_point(box_abs)

                    rb.movel(pickup_point)
                    rb.wait_for_motion_complete(pickup_point)
                    rb.movel(pre_pickup)
                    rb.wait_for_motion_complete(pre_pickup)

                    pre_place_rotated = apply_rotation(pre_place.copy(), rotation_angle)
                    box_abs_rotated = apply_rotation(box_abs.copy(), rotation_angle)

                    rb.movel(pre_place_rotated)
                    rb.wait_for_motion_complete(pre_place_rotated)
                    rb.movel(box_abs_rotated)
                    rb.wait_for_motion_complete(box_abs_rotated)
                    rb.movel(pre_place_rotated)
                    rb.wait_for_motion_complete(pre_place_rotated)
                    rb.movel(pre_pickup)
                    rb.wait_for_motion_complete(pre_pickup)

            pickup_point[2] += 0
            master1_point[2] += 0.075
            if num_pallets == 2:
                master2_point[2] += 0.075
        socketio.emit('info', {'message': 'Process completed successfully'})
    except (socket.error, socket.timeout) as e:
        print(f"Socket error: {e}")
    finally:
        rb.disconnect()

    print("Pickup Point:", pickup_point)
    print("Master Point 1:", master1_point)
    if num_pallets == 2:
        print("Master Point 2:", master2_point)
    print("Number of Layers:", num_layers)
    return jsonify({'message': 'Process completed successfully'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)
