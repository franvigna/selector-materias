import React from 'react';
import type { MateriaConEstado } from '../types/materia';
import '../styles/InfoInferior.css';

interface InfoInferiorProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
}

const InfoInferior: React.FC<InfoInferiorProps> = ({
  materiasConEstado,
  materiasCursadas
}) => {
  const total = materiasConEstado.length;
  const cursadas = materiasCursadas.length;
  const restantes = total - cursadas;
  const porcentaje = Math.round((cursadas / total) * 100);

  return (
    <div className="info-inferior">
      <div className="info-card">
        <div className="info-item">
          <span className="info-label">Total de materias:</span>
          <span className="info-value">{total}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Materias restantes:</span>
          <span className="info-value">{restantes}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Progreso:</span>
          <span className="info-value">{cursadas} de {total} ({porcentaje}%)</span>
        </div>
      </div>

      <div className="leyenda-estados">
        <h4>Estados de Materias</h4>
        <div className="leyenda-items">
          <div className="leyenda-item">
            <div className="color-box cursada"></div>
            <span>Aprobada</span>
          </div>
          <div className="leyenda-item">
            <div className="color-box en-curso"></div>
            <span>En Curso</span>
          </div>
          <div className="leyenda-item">
            <div className="color-box disponible"></div>
            <span>Disponible</span>
          </div>
          <div className="leyenda-item">
            <div className="color-box bloqueada"></div>
            <span>Bloqueada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoInferior;