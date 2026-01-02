import React, { useState, useMemo, useEffect } from 'react';
import type { Materia, MateriaJSON, EstadoMateria, MateriaConEstado, PeriodoInfo } from '../types/materia';
import '../styles/SelectorMaterias.css';

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
  if (periodo === 'ELECTIVA') {
    return { cuatrimestre: 0, anio: 0, label: 'Materias Electivas' };
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
  const [busqueda, setBusqueda] = useState<string>('');

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

  // Agrupar materias por período
  // Agrupar materias por período
const materiasAgrupadas = useMemo(() => {
  const grupos: { [key: string]: MateriaConEstado[] } = {};
  
  materiasFiltradas.forEach(materia => {
    if (!grupos[materia.periodo]) {
      grupos[materia.periodo] = [];
    }
    grupos[materia.periodo].push(materia);
  });

  // Ordenar los períodos: primero por año, luego por cuatrimestre
  const periodosOrdenados = Object.keys(grupos).sort((a, b) => {
    // Transversales y electivas al final
    if (a === 'TRANSVERSAL') return 1;
    if (b === 'TRANSVERSAL') return 1;
    if (a === 'ELECTIVA') return 1;
    if (b === 'ELECTIVA') return 1;
    
    // Extraer año y cuatrimestre de cada período (formato: 1C1A)
    const anioA = parseInt(a.charAt(2)); // posición 2 es el año
    const anioB = parseInt(b.charAt(2));
    const cuatrimestreA = parseInt(a.charAt(0)); // posición 0 es el cuatrimestre
    const cuatrimestreB = parseInt(b.charAt(0));
    
    // Primero ordenar por año
    if (anioA !== anioB) {
      return anioA - anioB;
    }
    
    // Si el año es el mismo, ordenar por cuatrimestre
    return cuatrimestreA - cuatrimestreB;
  });

  return periodosOrdenados.map(periodo => ({
    periodo,
    label: parsearPeriodo(periodo).label,
    materias: grupos[periodo]
  }));
}, [materiasFiltradas]);

  const estadisticas = useMemo(() => {
    return {
      cursadas: materiasCursadas.length,
      en_curso: materiasEnCurso.length,
      disponibles: materiasConEstado.filter(m => m.estado === 'disponible').length,
      bloqueadas: materiasConEstado.filter(m => m.estado === 'bloqueada').length,
      total: materias.length
    };
  }, [materiasCursadas, materiasEnCurso, materiasConEstado, materias]);

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

  const reiniciar = () => {
    if (window.confirm('¿Estás seguro de reiniciar todo?')) {
      setMateriasCursadas([]);
      setMateriasEnCurso([]);
    }
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

  const getEstadoTexto = (estado: EstadoMateria): string => {
    switch (estado) {
      case 'cursada': return '✓ Cursada';
      case 'en_curso': return '📚 En curso';
      case 'disponible': return '✓ Disponible';
      case 'bloqueada': return '🔒 Bloqueada';
      default: return '';
    }
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
    <div className="selector-container">
      <div className="selector-wrapper">
        <header className="selector-header">
          <h1>Planificador de Carrera</h1>
          <p>Ingenieria en Informática - UNLaM</p>
        </header>

        {/* Barra de estadísticas */}
        <div className="stats-container">
          <div className="stat-card cursada">
            <span className="stat-numero">{estadisticas.cursadas}</span>
            <span className="stat-label">Cursadas</span>
          </div>
          <div className="stat-card en-curso">
            <span className="stat-numero">{estadisticas.en_curso}</span>
            <span className="stat-label">En curso</span>
          </div>
          <div className="stat-card disponible">
            <span className="stat-numero">{estadisticas.disponibles}</span>
            <span className="stat-label">Disponibles</span>
          </div>
          <div className="stat-card bloqueada">
            <span className="stat-numero">{estadisticas.bloqueadas}</span>
            <span className="stat-label">Bloqueadas</span>
          </div>
          <div className="stat-card total">
            <span className="stat-numero">{estadisticas.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <div className="filtro-grupo">
            <label>Buscar materia:</label>
            <input
              type="text"
              placeholder="Nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          <button onClick={reiniciar} className="btn-reiniciar">
            🔄 Reiniciar todo
          </button>
        </div>

        {/* Tabla de materias agrupadas por período */}
        <div className="tabla-container">
          <table className="tabla-materias">
            <thead>
              <tr>
                <th>Código</th>
                <th>Materia</th>
                <th>Horas</th>
                <th>Estado</th>
                <th>Correlativas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiasAgrupadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="tabla-vacia">
                    No se encontraron materias
                  </td>
                </tr>
              ) : (
                materiasAgrupadas.map(grupo => (
                  <React.Fragment key={grupo.periodo}>
                    {/* Separador de período */}
                    <tr className="separador-periodo">
                      <td colSpan={6}>
                        <div className="periodo-header">
                          <span className="periodo-label">{grupo.label}</span>
                          <span className="periodo-count">{grupo.materias.length} materias</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Materias del período */}
                    {grupo.materias.map(materia => (
                      <tr key={materia.codigo} className={`fila-materia ${getEstadoClass(materia.estado)}`}>
                        <td className="col-codigo">{materia.codigo}</td>
                        <td className="col-nombre">
                          {materia.nombre}
                          {materia.esElectiva && <span className="badge-electiva">Electiva</span>}
                          {materia.esTransversal && <span className="badge-transversal">Transversal</span>}
                        </td>
                        <td className="col-horas">{materia.horasSemanales}h</td>
                        <td className="col-estado">
                          <span className={`badge-estado ${getEstadoClass(materia.estado)}`}>
                            {getEstadoTexto(materia.estado)}
                          </span>
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
                                onClick={() => cambiarEstado(materia.codigo, 'en_curso')}
                                className="btn-accion en-curso"
                                title="Marcar como en curso"
                              >
                                Cursando
                              </button>
                              <button 
                                onClick={() => cambiarEstado(materia.codigo, 'cursada')}
                                className="btn-accion cursada"
                                title="Marcar como cursada"
                              >
                                Cursada
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
  );
};

export default SelectorMaterias;