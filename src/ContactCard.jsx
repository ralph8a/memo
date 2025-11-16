import React, { useState } from "react";
import "./ContactCard.css";
import "animate.css/animate.css";

const ContactCard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mainColor, setMainColor] = useState("#a02c5a");
  const [showColors, setShowColors] = useState(false);
  const [notification, setNotification] = useState("");
  const [language, setLanguage] = useState("es");
  const colorOptions = ["#c94f7c", "#4FC98A", "#0A66C2", "#ffb6d5", "#232526", "#800020"];
  const languages = { es: "Español", en: "English" };
  // Detecta si está en producción (GitHub Pages) o desarrollo
  // Usar rutas absolutas para los iconos, compatible con GitHub Pages y local
  const repoBase = '/memo/assets/';
  const localBase = '/assets/';
  const isProd = window.location.hostname.includes('github.io');
  const assetPath = isProd ? repoBase : localBase;
  const icons = {
    phone: assetPath + 'phone.png',
    mail: assetPath + 'mail.png',
    location: assetPath + 'location.png',
    linkedin: assetPath + 'cv.png',
    cv: assetPath + 'cv.png',
  };

  // Mostrar notificación
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification("") , 1800);
  };

  React.useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
    document.body.style.setProperty("--main-color", mainColor);
    if (darkMode) {
      document.body.style.background = "#000";
      document.body.style.color = "#fff";
    } else {
      document.body.style.background = "linear-gradient(135deg, #a02c5a 0%, #c94f7c 100%)";
      document.body.style.color = "#a02c5a";
    }
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
  <div className={`background-soft animate__animated animate__fadeIn`} />
      {/* Notificación */}
  {notification && <div className="notification animate__animated animate__fadeInDown animate__faster">{notification}</div>}
  <div className={`contact-card animate__animated animate__fadeInUp animate__slower`} style={{zIndex:1, transition: 'background 0.5s, color 0.5s', background: darkMode ? '#232526' : '#fff6fa', color: darkMode ? '#fff' : '#a02c5a'}}>
        {/* Switch de modo oscuro y selector de idioma */}
  <div style={{position:'absolute',top:18,left:18,zIndex:2,display:'flex',alignItems:'center',gap:8}}>
          <label style={{display:'flex',alignItems:'center',cursor:'pointer',gap:6, transition:'color 0.3s'}}>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(d => !d)} style={{width:24,height:24}} />
            <span style={{fontWeight:600, color: darkMode ? '#ffd6e0' : '#a02c5a', transition:'color 0.3s'}}>{darkMode ? '🌙' : '☀️'}</span>
          </label>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{borderRadius:8,padding:4,border:`1px solid ${mainColor}`, background: darkMode ? '#232526' : '#fff', color: darkMode ? '#fff' : '#a02c5a', transition:'background 0.3s, color 0.3s'}}>
            {Object.entries(languages).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        {/* Menú redondo desplegable en esquina inferior derecha */}
        <div style={{position:'fixed',bottom:32,right:32,zIndex:10}}>
          <div style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <button className="cv-btn animate__animated animate__pulse animate__infinite" style={{borderRadius:'50%',width:40,height:40,boxShadow:`0 2px 12px ${mainColor}55`,fontSize:'1.1em',padding:0, background: darkMode ? '#a02c5a' : mainColor, color: '#fff'}} onClick={()=>setShowColors(s=>!s)}>
              🎨
            </button>
            {showColors && (
              <div style={{position:'absolute',bottom:'110%',right:'-24px',background: darkMode ? '#232526' : '#fff',borderRadius:'24px',boxShadow:'0 2px 12px #a02c5a22',padding:18,display:'flex',flexDirection:'column',gap:12,alignItems:'center', transition:'background 0.3s'}}>
                {colorOptions.map(color => (
                  <span key={color} className={`color-dot${mainColor===color?' selected':''}`} style={{background:color,width:24,height:24,margin:'4px 0',borderRadius:'50%',border:'2px solid #fff',cursor:'pointer',display:'block'}} title={color === '#800020' ? 'Vino' : ''} onClick={()=>{setMainColor(color);setShowColors(false);showNotification(t[language].color + ' cambiado');}}></span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Animación de entrada personalizada */}
  <div className="contact-header animate__animated animate__fadeInDown animate__slower animate__delay-1s">
          <img
            src="https://raw.githubusercontent.com/rafaelhernandezochoa95-lang/cuestionarios-filmacion/main/aaa9e1cb-2a25-4fd1-a286-4ff6123f4dc8.jpg"
            alt={t[language].name}
            className="contact-photo animate__animated animate__zoomIn animate__slower animate__delay-2s"
            style={{borderColor: darkMode ? '#ffd6e0' : mainColor, boxShadow: darkMode ? '0 0 24px 6px #ffd6e088, 0 2px 12px #ffd6e022' : `0 0 24px 6px ${mainColor}88, 0 2px 12px ${mainColor}22`, transition:'border-color 0.3s, box-shadow 0.3s'}}
          />
          <div className="contact-name animate__animated animate__fadeInLeft animate__delay-2s">{t[language].name}</div>
          <div className="contact-role animate__animated animate__fadeInRight animate__delay-2s">{t[language].role}</div>
        </div>
        <hr className="contact-divider" />
  <div className="contact-actions animate__animated animate__fadeInUp animate__slower animate__delay-2s">
          <a href="tel:+525580190389" className="contact-action animate__animated animate__bounceIn animate__slower animate__delay-3s" title={t[language].phone}
            tabIndex={0}
            onClick={e => {e.preventDefault(); navigator.clipboard.writeText("5580190389"); showNotification(t[language].copied);}}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={icons.phone} alt="phone" style={{width:'1.6em',height:'1.6em'}} />
              <span className="tooltip">{t[language].phone}</span>
            </span>
          </a>
          <a href="mailto:guille_ks@outlook.com" className="contact-action animate__animated animate__bounceIn animate__slower animate__delay-3s" title={t[language].email}
            tabIndex={0}
            onClick={e => {e.preventDefault(); navigator.clipboard.writeText("guille_ks@outlook.com"); showNotification(t[language].copied);}}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={icons.mail} alt="mail" style={{width:'1.6em',height:'1.6em'}} />
              <span className="tooltip">{t[language].email}</span>
            </span>
          </a>
          <a
            href="http://www.linkedin.com/in/guillermo-krause-s-238895248"
            className="contact-action animate__animated animate__bounceIn animate__slower animate__delay-3s"
            target="_blank"
            rel="noopener"
            title={t[language].linkedin}
            tabIndex={0}
          >
            <span className="contact-icon contact-icon-circle" style={{ background: "#c94f7c", position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={icons.linkedin} alt="linkedin" style={{width:'1.6em',height:'1.6em'}} />
              <span className="tooltip">{t[language].linkedin}</span>
            </span>
          </a>
          <a href="https://twitter.com/" className="contact-action animate__animated animate__bounceIn animate__slower animate__delay-3s" target="_blank" rel="noopener" title={t[language].twitter} tabIndex={0}>
            <span className="contact-icon contact-icon-circle" style={{ background: "#1DA1F2", position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={icons.mail} alt="twitter" style={{width:'1.6em',height:'1.6em',filter:'grayscale(1)'}} />
              <span className="tooltip">{t[language].twitter}</span>
            </span>
          </a>
        </div>
        <hr className="contact-divider" />
  <div className="contact-info animate__animated animate__fadeInUp animate__slower animate__delay-3s">
          <div className="contact-info-row animate__animated animate__fadeInLeft animate__slower animate__delay-4s">
            <span className="contact-info-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img src={icons.phone} alt="phone" style={{width:'1.3em',height:'1.3em'}} />
            </span>
            <span className="contact-info-value">5580190389</span>
          </div>
          <div className="contact-info-row animate__animated animate__fadeInLeft animate__slower animate__delay-4s">
            <span className="contact-info-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img src={icons.mail} alt="mail" style={{width:'1.3em',height:'1.3em'}} />
            </span>
            <span className="contact-info-value">guille_ks@outlook.com</span>
          </div>
          <div className="contact-address animate__animated animate__fadeIn animate__slower animate__delay-5s">
            <span className="contact-address-icon" style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <img src={icons.location} alt="location" style={{width:'1.3em',height:'1.3em'}} />
            </span>
            <span className="contact-address-value">{t[language].address}</span>
            {/* Google Maps embed */}
            <a href="https://www.google.com/maps/search/?api=1&query=Miguel+Hidalgo+11000+Anahuac+203" target="_blank" rel="noopener" style={{marginLeft:12,fontWeight:600,color:mainColor,textDecoration:'underline',fontSize:'0.98em'}} title={t[language].map}>
              {t[language].map}
            </a>
            {/* Fin Google Maps */}
          </div>
          <div className="contact-info-row animate__animated animate__fadeInUp animate__slower animate__delay-5s" style={{ justifyContent: "center", marginTop: 24, marginBottom: 0, borderBottom: "none" }}>
            <button id="show-cv-btn" className={`cv-btn animate__animated animate__pulse animate__infinite${darkMode ? ' dark-btn' : ''}`} onClick={() => window.location.href = "cv_web.html"}>
              <span style={{background: "#c94f7c", borderRadius: '50%', padding: '4px', marginRight: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <img src={icons.cv} alt="cv" style={{width:'1.3em',height:'1.3em',marginRight:'6px'}} /> {t[language].cv}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactCard;
