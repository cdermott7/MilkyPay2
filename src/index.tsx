import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';

// Render the Router component which includes our App
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);