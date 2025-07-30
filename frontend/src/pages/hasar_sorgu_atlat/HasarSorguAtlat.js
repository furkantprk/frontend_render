import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCarCrash } from 'react-icons/fa';
import './HasarSorguAtlat.css';

function HasarSorguAtlat() {
    const [talepNumarasi, setTalepNumarasi] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // Page load fade-in effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleTalepNumarasiChange = (event) => {
        setTalepNumarasi(event.target.value);
        setMessage('');
    };

    const handleSorgula = async () => {
        if (!talepNumarasi.trim()) {
            setMessage('Lütfen bir talep numarası giriniz.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.get(`https://web-service1-8gnq.onrender.com/remote/hasar/sorgula/${talepNumarasi.trim()}`);

            if (response.status === 200) {
                setMessage('Kayıt başarıyla bulundu.');
            } else if (response.status === 204) {
                setMessage('Girilen talep numarasına ait kayıt bulunamadı.');
            }
        } catch (error) {
            console.error('Hasar sorgulanırken bir hata oluştu:', error);
            if (error.response) {
                // Server responded with a status other than 2xx range
                if (error.response.status === 404) {
                    setMessage('Girilen talep numarasına ait kayıt bulunamadı.');
                } else if (error.response.status === 204) {
                    setMessage('Girilen talep numarasına ait kayıt bulunamadı.');
                } else {
                    setMessage(`Sunucu hatası (${error.response.status}): İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyin.`);
                }
            } else if (error.request) {
                // Request was made but no response was received
                setMessage('Ağ hatası: Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setMessage('Bir hata oluştu: İstek gönderilemedi. Lütfen teknik destek ile iletişime geçin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`hasar-sorgu-atlat-container ${isPageLoaded ? 'fade-in' : ''}`}>
            <h1>
                <FaCarCrash className="title-icon" /> Hasar Sorgu Atlat
            </h1>

            <div className="input-section">
                <label htmlFor="talepNumarasiInput">Talep Numarası:</label>
                <input
                    type="text"
                    id="talepNumarasiInput"
                    value={talepNumarasi}
                    onChange={handleTalepNumarasiChange}
                    placeholder="Talep Numarasını Girin"
                    disabled={loading}
                />
            </div>

            <div className="button-section">
                <button onClick={handleSorgula} disabled={loading || !talepNumarasi.trim()}>
                    Hasar Sorgu Atlat
                </button>
            </div>

            {message && (
                <p className={`message ${message.includes('başarıyla bulundu') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}

            {loading && <p className="loading">Sorgulanıyor...</p>}
        </div>
    );
}

export default HasarSorguAtlat;