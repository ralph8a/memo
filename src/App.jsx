
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ContactCard from "./ContactCard";
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
      <Routes>
        <Route path="/cv" element={<CVPage />} />
        <Route path="/tarjeta" element={<Tarjeta />} />
      </Routes>
    </>
  );
}

export default App;
