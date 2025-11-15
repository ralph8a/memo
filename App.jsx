
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ContactCard from "./ContactCard";
import "./ContactCard.css";

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
    // Solo descarga al entrar por primera vez a la página principal
    if (window.location.pathname === "/" || window.location.pathname === "/memo") {
      const link = document.createElement("a");
      link.href = "/memo/tarjeta.jpg";
      link.download = "tarjeta.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);
  return (
    <div>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Inicio</Link> | <Link to="/cv">Ver CV</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ContactCard />} />
        <Route path="/cv" element={<CVPage />} />
      </Routes>
    </div>
  );
}

export default App;
