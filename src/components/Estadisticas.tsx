import React, { useMemo } from 'react';
import type { MateriaConEstado } from '../types/materia';
import '../styles/Estadisticas.css';

interface EstadisticasProps {
  materias: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const Estadisticas: React.FC<EstadisticasProps> = ({ 
  materias, 
  materiasCursadas, 
  materiasEnCurso 
}) => {
  const estadisticas = useMemo(() => {
    const cursadas = materiasCursadas.length;
    const enCurso = materiasEnCurso.length;
    const disponibles = materias.filter(m => m.estado === 'disponible').length;
    const bloqueadas = materias.filter(m => m.estado === 'bloqueada').length;
    const total = materias.length;
    const porcentajeCompletado = Math.round((cursadas / total) * 100);
    
    // Horas totales cursadas
    const horasCursadas = materias
      .filter(m => materiasCursadas.includes(m.codigo))
      .reduce((acc, m) => acc + m.horasSemanales, 0);

    const horasTotales = materias.reduce((acc, m) => acc + m.horasSemanales, 0);
    
    return {
      cursadas,
      enCurso,
      disponibles,
      bloqueadas,
      total,
      porcentajeCompletado,
      horasCursadas,
      horasTotales,
      faltantes: total - cursadas
    };
  }, [materias, materiasCursadas, materiasEnCurso]);

  return (
    <div className="estadisticas-container">
      <div className="estadisticas-wrapper">
        <header className="estadisticas-header">
          <h2>Estadísticas de tu Carrera</h2>
          <p>Resumen de tu progreso académico</p>
        </header>

        <div className="stats-grid">
          {/* Card principal - Progreso */}
          <div className="stat-card-large">
            <h3>Progreso General</h3>
            <div className="progress-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#7e57c2"
                  strokeWidth="20"
                  strokeDasharray={`${estadisticas.porcentajeCompletado * 5.03} 503`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="progress-text">
                <span className="progress-number">{estadisticas.porcentajeCompletado}%</span>
                <span className="progress-label">Completado</span>
              </div>
            </div>
            <div className="progress-details">
              <div className="detail-item">
                <span className="detail-number">{estadisticas.cursadas}</span>
                <span className="detail-label">Aprobadas</span>
              </div>
              <div className="detail-item">
                <span className="detail-number">{estadisticas.faltantes}</span>
                <span className="detail-label">Faltantes</span>
              </div>
            </div>
          </div>

          {/* Cards secundarias */}
          <div className="stat-card cursada">
            <div className="stat-icon">✓</div>
            <span className="stat-numero">{estadisticas.cursadas}</span>
            <span className="stat-label">Materias Aprobadas</span>
          </div>

          <div className="stat-card en-curso">
            <div className="stat-icon">📚</div>
            <span className="stat-numero">{estadisticas.enCurso}</span>
            <span className="stat-label">En Curso</span>
          </div>

          <div className="stat-card disponible">
            <div className="stat-icon">✨</div>
            <span className="stat-numero">{estadisticas.disponibles}</span>
            <span className="stat-label">Disponibles</span>
          </div>

          <div className="stat-card bloqueada">
            <div className="stat-icon">🔒</div>
            <span className="stat-numero">{estadisticas.bloqueadas}</span>
            <span className="stat-label">Bloqueadas</span>
          </div>

          <div className="stat-card total">
            <div className="stat-icon">📖</div>
            <span className="stat-numero">{estadisticas.total}</span>
            <span className="stat-label">Total de Materias</span>
          </div>

          <div className="stat-card horas">
            <div className="stat-icon">⏰</div>
            <span className="stat-numero">{estadisticas.horasCursadas}</span>
            <span className="stat-label">Horas Cursadas de {estadisticas.horasTotales}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;