import React from 'react';
import type { MateriaConEstado, EstadoMateria } from '../types/materia';
import '../styles/SelectorAnios.css';

interface SelectorAniosProps {
  materiasConEstado: MateriaConEstado[];
  anosSeleccionados: { [key: string]: boolean };
  onToggleAnio: (anio: string) => void;
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
}

const SelectorAnios: React.FC<SelectorAniosProps> = ({
  materiasConEstado,
  anosSeleccionados,
  onToggleAnio,
  onCambiarEstado
}) => {
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
    <div className="selector-anos-container">
      <div className="selector-anos-wrapper">
        <div className="selector-anos">
            <h1>Ingeniería Informática - UNLaM</h1>

          <div className="anos-checkboxes">
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['1']}
                onChange={() => toggleSeleccionAnio('1')}
              />
              <span>Primer Año</span>
            </label>
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['2']}
                onChange={() => toggleSeleccionAnio('2')}
              />
              <span>Segundo Año</span>
            </label>
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['3']}
                onChange={() => toggleSeleccionAnio('3')}
              />
              <span>Tercer Año</span>
            </label>
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['4']}
                onChange={() => toggleSeleccionAnio('4')}
              />
              <span>Cuarto Año</span>
            </label>
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['5']}
                onChange={() => toggleSeleccionAnio('5')}
              />
              <span>Quinto Año</span>
            </label>
            <label className="checkbox-ano">
              <input
                type="checkbox"
                checked={anosSeleccionados['TRANSVERSAL']}
                onChange={() => toggleSeleccionAnio('TRANSVERSAL')}
              />
              <span>Transversales</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorAnios;