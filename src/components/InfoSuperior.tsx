import React from 'react';
import type { MateriaConEstado } from '../types/materia';
import '../styles/InfoSuperior.css';

interface InfoSuperiorProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const InfoSuperior: React.FC<InfoSuperiorProps> = ({
  materiasConEstado,
  materiasCursadas,
  materiasEnCurso
}) => {
  const total = materiasConEstado.length;
  const cursadas = materiasCursadas.length;
  const enCurso = materiasEnCurso.length;
  const disponibles = materiasConEstado.filter(m => m.estado === 'disponible').length;
  const bloqueadas = materiasConEstado.filter(m => m.estado === 'bloqueada').length;
  const restantes = total - cursadas;
  const porcentaje = Math.round((cursadas / total) * 100);

  return (
    <div className="info-superior">
      <div className="info-contenedor">
        {/* Información general */}
        <div className="info-general">
          <div className="info-item-compacto">
            <span className="info-label-compacto">Total:</span>
            <span className="info-value-compacto">{total}</span>
          </div>
          <div className="info-item-compacto">
            <span className="info-label-compacto">Restantes:</span>
            <span className="info-value-compacto">{restantes}</span>
          </div>
          <div className="info-item-compacto">
            <span className="info-label-compacto">Progreso:</span>
            <span className="info-value-compacto">{cursadas} de {total} ({porcentaje}%)</span>
          </div>
        </div>

        {/* Separador visual */}
        <div className="separador-vertical"></div>

        {/* Estadísticas por estado */}
        <div className="estadisticas-estados">
          <div className="estado-item cursada">
            <span className="estado-valor">{cursadas}</span>
            <span className="estado-label">Aprobadas</span>
          </div>
          <div className="estado-item en-curso">
            <span className="estado-valor">{enCurso}</span>
            <span className="estado-label">En Curso</span>
          </div>
          <div className="estado-item disponible">
            <span className="estado-valor">{disponibles}</span>
            <span className="estado-label">Disponibles</span>
          </div>
          <div className="estado-item bloqueada">
            <span className="estado-valor">{bloqueadas}</span>
            <span className="estado-label">Bloqueadas</span>
          </div>
        </div>

        {/* Separador visual */}
        <div className="separador-vertical"></div>

        {/* Leyenda de colores */}
        <div className="leyenda-colores">
          <div className="leyenda-item-compacto">
            <div className="color-box cursada"></div>
            <span>Aprobada</span>
          </div>
          <div className="leyenda-item-compacto">
            <div className="color-box en-curso"></div>
            <span>En Curso</span>
          </div>
          <div className="leyenda-item-compacto">
            <div className="color-box disponible"></div>
            <span>Disponible</span>
          </div>
          <div className="leyenda-item-compacto">
            <div className="color-box bloqueada"></div>
            <span>Bloqueada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSuperior;