"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { FaEnvelopeOpenText } from "react-icons/fa"
import "./SmsBilgi.css"

function SmsBilgi() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [smsList, setSmsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getRowClass = (kaynakTablo) => {
    switch (kaynakTablo) {
      case "SMS_GONDER_HIZLIPAHALI":
        return "row-hizlipahali"
      case "SMS_GONDER_ARA":
        return "row-ara"
      case "SMS_GONDER_ESKI":
        return "row-eski"
      default:
        return "row-normal"
    }
  }

  const fetchSmsMessages = async () => {
    if (!phoneNumber.trim()) {
      setMessage({ type: "error", text: "Lütfen bir telefon numarası giriniz." })
      return
    }

    setLoading(true)
    setMessage(null)
    setSmsList([]) // Yeni veri çekmeden önce listeyi temizle

    try {
      // ✅ Corrected API URL and path
      let url = `https://kf-proje1.onrender.com/api/sms/records`
      const params = new URLSearchParams()
      if (phoneNumber.trim()) {
        params.append("phoneNumber", phoneNumber.trim())
      }
      if (startDate) {
        params.append("startDate", startDate)
      }
      if (endDate) {
        params.append("endDate", endDate)
      }

      const fullUrl = `${url}?${params.toString()}`

      const response = await axios.get(fullUrl)

      if (response.status === 200 && response.data.length > 0) {
        setSmsList(response.data)
        setMessage({ type: "success", text: "SMS kayıtları başarıyla getirildi." })
      } else if (response.status === 200 && response.data.length === 0) {
        setMessage({ type: "no-data", text: "Belirtilen kriterlere uygun SMS kaydı bulunamadı." })
      } else {
        setMessage({ type: "error", text: "SMS kayıtları getirilirken bir sorun oluştu." })
      }
    } catch (error) {
      console.error("SMS kayıtları getirilirken hata oluştu:", error)
      setSmsList([])
      if (error.response) {
        setMessage({
          type: "error",
          text: `Hata (${error.response.status}): ${error.response.data.message || "API hatası."}`,
        })
      } else {
        setMessage({ type: "error", text: "API ile iletişim kurulurken bir hata oluştu." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`sms-bilgi-container ${isPageLoaded ? "fade-in" : ""}`}>
      <h1>
        <FaEnvelopeOpenText className="title-icon" /> SMS Bilgileri
      </h1>

      <div className="input-group">
        <div className="input-section">
          <label htmlFor="phoneNumberInput">Telefon Numarası:</label>
          <input
            type="text"
            id="phoneNumberInput"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value)
              setMessage(null)
            }}
            placeholder="Telefon Numarasını Girin"
            disabled={loading}
          />
        </div>

        <div className="input-section">
          <label htmlFor="startDateInput">Başlangıç Tarihi:</label>
          <input
            type="date"
            id="startDateInput"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setMessage(null)
            }}
            disabled={loading}
          />
        </div>

        <div className="input-section">
          <label htmlFor="endDateInput">Bitiş Tarihi:</label>
          <input
            type="date"
            id="endDateInput"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setMessage(null)
            }}
            disabled={loading}
          />
        </div>

        <div className="button-section">
          <button onClick={fetchSmsMessages} disabled={loading || !phoneNumber.trim()}>
            Listele
          </button>
        </div>
      </div>

      {message && (
        <p className={`message ${message.type}-message`}>{message.text}</p>
      )}
      {loading && <p className="loading-message">Veriler yükleniyor...</p>}

      {!loading && smsList.length > 0 && (
        <div className="sms-table-wrapper">
          <table className="sms-table">
            <thead>
              <tr>
                <th>Telefon Numarası</th>
                <th>Mesaj İçeriği</th>
                <th>Ekleme Tarihi</th>
                <th>SMS Kodu</th>
                <th>Gönderilen Program</th>
                <th>Kaynak Tablo</th>
              </tr>
            </thead>
            <tbody>
              {smsList.map((sms, index) => (
                <tr key={index} className={getRowClass(sms.kaynakTablo)}>
                  <td>{sms.phoneNumber}</td>
                  <td className="message-body-cell">{sms.messageBody}</td>
                  <td>{new Date(sms.insertDate).toLocaleDateString("tr-TR")}</td>
                  <td>{sms.smsKod}</td>
                  <td>{sms.gonderilenProg}</td>
                  <td>{sms.kaynakTablo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SmsBilgi
