// dosya: GunKapama.jsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import "./GunKapama.css";

function GunKapama() {
  const [selectedDate, setSelectedDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = (event) => {
    const inputValue = event.target.value;
    setMessage("");

    const dateParts = inputValue.split("-");
    if (dateParts.length === 3 && dateParts[0].length > 4) {
      setMessage("Yıl 4 basamaktan fazla olamaz.");
      return;
    }

    setSelectedDate(inputValue);
  };

  const handleSetClosedDay = async () => {
    if (!selectedDate) {
      setMessage("Lütfen bir tarih seçiniz.");
      return;
    }

    setLoading(true);
    setMessage("");

    const baseUrl = "https://web-service1-8gnq.onrender.com";

    try {
      const response = await axios.delete(
        `${baseUrl}/remote/kogunkapama/process/${selectedDate}`
      );

      if (response.status === 200) {
        setMessage(
          `${selectedDate} tarihi için günlük kapanış işlemi başarıyla tetiklendi.`
        );
      } else {
        setMessage("Günlük kapanış işlemi sırasında bir sorun oluştu.");
      }
    } catch (error) {
      console.error("Günlük kapanış işlemi sırasında hata oluştu:", error);
      if (error.response) {
        setMessage(
          `Hata (${error.response.status}): ${
            error.response.data || "API hatası."
          }`
        );
      } else {
        setMessage("API ile iletişim kurulurken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`kapanan-gun-container ${isPageLoaded ? "fade-in" : ""}`}>
      <h1>
        <FaCalendarAlt className="title-icon" /> Gün Kapama
      </h1>
      <div className="input-section">
        <label htmlFor="dateInput">Lütfen işlem yapılacak tarihi seçiniz:</label>
        <input
          type="date"
          id="dateInput"
          value={selectedDate}
          onChange={handleDateChange}
          disabled={loading}
          max="9999-12-31"
        />
      </div>
      <div className="button-section">
        <button
          onClick={handleSetClosedDay}
          disabled={loading || !selectedDate}
        >
          Gün Kapama'yı Başlat
        </button>
      </div>
      {message && (
        <p className={`message ${message.includes("başarıyla") ? "success" : "error"}`}>
          {message}
        </p>
      )}
      {loading && <p className="loading">İşlem devam ediyor...</p>}
    </div>
  );
}

export default GunKapama;
