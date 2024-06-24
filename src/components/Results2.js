import React from 'react';

const Results2 = ({ coordinates,prevStep }) => {
  // Conditional rendering if no coordinates are available
  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-600">No coordinates available</h2>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous Step
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between p-4 bg-gray-100 rounded-lg shadow-lg">
      <div className="w-full p-2">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Pallet Coordinates</h2>
        <div className="space-y-4">
          {coordinates.map((coord, index) => (
            <p key={index} className="text-gray-700">{`Box ${coord.id} on Layer ${coord.layer}: (${coord.x}, ${coord.y}, ${coord.z}) meters`}</p>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Previous Step
          </button>
        </div>
      </div>
    </div>
  );
};
export default Results2;
