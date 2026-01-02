export interface MateriaJSON {
  codigo: string;
  nombre: string;
  correlativas: string[];
  horasSemanales: number;
  periodo: string; // 1C1A, 2C1A, 1C2A, etc.
}

export interface Materia extends MateriaJSON {
  esElectiva: boolean;
  esTransversal: boolean;
}

export type EstadoMateria = 'cursada' | 'en_curso' | 'disponible' | 'bloqueada';

export interface MateriaConEstado extends Materia {
  estado: EstadoMateria;
}

export interface PeriodoInfo {
  cuatrimestre: number;
  anio: number;
  label: string;
}