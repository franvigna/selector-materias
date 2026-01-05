import React from 'react';
import type { MateriaConEstado } from '../types/materia';
import '../styles/LeyendaInferior.css';

interface LeyendaInferiorProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const LeyendaInferior: React.FC<LeyendaInferiorProps> = ({
  materiasConEstado,
  materiasCursadas,
  materiasEnCurso
}) => {
  const cursadas = materiasCursadas.length;
  const enCurso = materiasEnCurso.length;
  const disponibles = materiasConEstado.filter(m => m.estado === 'disponible').length;
  const bloqueadas = materiasConEstado.filter(m => m.estado === 'bloqueada').length;

  return (
    <div className="leyenda-inferior">
      <div className="leyenda-contenedor">
        <div className="estado-badge cursada">
          <span className="estado-numero">{cursadas}</span>
          <span className="estado-texto">Aprobadas</span>
        </div>
        <div className="estado-badge en-curso">
          <span className="estado-numero">{enCurso}</span>
          <span className="estado-texto">En Curso</span>
        </div>
        <div className="estado-badge disponible">
          <span className="estado-numero">{disponibles}</span>
          <span className="estado-texto">Disponibles</span>
        </div>
        <div className="estado-badge bloqueada">
          <span className="estado-numero">{bloqueadas}</span>
          <span className="estado-texto">Bloqueadas</span>
        </div>
      </div>
    </div>
  );
};

export default LeyendaInferior;