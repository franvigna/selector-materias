import React, { useState, useRef } from 'react';
import type { MateriaConEstado, EstadoMateria, Materia } from '../types/materia';
import '../styles/MenuLateral.css';

interface MenuLateralProps {
  materiasConEstado: MateriaConEstado[];
  materiasCursadas: string[];
  materiasEnCurso: string[];
  materias: Materia[];
  onCambiarEstado: (codigo: string, nuevoEstado: EstadoMateria) => void;
  onImportar: (cursadas: string[], enCurso: string[]) => void;
  onAbrirRecomendador: () => void;
}

interface ExportData {
  version: string;
  fecha: string;
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const MenuLateral: React.FC<MenuLateralProps> = ({
  materiasCursadas,
  materiasEnCurso,
  onImportar,
  onAbrirRecomendador
}) => {
  const [abierto, setAbierto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = () => {
    setAbierto(!abierto);
  };

  const handleExportar = () => {
    const data: ExportData = {
      version: '1.0',
      fecha: new Date().toISOString(),
      materiasCursadas,
      materiasEnCurso
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `progreso-carrera-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Progreso exportado exitosamente');
  };

  const handleImportar = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: ExportData = JSON.parse(content);
        
        if (!data.materiasCursadas || !data.materiasEnCurso) {
          alert('❌ Archivo inválido: formato incorrecto');
          return;
        }

        const confirmar = window.confirm(
          `¿Importar progreso del ${new Date(data.fecha).toLocaleDateString()}?\n\n` +
          `📚 ${data.materiasCursadas.length} materias aprobadas\n` +
          `📖 ${data.materiasEnCurso.length} materias en curso\n\n` +
          `⚠️ Esto sobrescribirá tu progreso actual.`
        );

        if (confirmar) {
          onImportar(data.materiasCursadas, data.materiasEnCurso);
          alert('✅ Progreso importado exitosamente');
          setAbierto(false);
        }
      } catch (error) {
        alert('❌ Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
        console.error('Error al importar:', error);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleRecomendador = () => {
    onAbrirRecomendador();
    setAbierto(false);
  };

  return (
    <>
      <button 
        className={`menu-toggle ${abierto ? 'abierto' : ''}`}
        onClick={toggleMenu}
      >
        {abierto ? '✕' : '☰'}
      </button>

      {abierto && <div className="menu-overlay" onClick={toggleMenu} />}

      <div className={`menu-lateral ${abierto ? 'abierto' : ''}`}>
        <div className="menu-header">
          <h2>Planificador de Carrera</h2>
          <p>Ingeniería Informática - UNLaM</p>
        </div>

        <div className="menu-contenido-directo">
          <div className="menu-opciones">
            <button className="opcion-menu recomendador" onClick={handleRecomendador}>
              <span className="opcion-icono">📊</span>
              <div className="opcion-texto">
                <span className="opcion-titulo">Recomendación de materias</span>
                <span className="opcion-descripcion">Análisis de distancia al título</span>
              </div>
            </button>

            <button className="opcion-menu exportar" onClick={handleExportar}>
              <span className="opcion-icono">💾</span>
              <div className="opcion-texto">
                <span className="opcion-titulo">Exportar progreso</span>
                <span className="opcion-descripcion">Guardar estado actual</span>
              </div>
            </button>

            <button className="opcion-menu importar" onClick={handleImportar}>
              <span className="opcion-icono">📂</span>
              <div className="opcion-texto">
                <span className="opcion-titulo">Importar progreso</span>
                <span className="opcion-descripcion">Cargar estado guardado</span>
              </div>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </>
  );
};

export default MenuLateral;