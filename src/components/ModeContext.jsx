import { createContext, useContext, useEffect, useState } from 'react';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('havenslight_mode') || 'user');
  const [onDuty, setOnDuty] = useState(false);

  useEffect(() => {
    localStorage.setItem('havenslight_mode', mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === 'user' ? 'volunteer' : 'user'));

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode, onDuty, setOnDuty }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}