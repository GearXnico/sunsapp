import React from 'react';
import '../App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
export default LoadingScreen;