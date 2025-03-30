import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ZinsCalculator from './components/ZinsCalculator';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="container mx-auto py-8">
      <ZinsCalculator />
    </div>
  </React.StrictMode>
);
