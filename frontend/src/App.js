// dosya: App.jsx
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import RehinDurumYonetimi from "./pages/rehin_durum_yonetimi/RehinDurumYonetimi"
import HasarSorguAtlat from "./pages/hasar_sorgu_atlat/HasarSorguAtlat"
import EvrakDurumGuncelle from "./pages/evrak_durum_guncelle/EvrakDurumGuncelle"
import GunKapama from "./pages/gun_kapama/GunKapama"
import "./App.css"
import { FaHome, FaCarCrash, FaFileAlt, FaClipboardList, FaCalendarAlt } from "react-icons/fa"

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
                <FaFileAlt size={20} /> Rehin Durum Yönetimi
              </Link>
            </li>
            <li>
              <Link to="/hasar-sorgu-atlat">
                <FaCarCrash size={20} /> Hasar Sorgu Atlat
              </Link>
            </li>
            <li>
              <Link to="/evrak-durum-guncelle">
                <FaClipboardList size={20} /> Evrak Durum Güncelle
              </Link>
            </li>
            <li>
              <Link to="/kapanan-gun">
                <FaCalendarAlt size={20} /> Gün Kapama
              </Link>
            </li>
          </ul>
        </nav>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rehin-yonetimi" element={<RehinDurumYonetimi />} />
            <Route path="/hasar-sorgu-atlat" element={<HasarSorguAtlat />} />
            <Route path="/evrak-durum-guncelle" element={<EvrakDurumGuncelle />} />
            <Route path="/kapanan-gun" element={<GunKapama />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
