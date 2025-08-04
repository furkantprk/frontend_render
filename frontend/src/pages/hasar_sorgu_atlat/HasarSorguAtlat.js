import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCarCrash } from 'react-icons/fa';
import './HasarSorguAtlat.css';

function HasarSorguAtlat() {
    const [talepNumarasi, setTalepNumarasi] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

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
            // GÜNCELLENMİŞ AXIOS İSTEĞİ: Yalnızca kredi numarası ile yeni endpoint'i kullanıyor
            const response = await axios.delete(
                `https://web-service1-8gnq.onrender.com/remote/urunler/delete-and-reinsert-state-info-by-kredi/${talepNumarasi}`
            );

            if (response.status === 200) {
                setMessage('Kayıt başarıyla işlendi ve güncellendi.');
            }
        } catch (error) {
            console.error('Hasar sorgulanırken bir hata oluştu:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    setMessage('Girilen talep numarasına ait kayıt bulunamadı.');
                } else if (error.response.status === 500) {
                    setMessage(`Sunucu hatası (${error.response.status}): ${error.response.data || 'İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyin.'}`);
                } else {
                    setMessage(`Bir hata oluştu (${error.response.status}): ${error.response.data || 'İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyin.'}`);
                }
            } else if (error.request) {
                setMessage('Ağ hatası: Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
            } else {
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
                <label htmlFor="talepNumarasiInput">Talep Numarası (Kredi Numarası):</label>
                <input
                    type="text"
                    id="talepNumarasiInput"
                    value={talepNumarasi}
                    onChange={handleTalepNumarasiChange}
                    placeholder="Kredi Numarasını Girin"
                    disabled={loading}
                />
            </div>

            <div className="button-section">
                <button onClick={handleSorgula} disabled={loading || !talepNumarasi.trim()}>
                    Hasar Sorgu Atlat
                </button>
            </div>

            {message && (
                <p className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}

            {loading && <p className="loading">Sorgulanıyor...</p>}
        </div>
    );
}

export default HasarSorguAtlat;