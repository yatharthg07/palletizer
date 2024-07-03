import React from 'react';
import { useDrag } from 'react-dnd';
import { CircleArrowRight,RotateCw,X } from 'lucide-react';
import "./draganddrop.css"

const Box = ({ id, x, y, boxWidth, boxLength, moveBox, rotateBox, removeBox, rotate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'box',
    item: { id, x, y },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (item && delta) {
        const newX = Math.round(x + delta.x);
        const newY = Math.round(y + delta.y);
        moveBox(item.id, newX, newY);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [id, x, y, moveBox]);

  const getLabelStyle = () => {
    console.log(rotate);
    switch (rotate) {
      case 0: // Initial state, arrow on right
        return { right: '0px', top: '50%', transform: 'translateY(-50%)' };
      case 1: // First rotation, arrow on bottom
        return { bottom: '0px', left: '50%', transform: 'translateX(-50%) rotate(90deg)' };
      case 2: // Second rotation, arrow on left
        return { left: '0px', top: '50%', transform: 'translateY(-50%) rotate(180deg)' };
      case 3: // Third rotation, arrow on top
        return { top: '0px', left: '50%', transform: 'translateX(-50%) rotate(270deg)' };
      default:
        return { right: '6px', top: '50%', transform: 'translateY(-50%)' };
    }
  };


  return (
    <div 
      ref={drag} 
      style={{
        left: x, 
        top: y,
        width: `${boxWidth}px`, 
        height: `${boxLength}px`,
      }} 
      className="box"
    >
      <div className="box-content">
        <span className="box-id">Box {id}</span>
      </div>
      <div className="box-controls">
        <button onClick={(e) => { e.stopPropagation(); rotateBox(id); }} className="control-btn rotate-btn" aria-label="Rotate">
          <RotateCw size={10} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); removeBox(id); }} className="control-btn remove-btn" aria-label="Remove">
          <X size={10} />
        </button>
      </div>
      <div className="front-label" style={getLabelStyle()}>
        <CircleArrowRight size={16} />
      </div>
    </div>
  );
};

export default Box;