"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { FaClipboardList } from "react-icons/fa"
import "./EvrakDurumGuncelle.css"

function EvrakDurumGuncelle() {
  const [talepNumarasi, setTalepNumarasi] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [documentStatusList, setDocumentStatusList] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [newDocumentStatus, setNewDocumentStatus] = useState("")
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [allDocuments, setAllDocuments] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const documentStatusOptions = [
    { value: "0", label: "0- Gelmedi" },
    { value: "1", label: "1- Kabul Edilmedi" },
    { value: "2", label: "2- Eksiksiz Geldi" },
    { value: "3", label: "3- Satıcıda Arşiv" },
    { value: "4", label: "4- Düzeltmede" },
    { value: "5", label: "5- İstenmeyecek" },
    { value: "6", label: "6- Zorunlu Kabul" },
    { value: "7", label: "7- KF Personel Fotokopisi" },
    { value: "8", label: "8- Fotokopi" },
    { value: "9", label: "9- Komite Kararı" },
  ]

  const getDocumentStatusLabel = (value) => {
    const option = documentStatusOptions.find((opt) => opt.value === String(value))
    return option ? option.label : value !== null ? value : "Boş"
  }

  const handleTalepNumarasiChange = (event) => {
    setTalepNumarasi(event.target.value)
    setMessage("")
    setDocumentStatusList([])
    setSelectedDocument(null)
    setNewDocumentStatus("")
  }

  const fetchDocumentStatus = async () => {
    if (!talepNumarasi.trim()) {
      setMessage("Lütfen bir talep numarası girin.")
      return
    }

    setLoading(true)
    setMessage("")
    setDocumentStatusList([])
    setSelectedDocument(null)
    setNewDocumentStatus("")

    try {
      const response = await axios.get(`https://web-service1-8gnq.onrender.com/remote/kootoevrakdurum/${talepNumarasi}`)

      if (response.status === 200) {
        const filteredData = response.data

        if (filteredData.length > 0) {
          const formattedData = filteredData.map((doc) => ({
            ...doc,
            id: doc.evrakKodu,
            durum: doc.durum,
          }))

          setDocumentStatusList(formattedData)
          setMessage("Evrak bilgileri başarıyla getirildi.")

          if (formattedData.length > 0) {
            setSelectedDocument(formattedData[0])
            setNewDocumentStatus(String(formattedData[0].durum) || "")
          }
        } else {
          setMessage("Bu talep numarasına ait evrak bulunamadı.")
        }
      } else {
        setMessage("Evrak bilgileri getirilirken bir sorun oluştu.")
      }
    } catch (error) {
      console.error("Evrak bilgileri getirilirken hata oluştu:", error)
      setDocumentStatusList([])
      if (error.response && error.response.status === 404) {
        setMessage("Bu talep numarasına ait evrak bulunamadı.")
      } else {
        setMessage("Evrak bilgileri getirilirken bir hata oluştu.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSelectChange = (event) => {
    const selectedId = event.target.value
    if (selectedId === "all") {
      setSelectedDocument({ id: "all" })
      setNewDocumentStatus("") // 'Tümünü Seç' seçildiğinde durumu temizle
    } else {
      const doc = documentStatusList.find((d) => String(d.id) === selectedId)
      setSelectedDocument(doc)
      setNewDocumentStatus(doc ? String(doc.durum) || "" : "")
    }
  }

  const handleNewDocumentStatusChange = (event) => {
    setNewDocumentStatus(event.target.value)
  }

  const updateDocumentStatus = async () => {
    if (!talepNumarasi.trim() || !selectedDocument) {
      setMessage("Lütfen talep numarası ve güncellenecek evrak seçin.")
      return
    }
    if (!newDocumentStatus && selectedDocument.id !== "all") {
        setMessage("Lütfen yeni evrak durumunu seçin.");
        return;
    }
    if (!newDocumentStatus && selectedDocument.id === "all") {
        setMessage("Lütfen tüm evraklar için yeni durumu seçin.");
        return;
    }

    setLoading(true)
    setMessage("")
    let updatedCount = 0
    let success = true

    try {
      if (selectedDocument.id === "all") {
        // Tüm evraklar için döngü
        for (const doc of documentStatusList) {
          try {
            await axios.put(
              `https://web-service1-8gnq.onrender.com/remote/kootoevrakdurum/update/${talepNumarasi}/${doc.id}`,
              {
                durum: Number(newDocumentStatus),
              },
            )
            updatedCount++
          } catch (error) {
            console.error(`Talep No: ${talepNumarasi}, Evrak ID: ${doc.id} güncellenirken hata:`, error)
            success = false
          }
        }
        if (success) {
          setMessage(
            `${updatedCount} adet evrakın durumu başarıyla güncellendi. Yeni Durum: ${getDocumentStatusLabel(newDocumentStatus)}`,
          )
        } else {
          setMessage(`Evrak durumu güncellenirken bazı hatalar oluştu. ${updatedCount} kayıt güncellendi.`)
        }
      } else {
        // Tekil evrak güncelleme
        const response = await axios.put(
          `https://web-service1-8gnq.onrender.com/remote/kootoevrakdurum/update/${talepNumarasi}/${selectedDocument.id}`,
          { durum: Number(newDocumentStatus) },
        )
        if (response.status === 200) {
          setMessage(
            `Evrak durumu başarıyla güncellendi: Talep No: ${talepNumarasi}, Evrak ID: ${selectedDocument.id}, Yeni Durum: ${getDocumentStatusLabel(newDocumentStatus)}`,
          )
          updatedCount = 1
        }
      }
      fetchDocumentStatus()
    } catch (error) {
      console.error("Evrak durumu güncellenirken genel hata oluştu:", error)
      if (error.response) {
        if (error.response.status === 404) {
          setMessage(`Hata: Talep No: ${talepNumarasi}, Evrak ID: ${selectedDocument?.id} için kayıt bulunamadı.`)
        } else {
          setMessage(`Hata (${error.response.status}): ${error.response.data.message || "API hatası."}`)
        }
      } else {
        setMessage("API ile iletişim kurulurken bir hata oluştu.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`evrak-durum-guncelle-container ${isPageLoaded ? "fade-in" : ""}`}>
      <h1>
        <FaClipboardList className="title-icon" /> Evrak Durum Güncelle
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
        <button onClick={fetchDocumentStatus} disabled={loading || !talepNumarasi.trim()}>
          Evrak Durum Listele
        </button>
      </div>

      {message && <p className={`message ${message.includes("başarıyla") ? "success" : "error"}`}>{message}</p>}

      {loading && <p className="loading">İşlem devam ediyor...</p>}

      {documentStatusList.length > 0 && (
        <div className="document-list-section">
          <h2>Evrak Detayları ({talepNumarasi})</h2>
          <div className="input-section">
            <label htmlFor="documentSelect">Güncellenecek Evrak:</label>
            <select
              id="documentSelect"
              value={selectedDocument ? selectedDocument.id : ""}
              onChange={handleDocumentSelectChange}
              disabled={loading}
            >
              <option value="">Bir Evrak Seçin</option>
              {documentStatusList.length > 1 && <option value="all">Tümünü Seç</option>}
              {documentStatusList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.id} (Mevcut Durum: {getDocumentStatusLabel(doc.durum)})
                </option>
              ))}
            </select>
          </div>

          {(selectedDocument || documentStatusList.length > 0) && (
            <div className="update-section">
              <label htmlFor="newDocumentStatusSelect">Yeni Evrak Durumu:</label>
              <select
                id="newDocumentStatusSelect"
                value={newDocumentStatus}
                onChange={handleNewDocumentStatusChange}
                disabled={loading || !selectedDocument} // Sadece 'selectedDocument' boşsa deaktif et
              >
                <option value="">Seçiniz</option>
                {documentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="button-green"
                onClick={updateDocumentStatus}
                disabled={loading || !newDocumentStatus || !selectedDocument}
              >
                Evrak Durumunu Güncelle
              </button>
            </div>
          )}

          <div className="all-document-items">
            <h3>Tüm Kayıtlar</h3>
            {documentStatusList.map((doc) => (
              <div key={doc.id} className="document-item">
                <p>
                  <strong>Evrak ID:</strong> {doc.id}
                </p>
                <p>
                  <strong>Mevcut Durum:</strong> {getDocumentStatusLabel(doc.durum)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EvrakDurumGuncelle;
