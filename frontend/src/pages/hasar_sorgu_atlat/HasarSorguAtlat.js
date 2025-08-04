import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCarCrash } from 'react-icons/fa';
import './HasarSorguAtlat.css';

function HasarSorguAtlat() {
    const [krediNumarasi, setKrediNumarasi] = useState('');
    const [availableSiralar, setAvailableSiralar] = useState([]); // Sıra numaraları için state
    const [selectedSira, setSelectedSira] = useState(''); // Seçilen sıra numarası için state
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleKrediNumarasiChange = (event) => {
        setKrediNumarasi(event.target.value);
        setMessage('');
        setAvailableSiralar([]); // Kredi numarası değiştiğinde sıraları temizle
        setSelectedSira('');    // Seçili sırayı temizle
    };

    const handleSiraChange = (event) => {
        setSelectedSira(event.target.value);
        setMessage('');
    };

    const fetchSiralar = async () => {
        if (!krediNumarasi.trim()) {
            setMessage('Lütfen bir kredi numarası giriniz.');
            return;
        }

        setLoading(true);
        setMessage('');
        setAvailableSiralar([]);
        setSelectedSira('');

        try {
            const response = await axios.get(
                `https://web-service1-8gnq.onrender.com/remote/urunler/siralar/${krediNumarasi}`
            );
            if (response.status === 200 && response.data.length > 0) {
                setAvailableSiralar(response.data);
                setMessage('Sıra bilgileri başarıyla getirildi.');
            } else if (response.status === 200 && response.data.length === 0) {
                setMessage('Bu kredi numarasına ait sıra bulunamadı.');
            } else {
                setMessage('Sıra numaraları getirilirken bir sorun oluştu.');
            }
        } catch (error) {
            console.error('Sıra numaraları getirilirken hata oluştu:', error);
            setAvailableSiralar([]);
            if (error.response && error.response.status === 404) {
                setMessage('Bu kredi numarasına ait sıra bulunamadı.');
            } else {
                setMessage('Sıra numaraları getirilirken bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSorgula = async () => {
        if (!krediNumarasi.trim()) {
            setMessage('Lütfen bir kredi numarası giriniz.');
            return;
        }
        if (availableSiralar.length > 0 && selectedSira === '') {
            setMessage('Lütfen bir sıra numarası seçiniz veya "Tümünü Seç"i işaretleyiniz.');
            return;
        }

        setLoading(true);
        setMessage('');

        let url = `https://web-service1-8gnq.onrender.com/remote/urunler/delete-and-reinsert-state-info-by-kredi?krediNumarasi=${krediNumarasi}`;

        if (selectedSira !== '' && selectedSira !== 'all') {
            url += `&sira=${selectedSira}`;
        }

        try {
            const response = await axios.delete(url);

            if (response.status === 200) {
                setMessage(response.data);
                setSelectedSira(''); // Clear selection after successful operation
            }
        } catch (error) {
            console.error('Hasar sorgulanırken bir hata oluştu:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    setMessage(`Kayıt bulunamadı: ${error.response.data || 'Girilen bilgilere ait kayıt bulunamadı.'}`);
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
                <label htmlFor="krediNumarasiInput">Kredi Numarası:</label>
                <input
                    type="text"
                    id="krediNumarasiInput"
                    value={krediNumarasi}
                    onChange={handleKrediNumarasiChange}
                    placeholder="Kredi Numarasını Girin"
                    disabled={loading}
                />
                <button onClick={fetchSiralar} disabled={loading || !krediNumarasi.trim()}>
                    Bilgileri Getir
                </button>
            </div>

            {message && (
                <p className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}

            {loading && <p className="loading">Sorgulanıyor...</p>}

            {availableSiralar.length > 0 && (
                <>
                    <div className="input-section">
                        <label htmlFor="siraSelect">Sıra Seç:</label>
                        <select
                            id="siraSelect"
                            value={selectedSira}
                            onChange={handleSiraChange}
                            disabled={loading}
                        >
                            <option value="">-- Sıra Seç --</option>
                            <option value="all">Tümünü Seç</option>
                            {availableSiralar.map((sira) => (
                                <option key={sira} value={sira}>
                                    {sira}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="button-section">
                        <button
                            onClick={handleSorgula}
                            disabled={loading || !krediNumarasi.trim() || (availableSiralar.length > 0 && selectedSira === '')}
                        >
                            Hasar Sorgu Atlat
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default HasarSorguAtlat;