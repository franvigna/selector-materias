import React from 'react';
import type { Materia, MateriaConEstado } from '../types/materia';
import '../styles/ModalRecomendador.css';

interface ModalRecomendadorProps {
  isOpen: boolean;
  onClose: () => void;
  materias: Materia[];
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
}

interface MateriaConDistancia extends MateriaConEstado {
  distanciaAlTitulo: number;
}

const ModalRecomendador: React.FC<ModalRecomendadorProps> = ({
  isOpen,
  onClose,
  materias,
  materiasConEstado,
  materiasCursadas
}) => {
  if (!isOpen) return null;

  // Calcular la distancia de cada materia al título
  const calcularDistanciaAlTitulo = (codigoMateria: string, visitados: Set<string> = new Set()): number => {
    if (visitados.has(codigoMateria)) return 0;
    visitados.add(codigoMateria);

    const materiasQueLaRequieren = materias.filter(m => 
      m.correlativas.includes(codigoMateria)
    );

    if (materiasQueLaRequieren.length === 0) {
      return 0;
    }

    const distancias = materiasQueLaRequieren.map(m => 
      calcularDistanciaAlTitulo(m.codigo, new Set(visitados))
    );

    return 1 + Math.max(...distancias);
  };

  // Filtrar materias NO cursadas y calcular distancia
  const materiasConDistancia: MateriaConDistancia[] = materiasConEstado
    .filter(materia => !materiasCursadas.includes(materia.codigo))
    .map(materia => ({
      ...materia,
      distanciaAlTitulo: calcularDistanciaAlTitulo(materia.codigo)
    }));

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="modal-recomendador">
        {/* Header con botón cerrar */}
        <div className="modal-header">
          <div>
            <h2>Análisis de Distancia al Título</h2>
            <p>Materias pendientes ordenadas por cantidad de materias que dependen de ellas</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Contenido - Tabla */}
        <div className="modal-contenido">
          {materiasConDistancia.length === 0 ? (
            <div className="sin-materias">
              <div className="sin-materias-icono">🎓</div>
              <h3>¡Felicitaciones!</h3>
              <p>Has completado todas las materias de la carrera</p>
            </div>
          ) : (
            <div className="tabla-wrapper">
              <table className="tabla-distancias">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Materia</th>
                    <th>Materias por Delante</th>
                  </tr>
                </thead>
                <tbody>
                  {materiasConDistancia
                    .sort((a, b) => b.distanciaAlTitulo - a.distanciaAlTitulo)
                    .map(materia => (
                      <tr key={materia.codigo} className={`fila-${materia.estado}`}>
                        <td className="col-codigo">{materia.codigo}</td>
                        <td className="col-nombre">{materia.nombre}</td>
                        <td className="col-distancia">
                          <span className="distancia-numero">{materia.distanciaAlTitulo}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalRecomendador;