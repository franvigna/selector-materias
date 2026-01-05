import React, { useRef } from 'react';
import '../styles/BotonExportarImportar.css';

interface BotonExportarImportarProps {
  materiasCursadas: string[];
  materiasEnCurso: string[];
  onImportar: (cursadas: string[], enCurso: string[]) => void;
}

interface ExportData {
  version: string;
  fecha: string;
  materiasCursadas: string[];
  materiasEnCurso: string[];
}

const BotonExportarImportar: React.FC<BotonExportarImportarProps> = ({
  materiasCursadas,
  materiasEnCurso,
  onImportar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        // Validar estructura
        if (!data.materiasCursadas || !data.materiasEnCurso) {
          alert('❌ Archivo inválido: formato incorrecto');
          return;
        }

        // Confirmar importación
        const confirmar = window.confirm(
          `¿Importar progreso del ${new Date(data.fecha).toLocaleDateString()}?\n\n` +
          `📚 ${data.materiasCursadas.length} materias aprobadas\n` +
          `📖 ${data.materiasEnCurso.length} materias en curso\n\n` +
          `⚠️ Esto sobrescribirá tu progreso actual.`
        );

        if (confirmar) {
          onImportar(data.materiasCursadas, data.materiasEnCurso);
          alert('✅ Progreso importado exitosamente');
        }
      } catch (error) {
        alert('❌ Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
        console.error('Error al importar:', error);
      }
    };

    reader.readAsText(file);
    
    // Resetear input para permitir reimportar el mismo archivo
    event.target.value = '';
  };

  return (
    <div className="contenedor-botones-export">
      <button 
        className="boton-export" 
        onClick={handleExportar}
        title="Exportar progreso"
      >
        <span className="boton-icono">💾</span>
        <span className="boton-texto">Exportar</span>
      </button>

      <button 
        className="boton-import" 
        onClick={handleImportar}
        title="Importar progreso"
      >
        <span className="boton-icono">📂</span>
        <span className="boton-texto">Importar</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BotonExportarImportar;