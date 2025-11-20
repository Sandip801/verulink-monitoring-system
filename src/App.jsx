import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;

