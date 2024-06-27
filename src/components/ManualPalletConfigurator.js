import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BoxGrid from './BoxGrid';
import "./draganddrop.css"
function App({onSubmit}) {
  const [boxes, setBoxes] = useState([]);
  const [gridWidth, setGridWidth] = useState("5");
  const [gridHeight, setGridHeight] = useState("5");
  const [boxWidth, setBoxWidth] = useState("1");
  const [boxLength, setBoxLength] = useState("1");
  const [boxHeight, setBoxHeight] = useState("1");
  const [numLayers, setNumLayers] = useState(1);
  const [scaleFactorWidth, setScaleFactorWidth] = useState(100);
  const [scaleFactorLength, setScaleFactorLength] = useState(100);
  const [displayWidth, setDisplayWidth] = useState(500);
  const [displayHeight, setDisplayHeight] = useState(500);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const widthNum = Number(gridWidth);
    const heightNum = Number(gridHeight);
    let newDisplayWidth, newDisplayHeight;

    if (widthNum >= heightNum) {
      newDisplayWidth = 500;
      newDisplayHeight = Math.round((heightNum / widthNum) * 500);
    } else {
      newDisplayHeight = 500;
      newDisplayWidth = Math.round((widthNum / heightNum) * 500);
    }

    setDisplayWidth(newDisplayWidth);
    setDisplayHeight(newDisplayHeight);

    const widthScale = newDisplayWidth / (widthNum * 100);
    const heightScale = newDisplayHeight / (heightNum * 100);
    setScaleFactorWidth(widthScale * 100);
    setScaleFactorLength(heightScale * 100);
  }, [gridWidth, gridHeight]);


  useEffect(() => {
    // Update all boxes with the new dimensions
    const updatedBoxes = boxes.map(box => ({
      ...box,
      width: Number(boxWidth),
      height: Number(boxHeight),
      length: Number(boxLength),
    }));
    setBoxes(updatedBoxes);
  }, [boxWidth, boxHeight,boxLength]);

  const addBox = () => {
    const newBox = {
      id: nextId,
      x: 10,
      y: 10,
      width: Number(boxWidth),
      length: Number(boxLength),  // Changed to boxLength
      height: Number(boxHeight),
      layer: 1  // Default to layer 1
    };
    setBoxes([...boxes, newBox]); 
    setNextId(nextId + 1);
  };

  
  const boxesOverlap = (box1, box2) => {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.length &&
      box1.y + box1.length > box2.y
    );
  };
  const moveBox = (id, x, y) => {
    const movingBox = boxes.find(box => box.id === id);
    const scaledWidth = movingBox.width * scaleFactorWidth;
    const scaledLength = movingBox.length * scaleFactorLength;
    let newX = Math.max(0, Math.min(Number(gridWidth) * scaleFactorWidth - scaledWidth, x));
    let newY = Math.max(0, Math.min(Number(gridHeight) * scaleFactorLength - scaledLength, y));
  
    const alignmentThreshold = 15; // pixels within which boxes will snap to each other
    let snapX = newX;
    let snapY = newY;
  
    // Iterate through all boxes to find the closest edge within the threshold and check for overlap
    boxes.forEach(otherBox => {
      if (otherBox.id !== id) {
        const otherX = otherBox.x;
        const otherY = otherBox.y;
        const otherWidth = otherBox.width * scaleFactorWidth;
        const otherLength  = otherBox.length * scaleFactorLength;
  
        // Magnetic alignment calculations
        if (Math.abs(newX + scaledWidth - otherX) < alignmentThreshold) {
          snapX = otherX - scaledWidth;
        } else if (Math.abs(newX - (otherX + otherWidth)) < alignmentThreshold) {
          snapX = otherX + otherWidth;
        }
  
        if (Math.abs(newY + scaledLength - otherY) < alignmentThreshold) {
          snapY = otherY - scaledLength;
        } else if (Math.abs(newY - (otherY + otherLength)) < alignmentThreshold) {
          snapY = otherY + otherLength;
        }
      }
    });
  
    // Use the snapped coordinates if they do not cause an overlap
    const testPosition = { ...movingBox, x: snapX, y: snapY, width: scaledWidth, length: scaledLength };
    const overlapExists = boxes.some(otherBox =>
      otherBox.id !== id && boxesOverlap(testPosition, {
        ...otherBox,
        x: otherBox.x,
        y: otherBox.y,
        width: otherBox.width * scaleFactorWidth,
        length: otherBox.length * scaleFactorLength
      })
    );
  
    // Update the box position only if there is no overlap
    if (!overlapExists) {
      setBoxes(boxes.map(box => {
        if (box.id === id) {
          return { ...box, x: snapX, y: snapY };
        }
        return box;
      }));
    } else {
      console.error("Overlap detected, move not allowed. Trying to move Box", id, "to", newX, newY);
    }
  };
  
  
  
  

  const rotateBox = (id) => {
    setBoxes(boxes.map(box => {
      if (box.id === id) {
        return { ...box, width: box.length, length: box.width,rotate:!box.rotate };
      }
      return box;
    }));
    console.log(boxes);
  };

  const removeBox = id => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  

  const submitBoxes = () => {
    const coordinates = boxes.map(box => {
      const results = [];
      for (let layer = 1; layer <= numLayers; layer++) {
        const z = box.height * (layer - 0.5);  // Calculate center Z for each layer
        const xCenter = ((box.x + (box.width * scaleFactorWidth / 2)) / scaleFactorWidth).toFixed(3);
        const yCenter = ((box.y + (box.length * scaleFactorLength / 2)) / scaleFactorLength).toFixed(3);
        results.push({
          id: box.id,
          layer: layer,
          x: parseFloat(xCenter),
          y: parseFloat(yCenter),
          z: parseFloat(z),
          width: box.width,
          height: box.height,
          length: box.length,
          totalLayers: numLayers,
        });
      }
      return results;
    }).flat(); // Flatten the array if multiple layers produce multiple entries per box
    
    // Call the onSubmit function passed via props with the necessary data
    onSubmit({
      coordinates: coordinates,
      gridWidth: parseFloat(gridWidth),
      gridHeight: parseFloat(gridHeight)
    });
    console.log(boxes)
  };
  
  


  const handleDimensionChange = (setter) => (e) => {
    const value = e.target.value.replace(/^0+/, '') || ''; // Allows empty string
    setter(value);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-1 justify-between px-4 pt-2 bg-gray-100 rounded-lg shadow-lg w-3/4 mx-auto flex-wrap">
        <div className=" p-2 flex flex-col">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Manual Pallet Configuration</h2>
          <p className="mb-4 text-gray-700">Enter the width, length, height, and weight of each unit below.</p>
          <div className="form-controls space-y-4">

            <div>
              <label className="text-lg font-semibold text-gray-800">Box Dimensions (in meters)</label>
              <div className="flex space-x-2">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-600">Width</label>
                  <input type="number" value={boxWidth} onChange={(e) => setBoxWidth(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-600">Length</label>
                  <input type="number" value={boxLength} onChange={(e) => setBoxLength(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-600">Height</label>
                  <input type="number" value={boxHeight} onChange={(e) => setBoxHeight(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
            </div>
            <div>
              <label className="text-lg font-semibold text-gray-800">Grid Dimensions (in meters)</label>
              <div className="flex space-x-2">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-600">Width</label>
                  <input type="number" value={gridWidth} onChange={(e) => setGridWidth(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-600">Height</label>
                  <input type="number" value={gridHeight} onChange={(e) => setGridHeight(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <label className="text-lg font-semibold text-gray-800">Number of Layers</label>
              <input type="number" value={numLayers} onChange={(e) => setNumLayers(e.target.value)} className="input w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="flex justify-between mt-5">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={addBox}>Add Box</button>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={submitBoxes}>Submit Boxes</button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-2">
          <BoxGrid
            boxes={boxes}
            gridWidth={displayWidth}
            gridHeight={displayHeight}
            moveBox={moveBox}
            rotateBox={rotateBox}
            removeBox={removeBox}
            scaleFactorWidth={scaleFactorWidth} // Adjusted for display
            scaleFactorLength={scaleFactorLength} // Adjusted for display
          />
        </div>
      </div>
    </DndProvider>
  );
}  
  

export default App;
