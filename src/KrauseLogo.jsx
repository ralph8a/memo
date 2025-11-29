import React from 'react';
import './KrauseLogo.css';

const KrauseLogo = ({ className, style }) => {
  return (
    <svg 
      viewBox="0 0 80 80" 
      className={`krause-shield ${className || ''}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo exterior */}
      <ellipse 
        className="shield-circle" 
        cx="40" 
        cy="40" 
        rx="24" 
        ry="24" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
      />
      
      {/* Rombo/Diamante */}
      <path 
        className="shield-diamond" 
        d="M40 20 L65 40 L40 75 L15 40 Z" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
      />
      
      {/* Arco protector */}
      <path 
        className="shield-arc" 
        d="M22 54 Q40 28 58 54" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
      />
      
      {/* Línea vertical */}
      <line 
        className="shield-line" 
        x1="40" 
        y1="54" 
        x2="40" 
        y2="72" 
        stroke="currentColor" 
        strokeWidth="3" 
      />
    </svg>
  );
};

export default KrauseLogo;
