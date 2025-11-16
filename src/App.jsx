
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ContactCard from "./ContactCard";
import "./ContactCard.css";
import Tarjeta from "./components/Tarjeta";

function CVPage() {
  return (
    <div>
      <h2>Currículum Vitae</h2>
      <p>Aquí va el contenido del CV.</p>
      <Link to="/">Volver</Link>
    </div>
  );
}

function App() {
  React.useEffect(() => {
    // Download tarjeta automatically on first load
    if (window.location.pathname === "/" || window.location.pathname === "/memo") {
      const link = document.createElement("a");
         link.href = `${import.meta.env.BASE_URL}assets/tarjeta.jpg`;
      link.download = "tarjeta.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);
  const handleDescargarTarjeta = () => {
    const link = document.createElement("a");
       link.href = `${import.meta.env.BASE_URL}assets/tarjeta.jpg`;
    link.download = "tarjeta.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Show ContactCard first, then menu and routes */}
      <ContactCard />
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Inicio</Link> | <Link to="/cv">Ver CV</Link> | <Link to="/tarjeta">Ver tarjeta</Link> | <button style={{marginLeft:4, padding:"2px 10px", borderRadius:6, border:"none", background:"#1976d2", color:"#fff", fontWeight:"bold", cursor:"pointer"}} onClick={handleDescargarTarjeta}>Descargar tarjeta</button>
      </nav>
      <Routes>
        <Route path="/cv" element={<CVPage />} />
        <Route path="/tarjeta" element={<Tarjeta />} />
      </Routes>
    </>
  );
}

export default App;
