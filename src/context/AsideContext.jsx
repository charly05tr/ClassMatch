import { createContext, useState, useContext } from 'react';

const AsideContext = createContext();

export const useAside = () => useContext(AsideContext);

export const AsideProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  function toggleAside() {
    setIsOpen(prev => !prev);
  }

  return (
    <AsideContext.Provider value={{ isOpen, toggleAside }}>
      {children}
    </AsideContext.Provider>
  );
};
