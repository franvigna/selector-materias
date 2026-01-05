import React from 'react';
import type { MateriaConEstado } from '../types/materia';
import '../styles/InfoEstadisticas.css';

interface InfoEstadisticasProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const InfoEstadisticas: React.FC<InfoEstadisticasProps> = ({
  materiasConEstado,
  materiasCursadas,
  materiasEnCurso
}) => {
  const cursadas = materiasCursadas.length;
  const enCurso = materiasEnCurso.length;
  const disponibles = materiasConEstado.filter(m => m.estado === 'disponible').length;
  const bloqueadas = materiasConEstado.filter(m => m.estado === 'bloqueada').length;

  return (
    <div className="info-estadisticas-flotante">
      <div className="estadisticas-grid">
        <div className="stat-box cursada">
          <span className="stat-valor">{cursadas}</span>
          <span className="stat-texto">Aprobadas</span>
        </div>
        <div className="stat-box en-curso">
          <span className="stat-valor">{enCurso}</span>
          <span className="stat-texto">En Curso</span>
        </div>
        <div className="stat-box disponible">
          <span className="stat-valor">{disponibles}</span>
          <span className="stat-texto">Disponibles</span>
        </div>
        <div className="stat-box bloqueada">
          <span className="stat-valor">{bloqueadas}</span>
          <span className="stat-texto">Bloqueadas</span>
        </div>
      </div>
    </div>
  );
};

export default InfoEstadisticas;