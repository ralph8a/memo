import React, { useState, useRef, useEffect } from "react";
import "./ContactCard.css";
import avatarImg from './assets/avatar.svg';
import { PhoneIcon, MailIcon, LocationIcon, LinkedinIcon, TwitterIcon, CvIcon, DownloadIcon, ShareIcon } from './Icons';
import { GithubIcon, InstagramIcon } from './SocialIcons';
import KrauseLogo from './KrauseLogo';
import { CONTACT_INFO, THEME_CONFIG, TRANSLATIONS, LANGUAGES, STATS } from './constants';
import { 
  loadFromStorage, 
  loadBooleanFromStorage, 
  saveToStorage, 
  calculateAccent2,
  calculateDarkShade,
  optimizeImage,
  generateVCard,
  downloadVCard as downloadVCardFile,
  shareContact as shareContactData
} from './utils';

const ContactCard = () => {
  // Load preferences from localStorage
  const [darkMode, setDarkMode] = useState(() => loadBooleanFromStorage('darkMode', false));
  const [mainColor, setMainColor] = useState(() => loadFromStorage('mainColor', THEME_CONFIG.defaultColor));
  const [language, setLanguage] = useState(() => loadFromStorage('language', 'es'));
  const [avatarSrcState, setAvatarSrcState] = useState(null);
  const [showColors, setShowColors] = useState(false);
  const [notification, setNotification] = useState("");
  const [biography, setBiography] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [activeTab, setActiveTab] = useState('contact');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // Initialize avatar from localStorage immediately
  const [avatarInitialized, setAvatarInitialized] = useState(false);
  
  const t = TRANSLATIONS[language];

  // Show notification with animation
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2400);
  };

  // Persist preferences to localStorage
  useEffect(() => {
    saveToStorage('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    saveToStorage('mainColor', mainColor);
  }, [mainColor]);

  useEffect(() => {
    saveToStorage('language', language);
  }, [language]);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Always show prompt after 3 seconds
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // For testing: show banner even without PWA event
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Apply theme
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    
    // Update CSS variables for theming
    document.body.style.setProperty("--main-color", mainColor);
    document.body.style.setProperty('--primary-600', mainColor);
    document.body.style.setProperty('--accent', mainColor);
    document.body.style.setProperty('--accent-2', calculateAccent2(mainColor));
    
    // Calculate darker shades for background
    const darkShade1 = calculateDarkShade(mainColor, 0.25);
    const darkShade2 = calculateDarkShade(mainColor, 0.4);
    const darkShade3 = calculateDarkShade(mainColor, 0.7);
    
    document.body.style.setProperty('--bg-dark-1', darkShade1);
    document.body.style.setProperty('--bg-dark-2', darkShade2);
    document.body.style.setProperty('--bg-dark-3', darkShade3);
  }, [darkMode, mainColor]);

  // Load persisted avatar from localStorage - runs immediately on mount
  useEffect(() => {
    if (!avatarInitialized) {
      const stored = loadFromStorage('profileImage', null);
      if (stored) {
        setAvatarSrcState(stored);
      }
      setAvatarInitialized(true);
    }
  }, [avatarInitialized]);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await optimizeImage(file);
      setAvatarSrcState(dataUrl);
      saveToStorage('profileImage', dataUrl);
    } catch (error) {
      console.error('Error optimizing image:', error);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarSrcState(null);
    try {
      localStorage.removeItem('profileImage');
    } catch (e) {
      console.error('Error removing photo:', e);
    }
  };

  // Download vCard
  const handleDownloadVCard = () => {
    const vcard = generateVCard(biography, githubUrl, websiteUrl);
    downloadVCardFile(vcard);
    showNotification(t.vcardDownloaded);
  };

  // Share contact
  const handleShareContact = async () => {
    try {
      const result = await shareContactData();
      if (result.success) {
        showNotification(result.method === 'share' ? t.shared : t.linkCopied);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Install PWA
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification(t.appInstalled || '¡App instalada!');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleMinimizeInstall = () => {
    setIsMinimized(true);
  };
  
  const handleExpandInstall = () => {
    setIsMinimized(false);
  };

  return (
    <>
      <div className={`background-soft anim-fade-in`} />
      
      {/* PWA Install Banner - Full width version */}
      {showInstallPrompt && !isMinimized && (
        <div className="install-banner anim-slide-down">
          <div className="install-banner-content">
            <div className="install-icon">📱</div>
            <div className="install-text">
              <strong>{t.installTitle || 'Instalar App'}</strong>
              <p>{t.installDescription || 'Accede más rápido desde tu pantalla de inicio'}</p>
            </div>
            <div className="install-actions">
              <button onClick={handleInstallApp} className="install-btn-primary">
                {t.install || 'Instalar'}
              </button>
              <button onClick={handleMinimizeInstall} className="install-btn-minimize">
                –
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notification con animación elegante */}
      <div className={`toast-notification ${notification ? 'show' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <div className="toast-content">
          <span className="toast-icon">✓</span>
          <span className="toast-message">{notification}</span>
        </div>
      </div>

      {/* Controls moved into the card header (see header-controls) */}

      <div className="contact-card anim-fade-in-up anim-slow">
        
        {/* PWA Install Banner - Minimized version inside card */}
        {showInstallPrompt && isMinimized && (
          <div className="install-banner-minimized" onClick={handleExpandInstall}>
            <span className="install-minimized-text">APP</span>
          </div>
        )}
        <div className="business-card-header anim-fade-in-down anim-slow anim-delay-1">
          <div className="header-image-section">
            <img
              src={avatarSrcState || avatarImg}
              alt={t.name}
              className="header-hero-image anim-zoom-in anim-slow anim-delay-2"
              loading="lazy"
              decoding="async"
            />
            <div className="image-fade-overlay"></div>
          </div>
          <div className="header-info-section">
            <h1 className="header-name anim-fade-in-left anim-delay-2">{t.name}</h1>
            <div className="header-company anim-fade-in anim-delay-3">
              <div className="company-logo anim-zoom-in anim-delay-3">
                <KrauseLogo style={{width: '64px', height: '64px', color: '#000'}} />
              </div>
              <div className="company-text">
                <span className="company-name-line">Krause</span>
                <span className="company-name-line">Insurance</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className="about-section anim-fade-in anim-delay-3">
          <h3 className="section-title">{t.about}</h3>
          <p className="bio-text">{CONTACT_INFO.bio[language]}</p>
        </div>

        {/* Stats Section */}
        <div className="stats-container anim-fade-in anim-delay-4">
          <div className="stat-card">
            <div className="stat-value">{STATS.experience}</div>
            <div className="stat-label">{t.yearsExp}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{STATS.clients}</div>
            <div className="stat-label">{t.clients}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{STATS.policies}</div>
            <div className="stat-label">{t.policies}</div>
          </div>
        </div>

        <hr className="contact-divider" />
        
        {/* Tabs Navigation */}
        <div className="tabs-container">
          <div className="tabs-header" role="tablist">
            <button 
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
              role="tab"
              aria-selected={activeTab === 'contact'}
              aria-controls="contact-panel"
            >
              <PhoneIcon className="tab-icon" />
              <span>Contacto</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
              role="tab"
              aria-selected={activeTab === 'social'}
              aria-controls="social-panel"
            >
              <ShareIcon className="tab-icon" />
              <span>Social</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
              role="tab"
              aria-selected={activeTab === 'location'}
              aria-controls="location-panel"
            >
              <LocationIcon className="tab-icon" />
              <span>Ubicación</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'downloads' ? 'active' : ''}`}
              onClick={() => setActiveTab('downloads')}
              role="tab"
              aria-selected={activeTab === 'downloads'}
              aria-controls="downloads-panel"
            >
              <DownloadIcon className="tab-icon" />
              <span>Descargas</span>
            </button>
          </div>

          {/* Tab Panels */}
          <div className="tabs-content">
            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="tab-panel anim-fade-in" id="contact-panel" role="tabpanel">
                <div className="contact-grid">
                  <a 
                    href={`tel:${CONTACT_INFO.phone}`} 
                    className="contact-card-item phone-card" 
                    title={t.phone}
                    aria-label={t.phone}
                    onClick={async e => {
                      e.preventDefault();
                      try { 
                        await navigator.clipboard.writeText(CONTACT_INFO.phoneDisplay); 
                        showNotification(t.copied); 
                      }
                      catch(_) { 
                        window.location.href = `tel:${CONTACT_INFO.phone}`; 
                      }
                    }}
                  >
                    <div className="card-icon">
                      <PhoneIcon className="icon-svg" />
                    </div>
                    <div className="card-content">
                      <div className="card-label">{t.phone}</div>
                      <div className="card-value">{CONTACT_INFO.phoneDisplay}</div>
                    </div>
                  </a>

                  <a 
                    href={`mailto:${CONTACT_INFO.email}`} 
                    className="contact-card-item email-card" 
                    title={t.email}
                    aria-label={t.email}
                    onClick={async e => {
                      e.preventDefault();
                      try { 
                        await navigator.clipboard.writeText(CONTACT_INFO.email); 
                        showNotification(t.copied); 
                      }
                      catch(_) { 
                        window.location.href = `mailto:${CONTACT_INFO.email}`; 
                      }
                    }}
                  >
                    <div className="card-icon">
                      <MailIcon className="icon-svg" />
                    </div>
                    <div className="card-content">
                      <div className="card-label">{t.email}</div>
                      <div className="card-value">{CONTACT_INFO.email}</div>
                    </div>
                  </a>

                  <button 
                    type="button" 
                    className="contact-card-item share-card" 
                    onClick={handleShareContact} 
                    title={t.share}
                    aria-label={t.share}
                  >
                    <div className="card-icon">
                      <ShareIcon className="icon-svg" />
                    </div>
                    <div className="card-content">
                      <div className="card-label">{t.share}</div>
                      <div className="card-value">Compartir contacto</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="tab-panel anim-fade-in" id="social-panel" role="tabpanel">
                <div className="social-grid">
                  <a
                    href={CONTACT_INFO.linkedin}
                    className="social-card linkedin-card"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.linkedin}
                    aria-label={t.linkedin}
                  >
                    <LinkedinIcon className="social-icon" />
                    <span className="social-label">{t.linkedin}</span>
                  </a>

                  <a 
                    href={CONTACT_INFO.twitter} 
                    className="social-card twitter-card" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title={t.twitter} 
                    aria-label={t.twitter}
                  >
                    <TwitterIcon className="social-icon" />
                    <span className="social-label">{t.twitter}</span>
                  </a>

                  <a 
                    href={CONTACT_INFO.github} 
                    className="social-card github-card" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title={t.github} 
                    aria-label={t.github}
                  >
                    <GithubIcon className="social-icon" />
                    <span className="social-label">{t.github}</span>
                  </a>

                  <a 
                    href={CONTACT_INFO.instagram} 
                    className="social-card instagram-card" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    title={t.instagram} 
                    aria-label={t.instagram}
                  >
                    <InstagramIcon className="social-icon" />
                    <span className="social-label">{t.instagram}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="tab-panel anim-fade-in" id="location-panel" role="tabpanel">
                <div className="location-card">
                  <div className="location-icon-wrapper">
                    <LocationIcon className="location-icon" />
                  </div>
                  <div className="location-info">
                    <div className="location-label">Dirección</div>
                    <div className="location-address">{CONTACT_INFO.address}</div>
                  </div>
                  <a 
                    href={CONTACT_INFO.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener" 
                    className="location-map-button" 
                    title={t.map}
                  >
                    {t.map}
                    <svg className="map-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Downloads Tab */}
            {activeTab === 'downloads' && (
              <div className="tab-panel anim-fade-in" id="downloads-panel" role="tabpanel">
                <div className="downloads-grid">
                  <button 
                    type="button" 
                    className="download-item cv-item" 
                    onClick={() => window.location.href = CONTACT_INFO.cvUrl}
                    title={t.cv}
                  >
                    <div className="download-icon">
                      <CvIcon className="icon-svg" />
                    </div>
                    <div className="download-content">
                      <div className="download-title">{t.cv}</div>
                      <div className="download-subtitle">Ver en web</div>
                    </div>
                    <div className="download-arrow">→</div>
                  </button>

                  <button 
                    type="button" 
                    className="download-item vcard-item" 
                    onClick={handleDownloadVCard} 
                    title={t.download}
                  >
                    <div className="download-icon">
                      <DownloadIcon className="icon-svg" />
                    </div>
                    <div className="download-content">
                      <div className="download-title">Descargar vCard</div>
                      <div className="download-subtitle">Guardar contacto</div>
                    </div>
                    <div className="download-arrow">↓</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="bottom-controls-bar">
          <div className="controls-container">
            <button 
              type="button" 
              aria-label={t.dark} 
              title={t.dark} 
              className="emoji-control" 
              onClick={() => setDarkMode(d => !d)}
            >
              {darkMode ? '🌙' : '☀️'}
            </button>

            <button 
              className="lang-toggle-btn" 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              aria-label="Toggle language"
            >
              {language === 'es' ? 'ES' : 'ENG'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
// Small helper component so we can access the file input via a ref and reliably trigger
// the file chooser on mobile devices where label clicks can be flaky.
function AvatarUpload(){
  const inputRef = useRef(null);
  // find the hidden input sibling and keep a ref to it (works even if input is not wired via React ref)
  React.useEffect(() => {
    // nothing to do, input lives inside the label
  }, []);
  const onClick = (e) => {
    // try to find the input element in the same label
    const label = e.currentTarget.closest('label');
    if (!label) return;
    const input = label.querySelector('input[type="file"]');
    if (input) input.click();
  };
  return (
    <span role="button" tabIndex={0} onClick={onClick} onKeyDown={(e)=>{if(e.key==='Enter' || e.key===' ') onClick(e);}} className="avatar-upload-btn" aria-hidden="false">📷</span>
  );
}

export default ContactCard;
