import React from 'react';
import './App.css';
import VideoChat from './VideoChat';

const App = () => {
  return (
      <div className="app">
        <header>
          <h1>Video Chat with Hooks</h1>
        </header>
        <main>
          <VideoChat />
        </main>
        {/*<footer>*/}
        {/*  */}
        {/*</footer>*/}
      </div>
  );
};

export default App;