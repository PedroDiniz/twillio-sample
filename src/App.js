import React from 'react';
import './App.css';
import VideoChat from './pages/VideoChat';

const App = () => {
  return (
    <div style={{background: "#44475a"}} className="app">
      <header>
        <h1>Twilio</h1>
      </header>
      <main style={{background: "#44475a"}}>
        <VideoChat />
      </main>
    </div>
  );
};

export default App;
