import React from 'react';

const Results = ({ prevStep }) => {
  // Placeholder data, replace with actual calculation logic later
  const resultsData = {
    totalDimensions: '120 x 80 x 150 cm',
    totalWeight: '500 kg',
    totalHeight: '150 cm',
    unitsPerLayer: 10,
    totalUnits: 100,
    surfaceUsage: '85%',
  };

  return (
    <div className="flex justify-between p-4 bg-gray-100 rounded-lg shadow-lg">
      <div className="w-full p-2">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Pallet Specifications</h2>
        <p className="mb-4 text-gray-700">At this final step, you receive a full list of specifications for your pallet including:</p>

        <div className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-800">Total Dimensions:</label>
            <p className="text-gray-700">{resultsData.totalDimensions}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800">Total Weight:</label>
            <p className="text-gray-700">{resultsData.totalWeight}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800">Total Height:</label>
            <p className="text-gray-700">{resultsData.totalHeight}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800">Units per Layer:</label>
            <p className="text-gray-700">{resultsData.unitsPerLayer}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800">Total Number of Units:</label>
            <p className="text-gray-700">{resultsData.totalUnits}</p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800">Surface Usage:</label>
            <p className="text-gray-700">{resultsData.surfaceUsage}</p>
          </div>
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

export default Results;
