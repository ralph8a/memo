import React, { useState } from "react";
import "../styles/ContactCard.css";
import "animate.css/animate.css";

const t = {
  en: {
    name: "Guillermo Krause S.",
  role: "Insurance Krause",
    phone: "Phone",
    email: "Email",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    facebook: "Facebook",
    instagram: "Instagram",
    cv: "CV",
    address: "Address",
    map: "Map",
    copied: "Copied!",
    color: "Color"
  }
};
const languages = { en: "English" };
const colorOptions = ["#4FC98A", "#4267B2", "#E1306C", "#800020"];

const ContactCard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [mainColor, setMainColor] = useState(colorOptions[0]);
  const [showColors, setShowColors] = useState(false);
  const [notification, setNotification] = useState("");
  const showNotification = msg => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [darkMode]);

  return (
    <>
      <div className="background-soft"></div>
      {notification && <div className="notification animate__animated animate__fadeInDown">{notification}</div>}
      <div className={`contact-card animate__animated animate__fadeInUp`} style={{zIndex:1}}>
        <div style={{position:'absolute',top:18,left:18,zIndex:2,display:'flex',alignItems:'center',gap:8}}>
          <label style={{display:'flex',alignItems:'center',cursor:'pointer',gap:6}}>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(d => !d)} style={{width:24,height:24}} />
            <span style={{fontWeight:600}}>{darkMode ? '🌙' : '☀️'}</span>
          </label>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{borderRadius:8,padding:4,border:`1px solid ${mainColor}`}}>
            {Object.entries(languages).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="contact-header animate__animated animate__fadeInDown animate__delay-1s">
          <img
            src="https://raw.githubusercontent.com/rafaelhernandezochoa95-lang/cuestionarios-filmacion/main/aaa9e1cb-2a25-4fd1-a286-4ff6123f4dc8.jpg"
            alt={t[language].name}
            className="contact-photo animate__animated animate__zoomIn animate__delay-2s"
          />
          <div className="contact-name animate__animated animate__fadeInLeft animate__delay-2s">{t[language].name}</div>
          <div className="contact-role animate__animated animate__fadeInRight animate__delay-2s">{t[language].role}</div>
        </div>
        <hr className="contact-divider" />
        <div className="contact-actions">
          <a href="tel:+525580190389" className="contact-action animate__animated animate__bounceIn animate__delay-3s" title={t[language].phone}
            tabIndex={0}
            onClick={e => {e.preventDefault(); navigator.clipboard.writeText("5580190389"); showNotification(t[language].copied);}}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#4FC98A", position:'relative' }}>
              <img src={`${import.meta.env.BASE_URL}assets/phone.svg`} alt={t[language].phone} />
              <span className="tooltip">{t[language].phone}</span>
            </span>
          </a>
          <a href="mailto:guille_ks@outlook.com" className="contact-action animate__animated animate__bounceIn animate__delay-3s" title={t[language].email}
            tabIndex={0}
            onClick={e => {e.preventDefault(); navigator.clipboard.writeText("guille_ks@outlook.com"); showNotification(t[language].copied);}}>
            <span className="contact-icon contact-icon-circle" style={{ background: mainColor, position:'relative' }}>
              <img src={`${import.meta.env.BASE_URL}assets/mail.svg`} alt={t[language].email} />
              <span className="tooltip">{t[language].email}</span>
            </span>
          </a>
          <a
            href="http://www.linkedin.com/in/guillermo-krause-s-238895248"
            className="contact-action animate__animated animate__bounceIn animate__delay-3s"
            target="_blank"
            rel="noopener"
            title={t[language].linkedin}
            tabIndex={0}
          >
            <span className="contact-icon contact-icon-circle" style={{ background: darkMode ? "#4FC98A" : mainColor, position:'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill={darkMode ? "#4FC98A" : mainColor}/><path fill="#fff" d="M7.5 9.5a1 1 0 11-2 0 1 1 0 012 0zM6 11h3v7H6v-7zm5 0h2v1.25a2.25 2.25 0 014.5 0V18h-2v-4.25a.25.25 0 00-.5 0V18h-2v-7z"/></svg>
              <span className="tooltip">{t[language].linkedin}</span>
            </span>
          </a>
        </div>
        <hr className="contact-divider" />
        <div className="contact-info animate__animated animate__fadeInUp animate__delay-4s">
          <div className="contact-info-row">
            <span className="contact-info-icon" style={{background: mainColor, borderRadius: '50%', padding: '4px'}}>
              <img src={`${import.meta.env.BASE_URL}assets/phone.svg`} alt={t[language].phone} style={{filter: darkMode ? 'brightness(1.8)' : 'none'}} />
            </span>
            <span className="contact-info-value">5580190389</span>
          </div>
          <div className="contact-info-row">
            <span className="contact-info-icon" style={{background: mainColor, borderRadius: '50%', padding: '4px'}}>
              <img src={`${import.meta.env.BASE_URL}assets/mail.svg`} alt={t[language].email} style={{filter: darkMode ? 'brightness(1.8)' : 'none'}} />
            </span>
            <span className="contact-info-value">guille_ks@outlook.com</span>
          </div>
          <div className="contact-info-row" style={{ justifyContent: "center", marginTop: 24, marginBottom: 0, borderBottom: "none" }}>
            <button id="show-cv-btn" className={`cv-btn animate__animated animate__pulse animate__infinite${darkMode ? ' dark-btn' : ''}`} onClick={() => window.location.href = "cv_web.html"}>
              <span style={{background: mainColor, borderRadius: '50%', padding: '4px', marginRight: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <img src={`${import.meta.env.BASE_URL}assets/cv.svg`} alt={t[language].cv} style={{filter: darkMode ? 'brightness(1.8)' : 'none'}} />
              </span>
              {t[language].cv}
            </button>
          </div>
          <div className="contact-address animate__animated animate__fadeIn animate__delay-5s">
            <span className="contact-address-icon" style={{background: mainColor, borderRadius: '50%', padding: '4px'}}>
              <img src={`${import.meta.env.BASE_URL}assets/location.svg`} alt={t[language].address} style={{filter: darkMode ? 'brightness(1.8)' : 'none'}} />
            </span>
            <span className="contact-address-value">{t[language].address}</span>
            {/* Google Maps embed */}
            <a href="https://www.google.com/maps/search/?api=1&query=Miguel+Hidalgo+11000+Anahuac+203" target="_blank" rel="noopener" style={{marginLeft:12,fontWeight:600,color:mainColor,textDecoration:'underline',fontSize:'0.98em'}} title={t[language].map}>
              {t[language].map}
            </a>
            {/* Fin Google Maps */}
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:16}}>
          <a href="https://facebook.com/" target="_blank" rel="noopener" style={{margin:'0 8px'}} title={t[language].facebook} tabIndex={0}>
            <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#4267B2"/><path fill="#fff" d="M21 16h-3v8h-4v-8h-2v-3h2v-2c0-2.2 1.3-3.5 3.5-3.5H21v3h-2c-.6 0-1 .4-1 1v1h3l-.5 3z"/></svg>
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener" style={{margin:'0 8px'}} title={t[language].instagram} tabIndex={0}>
            <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#E1306C"/><path fill="#fff" d="M16 11.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6zm5.5-7.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/></svg>
          </a>
        </div>
      </div>
    </>
  );
};

export default ContactCard;
