import React, { useMemo } from 'react';
import type { Materia, MateriaConEstado } from '../types/materia';
import '../styles/RecomendadorMaterias.css';

interface RecomendadorMateriasProps {
  materias: Materia[];
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
}

interface MateriaConDistancia extends MateriaConEstado {
  distanciaAlTitulo: number;
}

const RecomendadorMaterias: React.FC<RecomendadorMateriasProps> = ({ 
  materias,
  materiasConEstado
}) => {
  // Calcular la distancia de cada materia al título (materia más alejada)
  const calcularDistanciaAlTitulo = (codigoMateria: string, visitados: Set<string> = new Set()): number => {
    // Evitar ciclos
    if (visitados.has(codigoMateria)) return 0;
    visitados.add(codigoMateria);

    // Encontrar materias que tienen esta como correlativa
    const materiasQueLaRequieren = materias.filter(m => 
      m.correlativas.includes(codigoMateria)
    );

    // Si ninguna materia la requiere, es una materia terminal (distancia 0)
    if (materiasQueLaRequieren.length === 0) {
      return 0;
    }

    // Calcular la distancia máxima recursivamente
    const distancias = materiasQueLaRequieren.map(m => 
      calcularDistanciaAlTitulo(m.codigo, new Set(visitados))
    );

    return 1 + Math.max(...distancias);
  };

  // Materias con su distancia calculada
  const materiasConDistancia = useMemo<MateriaConDistancia[]>(() => {
    return materiasConEstado.map(materia => ({
      ...materia,
      distanciaAlTitulo: calcularDistanciaAlTitulo(materia.codigo)
    }));
  }, [materiasConEstado, materias]);

  return (
    <div className="recomendador-container">
      <div className="recomendador-wrapper">
        <header className="recomendador-header">
          <h2>Análisis de Distancia al Título</h2>
          <p>Cantidad de materias que hay por delante de cada una</p>
        </header>

        {/* Lista completa de distancias */}
        <div className="distancias-section">
          <div className="tabla-distancias-container">
            <table className="tabla-distancias">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Materia</th>
                  <th>Estado</th>
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
                      <td className="col-estado">
                        <span className={`badge-estado ${materia.estado}`}>
                          {materia.estado === 'cursada' && '✓ Cursada'}
                          {materia.estado === 'en_curso' && '📚 En curso'}
                          {materia.estado === 'disponible' && '✓ Disponible'}
                          {materia.estado === 'bloqueada' && '🔒 Bloqueada'}
                        </span>
                      </td>
                      <td className="col-distancia">
                        <span className="distancia-numero">{materia.distanciaAlTitulo}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecomendadorMaterias;