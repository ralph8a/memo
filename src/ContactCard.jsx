import React, { useState } from "react";
import "./ContactCard.css";
import "animate.css/animate.css";

const ContactCard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mainColor, setMainColor] = useState("#c94f7c");
  const [showColors, setShowColors] = useState(false);
  const [notification, setNotification] = useState("");
  const [language, setLanguage] = useState("es");
  const colorOptions = ["#c94f7c", "#4FC98A", "#0A66C2", "#ffb6d5", "#232526", "#800020"];
  const languages = { es: "Español", en: "English" };
  const icons = {
    phone: `${import.meta.env.BASE_URL}assets/phone.svg`,
    mail: `${import.meta.env.BASE_URL}assets/mail.svg`,
    location: `${import.meta.env.BASE_URL}assets/location.svg`,
    linkedin: `${import.meta.env.BASE_URL}assets/linkedin.svg`,
    cv: `${import.meta.env.BASE_URL}assets/cv.svg`,
  };

  // Mostrar notificación
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification("") , 1800);
  };

  React.useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
    document.body.style.setProperty("--main-color", mainColor);
  }, [darkMode, mainColor]);

  // Traducciones
  const t = {
    es: {
      name: "Guillermo Krause Sepulveda",
      role: "Krause Insurance",
      phone: "Teléfono",
      email: "Email",
      linkedin: "LinkedIn",
      twitter: "Twitter",
      address: "Miguel Hidalgo, 11000, Anahuac 203",
  cv: "Visualizar CV web",
      theme: "Tema",
      dark: "Modo oscuro",
      color: "Color principal",
      facebook: "Facebook",
      instagram: "Instagram",
      copied: "Copiado al portapapeles",
      map: "Ver ubicación en mapa"
    },
    en: {
      name: "Guillermo Krause Sepulveda",
      role: "Krause Insurance",
      phone: "Phone",
      email: "Email",
      linkedin: "LinkedIn",
      twitter: "Twitter",
      address: "Miguel Hidalgo, 11000, Anahuac 203",
  cv: "Download my CV",
      theme: "Theme",
      dark: "Dark mode",
      color: "Main color",
      facebook: "Facebook",
      instagram: "Instagram",
      copied: "Copied to clipboard",
      map: "View location on map"
    }
  };

  return (
    <>
      <div className="background-soft"></div>
      {/* Notificación */}
      {notification && <div className="notification animate__animated animate__fadeInDown">{notification}</div>}
      <div className={`contact-card animate__animated animate__fadeInUp`} style={{zIndex:1}}>
        {/* Switch de modo oscuro y selector de idioma */}
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
        {/* Menú redondo desplegable en esquina inferior derecha */}
        <div style={{position:'fixed',bottom:32,right:32,zIndex:10}}>
          <div style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <button className="cv-btn" style={{borderRadius:'50%',width:40,height:40,boxShadow:`0 2px 12px ${mainColor}55`,fontSize:'1.1em',padding:0}} onClick={()=>setShowColors(s=>!s)}>
              🎨
            </button>
            {showColors && (
              <div style={{position:'absolute',bottom:'110%',right:'-24px',background:'#fff',borderRadius:'24px',boxShadow:'0 2px 12px #0002',padding:18,display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
                {colorOptions.map(color => (
                  <span key={color} className={`color-dot${mainColor===color?' selected':''}`} style={{background:color,width:24,height:24,margin:'4px 0',borderRadius:'50%',border:'2px solid #fff',cursor:'pointer',display:'block'}} title={color === '#800020' ? 'Vino' : ''} onClick={()=>{setMainColor(color);setShowColors(false);showNotification(t[language].color + ' cambiado');}}></span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Animación de entrada personalizada */}
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
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative', fontSize: '1.6em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📞
              <span className="tooltip">{t[language].phone}</span>
            </span>
          </a>
          <a href="mailto:guille_ks@outlook.com" className="contact-action animate__animated animate__bounceIn animate__delay-3s" title={t[language].email}
            tabIndex={0}
            onClick={e => {e.preventDefault(); navigator.clipboard.writeText("guille_ks@outlook.com"); showNotification(t[language].copied);}}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative', fontSize: '1.6em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✉️
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
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#c94f7c"/><path fill="#fff" d="M7.5 9.5a1 1 0 11-2 0 1 1 0 012 0zM6 11h3v7H6v-7zm5 0h2v1.25a2.25 2.25 0 014.5 0V18h-2v-4.25a.25.25 0 00-.5 0V18h-2v-7z"/></svg>
              <span className="tooltip">{t[language].linkedin}</span>
            </span>
          </a>
          <a href="https://twitter.com/" className="contact-action animate__animated animate__bounceIn animate__delay-3s" target="_blank" rel="noopener" title={t[language].twitter} tabIndex={0}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#1DA1F2", position:'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1DA1F2"/><path fill="#fff" d="M19.633 7.997c-.508.226-1.053.379-1.626.447a2.825 2.825 0 001.24-1.563 5.633 5.633 0 01-1.792.684 2.818 2.818 0 00-4.803 2.57A8.004 8.004 0 015.67 6.149a2.818 2.818 0 00.872 3.76c-.47-.015-.912-.144-1.297-.36v.036a2.818 2.818 0 002.26 2.762c-.222.06-.456.092-.698.092-.17 0-.336-.017-.497-.048a2.82 2.82 0 002.633 1.957A5.654 5.654 0 014 17.292a7.978 7.978 0 004.32 1.266c5.184 0 8.025-4.295 8.025-8.025 0-.122-.003-.243-.009-.364a5.728 5.728 0 001.406-1.462z"/></svg>
              <span className="tooltip">{t[language].twitter}</span>
            </span>
          </a>
        </div>
        <hr className="contact-divider" />
        <div className="contact-info animate__animated animate__fadeInUp animate__delay-4s">
          <div className="contact-info-row">
            <span className="contact-info-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', fontSize: '1.3em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              📞
            </span>
            <span className="contact-info-value">5580190389</span>
          </div>
          <div className="contact-info-row">
            <span className="contact-info-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', fontSize: '1.3em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              ✉️
            </span>
            <span className="contact-info-value">guille_ks@outlook.com</span>
          </div>
          <div className="contact-address animate__animated animate__fadeIn animate__delay-5s">
            <span className="contact-address-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', fontSize: '1.3em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              📍
            </span>
            <span className="contact-address-value">{t[language].address}</span>
            {/* Google Maps embed */}
            <a href="https://www.google.com/maps/search/?api=1&query=Miguel+Hidalgo+11000+Anahuac+203" target="_blank" rel="noopener" style={{marginLeft:12,fontWeight:600,color:mainColor,textDecoration:'underline',fontSize:'0.98em'}} title={t[language].map}>
              {t[language].map}
            </a>
            {/* Fin Google Maps */}
          </div>
          <div className="contact-info-row" style={{ justifyContent: "center", marginTop: 24, marginBottom: 0, borderBottom: "none" }}>
            <button id="show-cv-btn" className={`cv-btn animate__animated animate__pulse animate__infinite${darkMode ? ' dark-btn' : ''}`} onClick={() => window.location.href = "cv_web.html"}>
              <span style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', fontSize: '1.3em'}}>
                📄 {t[language].cv}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactCard;
