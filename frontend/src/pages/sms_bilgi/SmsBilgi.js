"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { FaEnvelopeOpenText, FaSort } from "react-icons/fa"
import "./SmsBilgi.css"

function SmsBilgi() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [smsKod, setSmsKod] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [smsList, setSmsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isDateSortReversed, setIsDateSortReversed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  const tableWrapperRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleDateSort = () => {
    const sortedList = [...smsList].sort((a, b) => {
      const dateA = new Date(a.insertDate)
      const dateB = new Date(b.insertDate)

      if (isDateSortReversed) {
        return dateA.getTime() - dateB.getTime() // Eskiden yeniye sırala
      } else {
        return dateB.getTime() - dateA.getTime() // Yeniden eskiye sırala
      }
    })
    setSmsList(sortedList)
    setIsDateSortReversed(!isDateSortReversed)
  }

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

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value
    if (!/^[0-9+]*$/.test(value)) {
      return
    }
    if (value.startsWith("+")) {
      if (value.length <= 13) {
        setPhoneNumber(value)
      }
    } else if (value.startsWith("0")) {
      if (value.length <= 11) {
        setPhoneNumber(value)
      }
    } else {
      if (value.length <= 10) {
        setPhoneNumber(value)
      }
    }
    setMessage(null)
  }

  const handleSmsKodChange = (e) => {
    const value = e.target.value
    if (value.length <= 4) {
      setSmsKod(value)
    }
    setMessage(null)
  }

  const cleanNumber = (number) => {
    return number.replace(/[^0-9]/g, "")
  }

  const fetchSmsMessages = async () => {
    const hasSearchCriteria = phoneNumber.trim() || smsKod.trim() || startDate || endDate
    if (!hasSearchCriteria) {
      setMessage({ type: "error", text: "Lütfen en az bir arama kriteri giriniz." })
      return
    }

    setLoading(true)
    setMessage(null)
    setSmsList([])
    setCurrentPage(1)

    try {
      const url = `https://kf-proje1.onrender.com/api/sms/records`
      const params = new URLSearchParams()

      const cleanedPhone = cleanNumber(phoneNumber)
      if (cleanedPhone) {
        params.append("phoneNumber", cleanedPhone)
      }

      if (smsKod.trim()) {
        params.append("smsKod", smsKod.trim())
      }

      if (startDate) {
        params.append("startDate", `${startDate}T00:00:00Z`) // UTC başlangıç saati
      }
      if (endDate) {
        params.append("endDate", `${endDate}T23:59:59Z`) // UTC bitiş saati
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

  const scrollToTableTop = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const isButtonEnabled = phoneNumber.trim() || smsKod.trim() || startDate || endDate

  const totalPages = Math.ceil(smsList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = smsList.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setTimeout(scrollToTableTop, 50)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
    setTimeout(scrollToTableTop, 50)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setTimeout(scrollToTableTop, 50)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setTimeout(scrollToTableTop, 50)
    }
  }

  const formatDateToUTC = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
  };

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
            onChange={handlePhoneNumberChange}
            placeholder="Telefon Numarasını Girin"
            disabled={loading}
          />
        </div>

        <div className="input-section">
          <label htmlFor="smsKodInput">SMS Kodu:</label>
          <input
            type="text"
            id="smsKodInput"
            value={smsKod}
            onChange={handleSmsKodChange}
            placeholder="SMS Kodunu Girin"
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
          <button onClick={fetchSmsMessages} disabled={loading || !isButtonEnabled}>
            Listele
          </button>
        </div>
      </div>

      {message && <p className={`message ${message.type}-message`}>{message.text}</p>}
      {loading && <p className="loading-message">Veriler yükleniyor...</p>}

      {!loading && smsList.length > 0 && (
        <div className="sms-table-wrapper" ref={tableWrapperRef}>
          <div className="pagination-controls-top">
            <div className="items-per-page">
              <label htmlFor="itemsPerPage">Sayfa başına kayıt: </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page-select"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>
            <div className="pagination-info">
              Toplam {smsList.length} kayıt - Sayfa {currentPage} / {totalPages}
            </div>
          </div>

          <table className="sms-table">
            <thead>
              <tr>
                <th>Telefon Numarası</th>
                <th>Mesaj İçeriği</th>
                <th>
                  <div className="date-header-with-sort">
                    Ekleme Tarihi
                    <button
                      className="sort-button"
                      onClick={toggleDateSort}
                      title={isDateSortReversed ? "Eskiden Yeniye Sırala" : "Yeniden Eskiye Sırala"}
                    >
                      <FaSort />
                    </button>
                  </div>
                </th>
                <th>SMS Kodu</th>
                <th>Gönderilen Program</th>
                <th>Kaynak Tablo</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((sms, index) => (
                <tr key={startIndex + index} className={getRowClass(sms.kaynakTablo)}>
                  <td>{sms.phoneNumber}</td>
                  <td className="message-body-cell">{sms.messageBody}</td>
                  <td>{formatDateToUTC(sms.insertDate)}</td>
                  <td>{sms.smsKod}</td>
                  <td>{sms.gonderilenProg}</td>
                  <td>{sms.kaynakTablo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
                ← Önceki
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Sonraki →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmsBilgi