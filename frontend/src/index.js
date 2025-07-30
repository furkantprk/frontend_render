import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18 ve sonrası için önerilen
import './index.css'; // İsteğe bağlı, global stiller
import App from './App';
import reportWebVitals from './reportWebVitals'; // Performans ölçümü için (isteğe bağlı)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Uygulamanızın performansını ölçmek istiyorsanız veya bir analiz endpoint'ine göndermek istiyorsanız:
// console.log'a kaydetmek için (örn. reportWebVitals(console.log))
// veya bir analiz endpoint'ine göndermek için öğrenin: https://bit.ly/CRA-vitals
reportWebVitals();