import React from 'react';

// Function to calculate the scale factor based on max dimensions to fit in a fixed SVG area
const calculateScale = (width, height, maxWidth, maxHeight) => {
  const scaleX = maxWidth / width;
  const scaleY = maxHeight / height;
  return Math.min(scaleX, scaleY);
};

const PalletVisualization = ({ pallet, boxes }) => {
  const maxWidth = 800; // Maximum width for top view
  const maxHeight = 400; // Maximum height for top view
  const maxLayerHeight = 200; // Maximum height for side view
  const margin = 20;
  
  const scale = calculateScale(pallet.width, pallet.height, maxWidth - margin * 2, maxHeight - margin * 2);
  const layerScale = maxLayerHeight / Math.max(...boxes.map(box => box.z)); // Scaling for side view
  
  const svgWidth = maxWidth;
  const svgHeight = maxHeight + margin * 3; // Extra space for side view and labels

  return (
    <svg width={svgWidth} height={svgHeight}>
      {/* Top View */}
      <text x={margin} y={margin - 5}>Top View</text>
      <rect x={margin} y={margin} width={pallet.width * scale} height={pallet.height * scale} fill="#f4deb3" stroke="#886a49" />
      {boxes.map((box, index) => (
        <rect
          key={`top-${index}`}
          x={margin + (box.x - box.width / 2) * scale}
          y={margin + (box.y - box.length / 2) * scale}
          width={box.width * scale}
          height={box.length * scale}
          fill="#d9cbb3"
          stroke="#7a5b34"
        />
      ))}

      {/* Side View */}
      {/* <text x={margin} y={maxHeight + margin * 2 - 5}>Side View</text>
      <rect 
        x={margin} 
        y={maxHeight + margin * 2} 
        width={pallet.width * scale} 
        height={maxLayerHeight} 
        fill="#f4deb3" 
        stroke="#886a49" 
      />
      {boxes.map((box, index) => (
        <rect
          key={`side-${index}`}
          x={margin + (box.x - box.width / 2) * scale}
          y={maxHeight + margin * 2 + (Math.max(...boxes.map(b => b.z)) - box.z) * layerScale}
          width={box.width * scale}
          height={box.height * layerScale}
          fill="#d9cbb3"
          stroke="#7a5b34"
        />
      ))} */}
    </svg>
  );
};

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
      <PalletVisualization pallet={palletDimensions} boxes={coordinates} />
      <button
        type="button"
        onClick={prevStep}
        className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
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
