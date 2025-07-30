// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import RehinDurumYonetimi from './pages/rehin_durum_yonetimi/RehinDurumYonetimi';
import HasarSorguAtlat from './pages/hasar_sorgu_atlat/HasarSorguAtlat';
import './App.css';
import { FaHome, FaCarCrash, FaFileAlt } from 'react-icons/fa'; // FaFileAlt ikonunu import ettik

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/">
                <FaHome size={20} /> Ana Sayfa
              </Link>
            </li>
            <li>
              <Link to="/rehin-yonetimi">
                <FaFileAlt size={20} /> Rehin Durum Yönetimi {/* İkon eklendi */}
              </Link>
            </li>
            <li>
              <Link to="/hasar-sorgu-atlat">
                <FaCarCrash size={20} /> Hasar Sorgu Atlat
              </Link>
            </li>
          </ul>
        </nav>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rehin-yonetimi" element={<RehinDurumYonetimi />} />
            <Route path="/hasar-sorgu-atlat" element={<HasarSorguAtlat />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;