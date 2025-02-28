import React from 'react';

const Toolbar = ({ mode, setMode }) => {
  return (
    <div className="w-16 bg-gray-200 p-2 flex flex-col gap-2">
      <button
        className={`p-2 rounded ${mode === 'node' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        onClick={() => setMode('node')}
        title="Add Node"
      >
        N
      </button>
      <button
        className={`p-2 rounded ${mode === 'edge' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        onClick={() => setMode('edge')}
        title="Add Edge"
      >
        E
      </button>
      <button
        className={`p-2 rounded ${mode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        onClick={() => setMode('select')}
        title="Select"
      >
        S
      </button>
    </div>
  );
};

export default Toolbar;