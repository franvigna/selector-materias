import React from 'react';
import type { MateriaConEstado, EstadoMateria } from '../types/materia';
import type { Tema } from '../hooks/useTheme';
import '../styles/InfoSuperior.css';

interface InfoSuperiorProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
  anosSeleccionados: { [key: string]: boolean };
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
  onLimpiarSeleccion: () => void;
  tema: Tema;
  onToggleTema: () => void;
}

const InfoSuperior: React.FC<InfoSuperiorProps> = ({
  materiasConEstado,
  materiasCursadas,
  anosSeleccionados,
  onCambiarEstado,
  onLimpiarSeleccion,
  tema,
  onToggleTema
}) => {
  const total = materiasConEstado.length;
  const cursadas = materiasCursadas.length;
  const restantes = total - cursadas;
  const porcentaje = Math.round((cursadas / total) * 100);

  const toggleSeleccionAnio = (anio: string) => {
    const estaSeleccionado = anosSeleccionados[anio];

    const materiasPorAnio = materiasConEstado.filter(m => {
      if (anio === 'TRANSVERSAL') return m.periodo === 'TRANSVERSAL';
      const anioMateria = m.periodo.charAt(2);
      return anioMateria === anio;
    });

    if (!estaSeleccionado) {
      // Marcar todas como cursadas
      materiasPorAnio.forEach(materia => {
        if (materia.estado !== 'cursada') {
          onCambiarEstado(materia.codigo, 'cursada');
        }
      });
    } else {
      // Desmarcar todas
      materiasPorAnio.forEach(materia => {
        if (materia.estado === 'cursada' || materia.estado === 'en_curso') {
          onCambiarEstado(materia.codigo, 'disponible');
        }
      });
    }
  };

  const handleLimpiar = () => {
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas limpiar toda tu selección?\n\n' +
      'Esto eliminará todas las materias marcadas como aprobadas o en curso.'
    );

    if (confirmar) {
      onLimpiarSeleccion();
    }
  };

  return (
    <div className="info-superior">
      <div className="info-contenedor-completo">
       
        {/* Selector de años a la izquierda */}
        <div className="selector-anos-superior">
           {/* Botón limpiar */}
          <button 
            className="boton-limpiar" 
            onClick={handleLimpiar}
            title="Limpiar toda la selección"
          >
            🗑️
          </button>
          {['1', '2', '3', '4', '5', 'TRANSVERSAL'].map(anio => (
            <label key={anio} className="checkbox-ano-compacto">
              <input
                type="checkbox"
                checked={anosSeleccionados[anio]}
                onChange={() => toggleSeleccionAnio(anio)}
              />
              <span>
                {anio === 'TRANSVERSAL' ? 'Transversales' : `${anio}°`}
              </span>
            </label>
          ))}
          
          
        </div>

        {/* Información a la derecha */}
        <div className="info-contenedor-centrado">
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

          <button
            className={`toggle-tema ${tema === 'dark' ? 'oscuro' : 'claro'}`}
            onClick={onToggleTema}
            role="switch"
            aria-checked={tema === 'dark'}
            title={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <span className="toggle-tema-track">
              <span className="toggle-tema-icono sol" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                  <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </span>
              <span className="toggle-tema-icono luna" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </span>
              <span className="toggle-tema-thumb" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoSuperior;