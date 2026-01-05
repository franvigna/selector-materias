import React from 'react';
import '../styles/LeyendaInferior.css';

const LeyendaInferior: React.FC = () => {
  return (
    <div className="leyenda-inferior">
      <div className="leyenda-contenedor">
        <div className="leyenda-item-mini">
          <div className="color-box-mini cursada"></div>
          <span>Aprobada</span>
        </div>
        <div className="leyenda-item-mini">
          <div className="color-box-mini en-curso"></div>
          <span>En Curso</span>
        </div>
        <div className="leyenda-item-mini">
          <div className="color-box-mini disponible"></div>
          <span>Disponible</span>
        </div>
        <div className="leyenda-item-mini">
          <div className="color-box-mini bloqueada"></div>
          <span>Bloqueada</span>
        </div>
      </div>
    </div>
  );
};

export default LeyendaInferior;