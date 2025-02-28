import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import TikzOutput from './components/TikzOutput';

const App = () => {
  const [tikz, setTikz] = useState('');
  const [renderedSvg, setRenderedSvg] = useState('');
  const [mode, setMode] = useState('node');

  const handleUpdate = async (diagramData) => {
    try {
      const tikzRes = await fetch('http://localhost:8000/generate_tikz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagramData),
      });
      const { tikz } = await tikzRes.json();
      setTikz(tikz);
    } catch (error) {
      console.error('Error fetching TikZ:', error);
    }
  };

  const handleRender = async () => {
    try {
      const renderRes = await fetch('http://localhost:8000/render_tikz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tikz }),
      });
      const { svg } = await renderRes.json();
      setRenderedSvg(svg);
    } catch (error) {
      console.error('Error rendering TikZ:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-blue-600 text-white text-center">
        <h1 className="text-2xl font-bold">TikZer</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Toolbar mode={mode} setMode={setMode} />
        <div className="flex-1 p-4">
          <Canvas mode={mode} onUpdate={handleUpdate} />
        </div>
        <TikzOutput tikz={tikz} renderedSvg={renderedSvg} onRender={handleRender} />
      </div>
    </div>
  );
};

export default App;