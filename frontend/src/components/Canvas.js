import React, { useRef, useEffect, useState } from 'react';
import { Canvas, Circle, Line } from 'fabric';

const CanvasComponent = ({ mode, onUpdate }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const startNodeRef = useRef(null);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f9fafb',
    });
    fabricCanvasRef.current = canvas;

    canvas.on('object:moving', () => updateEdgesAndLabels(canvas));
    canvas.on('object:scaling', () => updateEdgesAndLabels(canvas));

    return () => canvas.dispose();
  }, []);

  // Function to typeset MathJax after labels have been updated
  useEffect(() => {
    if (window.MathJax && labels.length > 0) {
      window.MathJax.typesetPromise && window.MathJax.typesetPromise();
    }
  }, [labels]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt) => {
      const { x, y } = canvas.getPointer(opt.e);

      if (mode === 'node') {
        const node = new Circle({
          left: x,
          top: y,
          radius: 10,
          fill: 'lightgray',
          stroke: 'black',
          strokeWidth: 0.5,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
        });
        node.id = `N${canvas.getObjects().length + 1}`;
        node.label = node.id;
        canvas.add(node);
        setLabels(prev => [...prev, { id: node.id, text: node.label, x, y: y - 20 }]);
        canvas.renderAll();
        onUpdate(getDiagramData(canvas));
      } else if (mode === 'edge') {
        const target = opt.target;
        if (!startNodeRef.current && target && target.type === 'circle') {
          startNodeRef.current = target;
          target.set({ fill: 'yellow' });
          canvas.renderAll();
        } else if (startNodeRef.current) {
          let endNode = target && target.type === 'circle' ? target : null;
          if (!endNode) {
            endNode = new Circle({
              left: x,
              top: y,
              radius: 10,
              fill: 'lightgray',
              stroke: 'black',
              strokeWidth: 0.5,
              originX: 'center',
              originY: 'center',
              selectable: true,
              hasControls: true,
            });
            endNode.id = `N${canvas.getObjects().length + 1}`;
            endNode.label = endNode.id;
            canvas.add(endNode);
            setLabels(prev => [...prev, { id: endNode.id, text: endNode.label, x, y: y - 20 }]);
          }
          if (endNode !== startNodeRef.current) {
            const edge = new Line([startNodeRef.current.left, startNodeRef.current.top, endNode.left, endNode.top], {
              stroke: 'black',
              strokeWidth: 1.5,
              selectable: false,
            });
            edge.startId = startNodeRef.current.id;
            edge.endId = endNode.id;
            canvas.add(edge);
            canvas.sendObjectToBack(edge);
          }
          startNodeRef.current.set({ fill: 'lightgray' });
          startNodeRef.current = null;
          canvas.renderAll();
          onUpdate(getDiagramData(canvas));
        }
      }
    };

    const handleDoubleClick = (opt) => {
      const target = opt.target;
      if (target && target.type === 'circle') {
        const newLabel = prompt('Enter node label (use $ for inline math, $$ for display math):', target.label) || target.label;
        target.label = newLabel;
        setLabels(prev => prev.map(l => l.id === target.id ? { ...l, text: newLabel } : l));
        canvas.renderAll();
        onUpdate(getDiagramData(canvas));
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:dblclick', handleDoubleClick);
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:dblclick', handleDoubleClick);
    };
  }, [mode, onUpdate]);

  const updateEdgesAndLabels = (canvas) => {
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'line') {
        const startNode = objects.find(n => n.id === obj.startId);
        const endNode = objects.find(n => n.id === obj.endId);
        if (startNode && endNode) {
          obj.set({
            x1: startNode.left,
            y1: startNode.top,
            x2: endNode.left,
            y2: endNode.top,
          });
        }
      } else if (obj.type === 'circle') {
        setLabels(prev => prev.map(l => l.id === obj.id ? { ...l, x: obj.left, y: obj.top - 20 } : l));
      }
    });
    canvas.renderAll();
    onUpdate(getDiagramData(canvas));
  };

  const getDiagramData = (canvas) => ({
    nodes: canvas.getObjects('circle').map(n => ({
      id: n.id,
      x: n.left,
      y: 600 - n.top,
      label: n.label,
      radius: n.radius * n.scaleX,
      math_mode: n.label.includes('$'), // Flag for math mode (either $ or $$)
    })),
    edges: canvas.getObjects('line').map(e => ({
      startId: e.startId,
      endId: e.endId,
      directed: false,
    })),
  });

  return (
    <div ref={wrapperRef} className="relative">
      <canvas ref={canvasRef} className="border border-gray-300 shadow-md" />
      {labels.map(label => (
        <div
          key={label.id}
          style={{
            position: 'absolute',
            left: `${label.x}px`,
            top: `${label.y}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '2px',
            borderRadius: '2px',
          }}
        >
          {label.text.includes('$') ? (
            label.text
          ) : (
            label.text
          )}
        </div>
      ))}
    </div>
  );
};

export default CanvasComponent;