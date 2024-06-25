# palletbackend.py
import sys
import json

def handle_coordinates(coordinates):
    # Initialize an empty list to store [x, y, z] coordinates of boxes on layer 1
    box_coords_layer_1 = []

    # Initialize variables for height and number of layers
    # We'll just take these from the first item assuming all are the same
    height = None
    num_layers = None

    for coord in coordinates:
        if coord['layer'] == 1:  # Check if the box is on layer 1
            box_coords_layer_1.append([coord['x'], coord['y'], 0])
        
        # Since all boxes have the same height and total layers, we only set this once
        if height is None or num_layers is None:
            height = coord['height']
            num_layers = coord['totalLayers']



    # Here, you can return these values if you need to use them elsewhere
    return box_coords_layer_1, height, num_layers

if __name__ == "__main__":
    # Assume input comes as a JSON string through standard input
    input_str = sys.stdin.read()
    data = json.loads(input_str)
    box_coords_layer_1, height, num_layers= handle_coordinates(data['coordinates'])
    print("Coordinates of boxes on Layer 1:", box_coords_layer_1)
    print("Height of each box:", height)
    print("Total number of layers:", num_layers)
