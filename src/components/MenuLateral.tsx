import React, { useState } from 'react';
import type { MateriaConEstado, EstadoMateria } from '../types/materia';
import '../styles/MenuLateral.css';

interface MenuLateralProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
  anosSeleccionados: { [key: string]: boolean };
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
  onToggleAnio: (anio: string) => void;
}

const MenuLateral: React.FC<MenuLateralProps> = ({
  materiasConEstado,
  anosSeleccionados,
  onCambiarEstado,
  onToggleAnio
}) => {
  const [abierto, setAbierto] = useState(false);

  const toggleMenu = () => {
    setAbierto(!abierto);
  };

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

  return (
    <>
      {/* Botón flotante */}
      <button 
        className={`menu-toggle ${abierto ? 'abierto' : ''}`}
        onClick={toggleMenu}
      >
        {abierto ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {abierto && <div className="menu-overlay" onClick={toggleMenu} />}

      {/* Panel lateral */}
      <div className={`menu-lateral ${abierto ? 'abierto' : ''}`}>
        <div className="menu-header">
          <h2>Planificador de Carrera</h2>
          <p>Ingeniería Informática - UNLaM</p>
        </div>

        {/* Contenido directo - Selector de años */}
        <div className="menu-contenido-directo">
          <h3>Seleccionar materias por año</h3>
          <div className="anos-lista">
            {['1', '2', '3', '4', '5', 'TRANSVERSAL'].map(anio => (
              <label key={anio} className="ano-checkbox">
                <input
                  type="checkbox"
                  checked={anosSeleccionados[anio]}
                  onChange={() => toggleSeleccionAnio(anio)}
                />
                <span>
                  {anio === 'TRANSVERSAL' ? 'Transversales' : `${anio}° Año`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuLateral;