import React, { useRef } from "react";

const cardData = {
  nombre: "Guillermo Krause Sepulveda",
  puesto: "Agente de Seguros",
  email: "Guillermo.Krause@ksinsurancee.com",
  telefono: "+52 5580190389",
  linkedin: "linkedin.com/in/guillermo-krause-s-238895248",
  ubicacion: "CDMX, México"
};

export default function Tarjeta() {
  const cardRef = useRef();

  const handleDownload = async () => {
    const node = cardRef.current;
    if (!node) return;
    // Usar html2canvas para capturar el componente como imagen
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(node);
    const link = document.createElement("a");
    link.download = "tarjeta.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
      <div
        ref={cardRef}
        style={{
          width: 340,
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          background: "#fff",
          color: "#222",
          fontFamily: "sans-serif"
        }}
      >
        <h2 style={{ margin: 0 }}>{cardData.nombre}</h2>
        <p style={{ margin: "8px 0", fontWeight: "bold" }}>{cardData.puesto}</p>
        <p style={{ margin: "4px 0" }}>📧 {cardData.email}</p>
        <p style={{ margin: "4px 0" }}>📞 {cardData.telefono}</p>
        <p style={{ margin: "4px 0" }}>🔗 {cardData.linkedin}</p>
        <p style={{ margin: "4px 0" }}>📍 {cardData.ubicacion}</p>
      </div>
      <button onClick={handleDownload} style={{ marginTop: 24, padding: "8px 24px", borderRadius: 8, border: "none", background: "#1976d2", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
        Descargar tarjeta como imagen
      </button>
    </div>
  );
}
