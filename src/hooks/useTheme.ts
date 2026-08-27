import { useState, useEffect, useCallback } from 'react';

export type Tema = 'light' | 'dark';

const CLAVE_STORAGE_TEMA = 'selector-materias-tema';

const detectarTemaInicial = (): Tema => {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE_TEMA);
    if (guardado === 'light' || guardado === 'dark') {
      return guardado;
    }
  } catch {
    // storage no disponible, se ignora
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => detectarTemaInicial());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    try {
      localStorage.setItem(CLAVE_STORAGE_TEMA, tema);
    } catch {
      // storage no disponible, se ignora
    }
  }, [tema]);

  useEffect(() => {
    let yaEligioManual = false;
    try {
      yaEligioManual = localStorage.getItem(CLAVE_STORAGE_TEMA) !== null;
    } catch {
      yaEligioManual = false;
    }
    if (yaEligioManual) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setTema(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggleTema = useCallback(() => {
    setTema(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { tema, toggleTema };
}
