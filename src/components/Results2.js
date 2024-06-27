import React from "react";
import Visual from "./VIsual";

const Results2 = ({ coordinates, palletDimensions, prevStep }) => {
  const sendCoordinatesToRobot = async () => {
    try {
      const response = await fetch('http://localhost:5000/send-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates })
      });
      const data = await response.json();
      console.log('Server response:', data);
      alert('Coordinates sent successfully!');
    } catch (error) {
      console.error('Failed to send coordinates:', error);
      alert('Failed to send coordinates.');
    }
  };
  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-600">No coordinates available</h2>
        <button
          type="button"
          onClick={prevStep}
          className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Previous Step
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-600 mb-2">Pallet Coordinates</h2>
      <div className="space-y-4 mb-4">
        {coordinates.map((coord, index) => (
          <p key={index} className="text-gray-700">{`Box ${coord.id} on Layer ${coord.layer}: (${coord.x}, ${coord.y}, ${coord.z}) meters`}</p>
        ))}
      </div>
      <Visual palletDimensions={palletDimensions} coordinates={coordinates} />
      <button
    className="px-3 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Save Configuration
  </button>
      <button
    type="button"
    onClick={prevStep}
    className="px-3 py-1 bg-gray-300 text-gray-800 font-bold rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
  >
    Previous Step
  </button>
  <button
        type="button"
        onClick={sendCoordinatesToRobot}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send to Robot
      </button>
  
    </div>
  );
};

export default Results2;
