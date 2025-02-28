import React, { useState } from 'react';

const TikzOutput = ({ tikz, renderedSvg, onRender }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-1/4 bg-white p-4 border-l border-gray-300 overflow-auto">
      {/* Rendered Output First */}
      <h2 className="text-lg font-semibold mb-2">Rendered Output</h2>
      <div className="p-2 border rounded bg-white mb-4">
        {renderedSvg ? (
          <img src={renderedSvg} alt="Rendered TikZ" className="max-w-full" />
        ) : (
          'Click "Render" to see the output'
        )}
      </div>
      <button
        onClick={onRender}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        Render
      </button>
      
      {/* TikZ Code Second */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">TikZ Code</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
          {tikz || '// Draw some nodes and edges to generate TikZ code'}
        </pre>
      )}
    </div>
  );
};

export default TikzOutput;