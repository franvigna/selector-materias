import React, { useState, useMemo, useEffect } from 'react';
import type { Materia, MateriaJSON, EstadoMateria, MateriaConEstado, PeriodoInfo } from '../types/materia';
import '../styles/SelectorMaterias.css';
import Estadisticas from './Estadisticas';
import RecomendadorMaterias from './RecomendadorMaterias';
import GrafoPrecedencia from './GrafoPrecedencia';
import SelectorAnios from './SelectorAnios';

const procesarMaterias = (materiasJSON: MateriaJSON[]): Materia[] => {
  return materiasJSON.map(materia => ({
    ...materia,
    esElectiva: materia.nombre.includes('Electiva'),
    esTransversal: materia.codigo.startsWith('9')
  }));
};

const parsearPeriodo = (periodo: string): PeriodoInfo => {
  if (periodo === 'TRANSVERSAL') {
    return { cuatrimestre: 0, anio: 0, label: 'Materias Transversales' };
  }

  const cuatrimestre = parseInt(periodo.charAt(0));
  const anio = parseInt(periodo.charAt(2));
  return {
    cuatrimestre,
    anio,
    label: `${anio}° Año - ${cuatrimestre}° Cuatrimestre`
  };
};

const SelectorMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [materiasCursadas, setMateriasCursadas] = useState<string[]>([]);
  const [materiasEnCurso, setMateriasEnCurso] = useState<string[]>([]);
  const [busqueda, _] = useState<string>('');
  const [anosSeleccionados, setAnosSeleccionados] = useState<{ [key: string]: boolean }>({
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    'TRANSVERSAL': false
  });

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setCargando(true);
        const response = await fetch('/data/materias.json');

        if (!response.ok) {
          throw new Error('Error al cargar las materias');
        }

        const data: MateriaJSON[] = await response.json();
        const materiasProcessadas = procesarMaterias(data);
        setMaterias(materiasProcessadas);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error cargando materias:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarMaterias();
  }, []);

  const materiasConEstado = useMemo<MateriaConEstado[]>(() => {
    return materias.map(materia => {
      if (materiasCursadas.includes(materia.codigo)) {
        return { ...materia, estado: 'cursada' as EstadoMateria };
      }

      if (materiasEnCurso.includes(materia.codigo)) {
        return { ...materia, estado: 'en_curso' as EstadoMateria };
      }

      const tieneCorrelativas = materia.correlativas.every(
        corrCodigo => materiasCursadas.includes(corrCodigo)
      );

      if (tieneCorrelativas) {
        return { ...materia, estado: 'disponible' as EstadoMateria };
      }

      return { ...materia, estado: 'bloqueada' as EstadoMateria };
    });
  }, [materias, materiasCursadas, materiasEnCurso]);

  const materiasFiltradas = useMemo(() => {
    if (!busqueda) return materiasConEstado;

    const busquedaLower = busqueda.toLowerCase();
    return materiasConEstado.filter(m =>
      m.nombre.toLowerCase().includes(busquedaLower) ||
      m.codigo.includes(busqueda)
    );
  }, [materiasConEstado, busqueda]);

  const materiasAgrupadas = useMemo(() => {
    const grupos: { [key: string]: MateriaConEstado[] } = {};

    materiasFiltradas.forEach(materia => {
      if (!grupos[materia.periodo]) {
        grupos[materia.periodo] = [];
      }
      grupos[materia.periodo].push(materia);
    });

    const periodosOrdenados = Object.keys(grupos).sort((a, b) => {
      if (a === 'TRANSVERSAL') return 1;
      if (b === 'TRANSVERSAL') return 1;
      if (a === 'ELECTIVA') return 1;
      if (b === 'ELECTIVA') return 1;

      const anioA = parseInt(a.charAt(2));
      const anioB = parseInt(b.charAt(2));
      const cuatrimestreA = parseInt(a.charAt(0));
      const cuatrimestreB = parseInt(b.charAt(0));

      if (anioA !== anioB) {
        return anioA - anioB;
      }

      return cuatrimestreA - cuatrimestreB;
    });

    return periodosOrdenados.map(periodo => ({
      periodo,
      label: parsearPeriodo(periodo).label,
      materias: grupos[periodo]
    }));
  }, [materiasFiltradas]);

  const cambiarEstado = (codigo: string, nuevoEstado: EstadoMateria) => {
    setMateriasCursadas(prev => prev.filter(c => c !== codigo));
    setMateriasEnCurso(prev => prev.filter(c => c !== codigo));

    if (nuevoEstado === 'cursada') {
      setMateriasCursadas(prev => [...prev, codigo]);
    } else if (nuevoEstado === 'en_curso') {
      setMateriasEnCurso(prev => [...prev, codigo]);
    }
  };

  const obtenerNombreMateria = (codigo: string): string => {
    const materia = materias.find(m => m.codigo === codigo);
    return materia ? materia.nombre : codigo;
  };

  const getEstadoClass = (estado: EstadoMateria): string => {
    switch (estado) {
      case 'cursada': return 'estado-cursada';
      case 'en_curso': return 'estado-en-curso';
      case 'disponible': return 'estado-disponible';
      case 'bloqueada': return 'estado-bloqueada';
      default: return '';
    }
  };

  const handleToggleAnio = (anio: string) => {
    setAnosSeleccionados(prev => ({ ...prev, [anio]: !prev[anio] }));
  };

  if (cargando) {
    return (
      <div className="selector-container">
        <div className="loading-state">
          <h2>Cargando materias...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selector-container">
        <div className="error-state">
          <h2>Error al cargar las materias</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Primera sección - Selector de Años + Grafo - 100vh */}
      <div className="primera-seccion">
        <SelectorAnios
          materiasConEstado={materiasConEstado}
          anosSeleccionados={anosSeleccionados}
          onToggleAnio={handleToggleAnio}
          onCambiarEstado={cambiarEstado}
        />
        <div className="grafo-section">
          <GrafoPrecedencia 
            materiasConEstado={materiasConEstado}
            onCambiarEstado={cambiarEstado}
          />
        </div>
      </div>

      {/* Segunda sección - Tabla de materias - 100vh */}
      <div className="selector-container">
        <div className="selector-wrapper">
          <div className="tabla-container tabla-scroll">
            <table className="tabla-materias">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Materia</th>
                  <th>Correlativas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiasAgrupadas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="tabla-vacia">
                      No se encontraron materias
                    </td>
                  </tr>
                ) : (
                  materiasAgrupadas.map(grupo => (
                    <React.Fragment key={grupo.periodo}>
                      <tr className="separador-periodo">
                        <td colSpan={4}>
                          <div className="periodo-header">
                            <span className="periodo-label">{grupo.label}</span>
                            <span className="periodo-count">{grupo.materias.length} materias</span>
                          </div>
                        </td>
                      </tr>

                      {grupo.materias.map(materia => (
                        <tr key={materia.codigo} className={`fila-materia ${getEstadoClass(materia.estado)}`}>
                          <td className="col-codigo">{materia.codigo}</td>
                          <td className="col-nombre">
                            {materia.nombre}
                            {materia.esElectiva && <span className="badge-electiva">Electiva</span>}
                            {materia.esTransversal && <span className="badge-transversal">Transversal</span>}
                          </td>
                          <td className="col-correlativas">
                            {materia.correlativas.length === 0 ? (
                              <span className="sin-correlativas">-</span>
                            ) : materia.estado === 'bloqueada' ? (
                              <div className="correlativas-faltantes">
                                {materia.correlativas
                                  .filter(c => !materiasCursadas.includes(c))
                                  .map(c => (
                                    <span key={c} className="correlativa-faltante" title={obtenerNombreMateria(c)}>
                                      {c}
                                    </span>
                                  ))}
                              </div>
                            ) : (
                              <span className="correlativas-ok">✓ {materia.correlativas.length}</span>
                            )}
                          </td>
                          <td className="col-acciones">
                            {materia.estado === 'disponible' && (
                              <>
                                <button
                                  onClick={() => cambiarEstado(materia.codigo, 'cursada')}
                                  className="btn-accion cursada"
                                  title="Marcar como cursada"
                                >
                                  Cursada
                                </button>
                                <button
                                  onClick={() => cambiarEstado(materia.codigo, 'en_curso')}
                                  className="btn-accion en-curso"
                                  title="Marcar como en curso"
                                >
                                  Cursando
                                </button>
                              </>
                            )}
                            {materia.estado === 'en_curso' && (
                              <>
                                <button
                                  onClick={() => cambiarEstado(materia.codigo, 'cursada')}
                                  className="btn-accion cursada"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => cambiarEstado(materia.codigo, 'disponible')}
                                  className="btn-accion cancelar"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {materia.estado === 'cursada' && (
                              <button
                                onClick={() => cambiarEstado(materia.codigo, 'disponible')}
                                className="btn-accion desmarcar"
                              >
                                Desmarcar
                              </button>
                            )}
                            {materia.estado === 'bloqueada' && (
                              <span className="texto-bloqueada">Falta correlativas</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tercera sección - Estadísticas - 100vh */}
      <Estadisticas
        materias={materiasConEstado}
        materiasCursadas={materiasCursadas}
        materiasEnCurso={materiasEnCurso}
      />

      {/* Cuarta sección - Recomendador - 100vh */}
      <RecomendadorMaterias
        materias={materias}
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
      />
    </>
  );
};

export default SelectorMaterias;