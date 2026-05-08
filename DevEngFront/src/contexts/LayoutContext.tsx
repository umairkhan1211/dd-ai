import { createContext, useContext, useState } from "react";

interface LayoutContextType {
  showBackground: boolean;
  setShowBackground: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [showBackground, setShowBackground] = useState(true);

  return (
    <LayoutContext.Provider value={{ showBackground, setShowBackground }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
};
