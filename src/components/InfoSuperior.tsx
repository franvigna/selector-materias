import React from 'react';
import type { MateriaConEstado, EstadoMateria } from '../types/materia';
import '../styles/InfoSuperior.css';

interface InfoSuperiorProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
  anosSeleccionados: { [key: string]: boolean };
  onToggleAnio: (anio: string) => void;
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
  onLimpiarSeleccion: () => void;
}

const InfoSuperior: React.FC<InfoSuperiorProps> = ({
  materiasConEstado,
  materiasCursadas,
  anosSeleccionados,
  onToggleAnio,
  onCambiarEstado,
  onLimpiarSeleccion
}) => {
  const total = materiasConEstado.length;
  const cursadas = materiasCursadas.length;
  const restantes = total - cursadas;
  const porcentaje = Math.round((cursadas / total) * 100);

  const toggleSeleccionAnio = (anio: string) => {
    const nuevoEstado = !anosSeleccionados[anio];
    onToggleAnio(anio);

    const materiasPorAnio = materiasConEstado.filter(m => {
      if (anio === 'TRANSVERSAL') return m.periodo === 'TRANSVERSAL';
      const anioMateria = m.periodo.charAt(2);
      return anioMateria === anio;
    });

    if (nuevoEstado) {
      materiasPorAnio.forEach(materia => {
        if (materia.estado === 'disponible' || materia.estado === 'bloqueada') {
          onCambiarEstado(materia.codigo, 'cursada');
        }
      });
    } else {
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
        </div>
      </div>
    </div>
  );
};

export default InfoSuperior;