import React, { useState, useMemo, useEffect } from 'react';
import type { Materia, MateriaJSON, EstadoMateria, MateriaConEstado } from '../types/materia';
import GrafoPrecedencia from './GrafoPrecedencia';
import MenuLateral from './MenuLateral';
import InfoSuperior from './InfoSuperior';
import LeyendaInferior from './LeyendaInferior';
import BotonRecomendador from './BotonRecomendador';
import ModalRecomendador from './ModalRecomendador';
import '../styles/SelectorMaterias.css';

const procesarMaterias = (materiasJSON: MateriaJSON[]): Materia[] => {
  return materiasJSON.map(materia => ({
    ...materia,
    esElectiva: materia.nombre.includes('Electiva'),
    esTransversal: materia.codigo.startsWith('9')
  }));
};

const SelectorMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [materiasCursadas, setMateriasCursadas] = useState<string[]>([]);
  const [materiasEnCurso, setMateriasEnCurso] = useState<string[]>([]);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
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

  const cambiarEstado = (codigo: string, nuevoEstado: EstadoMateria) => {
    setMateriasCursadas(prev => prev.filter(c => c !== codigo));
    setMateriasEnCurso(prev => prev.filter(c => c !== codigo));

    if (nuevoEstado === 'cursada') {
      setMateriasCursadas(prev => [...prev, codigo]);
    } else if (nuevoEstado === 'en_curso') {
      setMateriasEnCurso(prev => [...prev, codigo]);
    }
  };

  const handleToggleAnio = (anio: string) => {
    setAnosSeleccionados(prev => ({ ...prev, [anio]: !prev[anio] }));
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
        anosSeleccionados={anosSeleccionados}
        onCambiarEstado={cambiarEstado}
        onToggleAnio={handleToggleAnio}
      />

      <InfoSuperior
        materiasConEstado={materiasConEstado}
        materiasCursadas={materiasCursadas}
        materiasEnCurso={materiasEnCurso}
      />

      <LeyendaInferior />

      <BotonRecomendador onClick={() => setModalAbierto(true)} />

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
      />
    </div>
  );
};

export default SelectorMaterias;