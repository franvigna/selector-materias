import React from 'react';
import '../styles/BotonRecomendador.css';

interface BotonRecomendadorProps {
  onClick: () => void;
}

const BotonRecomendador: React.FC<BotonRecomendadorProps> = ({ onClick }) => {
  return (
    <button className="boton-recomendador" onClick={onClick} title="Análisis de materias">
      <span className="boton-icono">📊</span>
      <span className="boton-texto">Análisis</span>
    </button>
  );
};

export default BotonRecomendador;