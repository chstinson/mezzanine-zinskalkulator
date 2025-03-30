// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import ZinsCalculator from './ZinsCalculator';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="container mx-auto py-8">
      <ZinsCalculator />
    </div>
  </React.StrictMode>
);
