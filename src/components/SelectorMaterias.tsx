import React, { useState, useMemo, useEffect } from 'react';
import type { Materia, MateriaJSON, EstadoMateria, MateriaConEstado } from '../types/materia';
import GrafoPrecedencia from './GrafoPrecedencia';
import MenuLateral from './MenuLateral';
import InfoSuperior from './InfoSuperior';
import LeyendaInferior from './LeyendaInferior';
import ModalRecomendador from './ModalRecomendador';
import MarcaAgua from './MarcaAgua';
import { useTheme } from '../hooks/useTheme';
import '../styles/SelectorMaterias.css';

const procesarMaterias = (materiasJSON: MateriaJSON[]): Materia[] => {
  return materiasJSON.map(materia => ({
    ...materia,
    esElectiva: materia.nombre.includes('Electiva'),
    esTransversal: materia.codigo.startsWith('9')
  }));
};

const CLAVE_STORAGE = 'selector-materias-seleccion';

const leerSeleccionGuardada = (): { cursadas: string[]; enCurso: string[] } => {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (!raw) return { cursadas: [], enCurso: [] };
    const parsed = JSON.parse(raw);
    return {
      cursadas: Array.isArray(parsed.cursadas) ? parsed.cursadas : [],
      enCurso: Array.isArray(parsed.enCurso) ? parsed.enCurso : []
    };
  } catch {
    return { cursadas: [], enCurso: [] };
  }
};

const SelectorMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [materiasCursadas, setMateriasCursadas] = useState<string[]>(() => leerSeleccionGuardada().cursadas);
  const [materiasEnCurso, setMateriasEnCurso] = useState<string[]>(() => leerSeleccionGuardada().enCurso);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const { tema, toggleTema } = useTheme();

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_STORAGE,
        JSON.stringify({ cursadas: materiasCursadas, enCurso: materiasEnCurso })
      );
    } catch {
      // storage no disponible, se ignora
    }
  }, [materiasCursadas, materiasEnCurso]);

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
        corrCodigo => 
          materiasCursadas.includes(corrCodigo) || 
          materiasEnCurso.includes(corrCodigo)
      );

      if (tieneCorrelativas) {
        return { ...materia, estado: 'disponible' as EstadoMateria };
      }

      return { ...materia, estado: 'bloqueada' as EstadoMateria };
    });
  }, [materias, materiasCursadas, materiasEnCurso]);

  // Calcular dinámicamente si todos los años están seleccionados
  const anosSeleccionados = useMemo(() => {
    const resultado: { [key: string]: boolean } = {
      '1': false,
      '2': false,
      '3': false,
      '4': false,
      '5': false,
      'TRANSVERSAL': false
    };

    for (const anio of Object.keys(resultado)) {
      const materiasDelAnio = materiasConEstado.filter(m => {
        if (anio === 'TRANSVERSAL') return m.periodo === 'TRANSVERSAL';
        const anioMateria = m.periodo.charAt(2);
        return anioMateria === anio;
      });

      // Si hay materias en ese año, verificar si TODAS están cursadas
      if (materiasDelAnio.length > 0) {
        resultado[anio] = materiasDelAnio.every(m => m.estado === 'cursada');
      }
    }

    return resultado;
  }, [materiasConEstado]);

  const cambiarEstado = (codigo: string, nuevoEstado: EstadoMateria) => {
    setMateriasCursadas(prev => prev.filter(c => c !== codigo));
    setMateriasEnCurso(prev => prev.filter(c => c !== codigo));

    if (nuevoEstado === 'cursada') {
      setMateriasCursadas(prev => [...prev, codigo]);
    } else if (nuevoEstado === 'en_curso') {
      setMateriasEnCurso(prev => [...prev, codigo]);
    }
  };

  const handleImportar = (cursadas: string[], enCurso: string[]) => {
    setMateriasCursadas(cursadas);
    setMateriasEnCurso(enCurso);
  };

  const handleLimpiarSeleccion = () => {
    setMateriasCursadas([]);
    setMateriasEnCurso([]);
  };

  if (cargando) {
    return (
      <div className="pantalla-completa loading">
        <h2>Cargando materias...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pantalla-completa error">
        <h2>Error al cargar las materias</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="app-pantalla-completa">
      <MenuLateral
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
        materiasEnCurso={materiasEnCurso}
        materias={materias}
        onCambiarEstado={cambiarEstado}
        onImportar={handleImportar}
        onAbrirRecomendador={() => setModalAbierto(true)}
      />

      <InfoSuperior
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
        materiasEnCurso={materiasEnCurso}
        anosSeleccionados={anosSeleccionados}
        onCambiarEstado={cambiarEstado}
        onLimpiarSeleccion={handleLimpiarSeleccion}
        tema={tema}
        onToggleTema={toggleTema}
      />

      <LeyendaInferior
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
        materiasEnCurso={materiasEnCurso}
      />

      <MarcaAgua />

      <ModalRecomendador
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        materias={materias}
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
      />

      <GrafoPrecedencia
        materiasConEstado={materiasConEstado}
        onCambiarEstado={cambiarEstado}
        tema={tema}
      />
    </div>
  );
};

export default SelectorMaterias;