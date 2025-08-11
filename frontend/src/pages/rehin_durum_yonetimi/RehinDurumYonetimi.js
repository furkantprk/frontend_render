import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt } from 'react-icons/fa'; // Kağıt benzeri bir ikon ekledik
import './RehinDurumYonetimi.css'; // Stil dosyasını dahil ediyoruz

function RehinDurumYonetimi() {
    const [krediNumarasi, setKrediNumarasi] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [krediBilgileri, setKrediBilgileri] = useState([]);
    const [selectedSira, setSelectedSira] = useState('');
    const [newRehinDurum, setNewRehinDurum] = useState('');
    const [isPageLoaded, setIsPageLoaded] = useState(false); // Sayfa yükleme efekti için

    // Sayfa yüklendiğinde fade-in efekti için
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Rehin durumu seçenekleri ve açıklamaları
    const rehinDurumuOptions = [
        { value: '1', label: '1- Kesin Rehin' },
        { value: '2', label: '2- Ön Rehin' },
        { value: '3', label: '3- Ön Rehin Sonrası Kesin Rehin' },
        { value: '4', label: '4- Kesin Rehin Konulmadı' },
        { value: '5', label: '5- Ön Rehin Konulmadı/Ruhsat Çıkmış' },
        { value: '6', label: '6- Ön Rehin Kesin Rehine Dönmedi' },
        { value: '7', label: '7- Manuel Rehin (Eski)' },
        { value: '8', label: '8- Manuel Rehin' },
        { value: '9', label: '9- Manuel Rehin (Yeni)' },
        { value: '10', label: '10- Manuel Rehin (EGM)' },
        { value: '11', label: '11- Daha Sonra OR Yapılacak' },
        { value: '12', label: '12- Daha Sonra KR Yapılacak' },
        { value: '13', label: '13- Kısmi Ödeme Ön Rehin İptal' },
        { value: '14', label: '14- Ön Rehin Konulmadı/Araç Bilgileri Doğrulanmadı' },
        { value: '15', label: '15- Rehin Kaldırıldı - KT Öncesi' },
        { value: '16', label: '16- Rehin Kaldırıldı - İcra Satışı' },
        { value: '17', label: '17- Müsadere Edildi' },
        { value: '20', label: '20- Rehin Kaldırıldı' },
    ];

    const getRehinDurumuLabel = (value) => {
        const option = rehinDurumuOptions.find(opt => opt.value === String(value));
        return option ? option.label : (value !== null ? value : 'Boş');
    };

    const handleKrediNumarasiChange = (event) => {
        setKrediNumarasi(event.target.value);
        setMessage('');
        setKrediBilgileri([]);
        setSelectedSira('');
        setNewRehinDurum('');
    };

    const fetchKrediBilgileri = async () => {
        if (!krediNumarasi) {
            setMessage('Lütfen bir kredi numarası girin.');
            return;
        }

        setLoading(true);
        setMessage('');
        setNewRehinDurum('');

        try {
            const response = await axios.get(`https://web-service1-8gnq.onrender.com/remote/urunler/kredi/${krediNumarasi}`);

            if (response.status === 200) {
                setKrediBilgileri(response.data);
                setMessage('Kredi bilgileri başarıyla getirildi.');

                if (selectedSira === 'all') {
                    // "Tümünü Seç" zaten seçiliyorsa değiştirmeyin
                } else {
                    const previousSelectedSiraExists = response.data.some(kredi => kredi.sira === selectedSira);
                    if (!previousSelectedSiraExists && response.data.length > 0) {
                        setSelectedSira(response.data[0].sira);
                        setNewRehinDurum(String(response.data[0].rehinDurum) || '');
                    } else if (selectedSira && previousSelectedSiraExists) {
                        const currentSelectedKredi = response.data.find(kredi => kredi.sira === selectedSira);
                        if (currentSelectedKredi) {
                            setNewRehinDurum(String(currentSelectedKredi.rehinDurum) || '');
                        }
                    } else if (response.data.length === 0) {
                        setSelectedSira('');
                        setNewRehinDurum('');
                    }
                }

            } else if (response.status === 204) {
                setMessage('Bu kredi numarasına ait kayıt bulunamadı.');
                setKrediBilgileri([]);
                setSelectedSira('');
                setNewRehinDurum('');
            }
        } catch (error) {
            console.error('Kredi bilgileri alınırken hata oluştu:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    setMessage('Bu kredi numarasına ait kayıt bulunamadı.');
                } else {
                    setMessage(`Hata (${error.response.status}): ${error.response.data.message || 'API hatası.'}`);
                }
            } else if (error.request) {
                setMessage('Sunucuya ulaşılamadı. Spring Boot uygulamanız çalışıyor mu? CORS ayarlarını kontrol edin.');
            } else {
                setMessage('İstek kurulurken bir hata oluştu.');
            }
            setKrediBilgileri([]);
            setSelectedSira('');
            setNewRehinDurum('');
        } finally {
            setLoading(false);
        }
    };

    const handleSiraChange = (event) => {
        const value = event.target.value;
        setSelectedSira(value === 'all' ? 'all' : Number(value));
        if (value === 'all') {
            setNewRehinDurum('');
        } else {
            const selectedKredi = krediBilgileri.find(k => k.sira === Number(value));
            setNewRehinDurum(selectedKredi ? (String(selectedKredi.rehinDurum) || '') : '');
        }
    };

    const handleNewRehinDurumChange = (event) => {
        setNewRehinDurum(event.target.value);
    };

    const updateRehinDurumu = async () => {
        if (!krediNumarasi || (!selectedSira && krediBilgileri.length > 0)) {
            setMessage('Lütfen kredi numarası ve güncellenecek sıra seçin.');
            return;
        }
        if (!newRehinDurum) {
            setMessage('Lütfen yeni rehin durumunu seçin.');
            return;
        }

        setLoading(true);
        setMessage('');
        let updatedCount = 0;
        let success = true;

        try {
            if (selectedSira === 'all') {
                for (const kredi of krediBilgileri) {
                    try {
                        await axios.put(
                            `https://web-service1-8gnq.onrender.com/remote/urunler/${krediNumarasi}/${kredi.sira}`,
                            { rehinDurum: Number(newRehinDurum) }
                        );
                        updatedCount++;
                    } catch (error) {
                        console.error(`Kredi No: ${krediNumarasi}, Sıra: ${kredi.sira} güncellenirken hata:`, error);
                        success = false;
                    }
                }
                if (success) {
                    setMessage(`${updatedCount} adet kaydın rehin durumu başarıyla güncellendi. Yeni Durum: ${getRehinDurumuLabel(newRehinDurum)}`);
                } else {
                    setMessage(`Rehin durumu güncellenirken bazı hatalar oluştu. ${updatedCount} kayıt güncellendi.`);
                }

            } else {
                const response = await axios.put(
                    `https://web-service1-8gnq.onrender.com/remote/urunler/${krediNumarasi}/${selectedSira}`,
                    { rehinDurum: Number(newRehinDurum) }
                );

                if (response.status === 200) {
                    setMessage(`Rehin durumu başarıyla güncellendi: Kredi No: ${krediNumarasi}, Sıra: ${selectedSira}, Yeni Durum: ${getRehinDurumuLabel(newRehinDurum)}`);
                    updatedCount = 1;
                }
            }
            fetchKrediBilgileri();
        } catch (error) {
            console.error('Rehin durumu güncellenirken genel hata oluştu:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    setMessage(`Hata: Kredi No: ${krediNumarasi}, Sıra: ${selectedSira} için kayıt bulunamadı.`);
                } else {
                    setMessage(`Hata (${error.response.status}): ${error.response.data.message || 'API hatası.'}`);
                }
            } else {
                setMessage('API ile iletişim kurulurken bir hata oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rehin-durum-yonetimi-container ${isPageLoaded ? 'fade-in' : ''}`}>
            <h1>
                <FaFileAlt className="title-icon" /> Rehin Durum Yönetimi
            </h1>

            <div className="input-group-container">
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
                </div>
                <div className="input-section button-container">
                    <button onClick={fetchKrediBilgileri} disabled={loading || !krediNumarasi}>
                        Rehin Bilgilerini Getir
                    </button>
                </div>
            </div>

            {message && (
                <p className={`message ${message.startsWith('Hata') ? 'error' : 'success'}`}>
                    {message}
                </p>
            )}

            {loading && <p className="loading">İşlem devam ediyor...</p>}

            {krediBilgileri.length > 0 && (
                <div className="kredi-list-section">
                    <h2>Kredi Detayları ({krediNumarasi})</h2>
                    <div className="sira-select-container">
                        <label htmlFor="siraSelect">Güncellenecek Sıra:</label>
                        <select
                            id="siraSelect"
                            value={selectedSira}
                            onChange={handleSiraChange}
                            disabled={loading}
                        >
                            <option value="">Bir Sıra Seçin</option>
                            {krediBilgileri.length > 0 && (
                                <option value="all">Tümünü Seç</option>
                            )}
                            {krediBilgileri.map((kredi) => (
                                <option key={kredi.sira} value={kredi.sira}>
                                    {kredi.sira} (Mevcut Durum: {getRehinDurumuLabel(kredi.rehinDurum)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {(selectedSira || krediBilgileri.length > 0) && (
                        <div className="update-section">
                            <label htmlFor="newRehinDurumSelect">Yeni Rehin Durumu:</label>
                            <select
                                id="newRehinDurumSelect"
                                value={newRehinDurum}
                                onChange={handleNewRehinDurumChange}
                                disabled={loading}
                            >
                                <option value="">Seçiniz</option>
                                {rehinDurumuOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="button-green"
                                onClick={updateRehinDurumu}
                                disabled={loading || !newRehinDurum || (!selectedSira && krediBilgileri.length > 0)}
                            >
                                Rehin Durumunu Güncelle
                            </button>
                        </div>
                    )}

                    <div className="all-kredi-items">
                        <h3>Tüm Kayıtlar</h3>
                        {krediBilgileri.map((kredi) => (
                            <div key={`${kredi.krediNumarasi}-${kredi.sira}`} className="kredi-item">
                                <p><strong>Sıra:</strong> {kredi.sira}</p>
                                <p><strong>Mevcut Durum:</strong> {getRehinDurumuLabel(kredi.rehinDurum)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RehinDurumYonetimi;