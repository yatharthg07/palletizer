import React from 'react';
import Box from './Box';
import "./draganddrop.css"

const BoxGrid = ({ boxes, moveBox, rotateBox, removeBox, gridWidth, gridHeight, scaleFactorWidth, scaleFactorLength }) => {
  // Constants for the original SVG design
  const rectHeight = 70;  // Height of each rectangle
  const spaceBetween = 90;  // Space between the top of one rectangle to the top of the next

  // Calculate scale factors based on grid dimensions
  const scaleX = gridWidth / 492;  // Assuming original SVG width was 492
  const scaleY = gridHeight / 492;  // Assuming original SVG height was 492
  
  //Validate gridWidth and gridHeight
  if (gridWidth <= 0 || gridHeight <= 0) {
    return (
      <div className="grid" style={{ width: `${Math.max(1, gridWidth)}px`, height: `${Math.max(1, gridHeight)}px` }}>
        <p></p>
      </div>
    );
  }

  // Calculate dynamic dimensions and positions
  const calculateSize = (size) => Math.max(1, Math.round(size * Math.min(scaleX, scaleY)));
  const calculatePosition = (pos) => Math.max(0, Math.round(pos * Math.min(scaleX, scaleY)));

  // Determine how many rectangles can fit vertically
  const calculatedSpaceBetween = calculateSize(spaceBetween);
  const numberOfRectangles = calculatedSpaceBetween > 0 
    ? Math.max(1, Math.min(
        Math.floor((gridHeight - calculatePosition(20)) / calculatedSpaceBetween),
        Math.floor(gridHeight / 10)  // Limit based on grid height
      ))
    : 1;

  // Generate positions for rectangles
  const yPosArray = Array.from({ length: numberOfRectangles }, (_, i) => 20 + i * spaceBetween);

  return (
    <div className="grid" style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}>
      <svg width={gridWidth} height={gridHeight} viewBox={`0 0 ${gridWidth} ${gridHeight}`} xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width={gridWidth} height={gridHeight} fill="#F3E0B2"/>
        {yPosArray.map((y, index) => (
          <rect key={index} x={calculatePosition(20)} y={calculatePosition(y)} width={gridWidth - calculateSize(40)} height={calculateSize(rectHeight)} fill="#D2A673"/>
        ))}
        {yPosArray.map((y, index) => (
          <React.Fragment key={index}>
            <circle cx={calculatePosition(46)} cy={calculatePosition(y + rectHeight / 2)} r={calculateSize(10)} fill="#7A5B34"/>
            <circle cx={gridWidth - calculatePosition(46)} cy={calculatePosition(y + rectHeight / 2)} r={calculateSize(10)} fill="#7A5B34"/>
          </React.Fragment>
        ))}
      </svg>
      {boxes.map(box => (
        <Box
          key={box.id}
          id={box.id}
          x={box.x}
          y={box.y}
          boxWidth={box.width * scaleFactorWidth}
          boxLength={box.length * scaleFactorLength}
          moveBox={moveBox}
          rotateBox={rotateBox}
          removeBox={removeBox}
          rotate={box.rotate}
        />
      ))}
    </div>
  );
};

export default BoxGrid;