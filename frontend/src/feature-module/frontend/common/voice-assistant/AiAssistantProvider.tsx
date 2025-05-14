import React, { useState, useEffect, ReactNode } from 'react';
import AiAssistantEngine from './core/AiAssistantEngine';
import AiAssistantContext, {
  AiAssistantContextType,
} from './AiAssistantContext';

interface AiAssistantProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export const AiAssistantProvider: React.FC<AiAssistantProviderProps> = ({
  children,
  debug = false,
}) => {
  const [aiAssistant, setAiAssistant] = useState<AiAssistantEngine | undefined>();

  useEffect(() => {
    // Initialize engine with debug mode
    const engine = new AiAssistantEngine(debug);
    setAiAssistant(engine);
    // Cleanup on unmount
    return () => {
      // If engine had cleanup logic, call it here
      // e.g., engine.stopProcessing();
    };
  }, [debug]);

  const contextValue: AiAssistantContextType = {
    aiAssistant,
    on: aiAssistant?.on.bind(aiAssistant),
    off: aiAssistant?.off.bind(aiAssistant),
  };

  return (
    <AiAssistantContext.Provider value={contextValue}>
      {children}
    </AiAssistantContext.Provider>
  );
};

export default AiAssistantProvider;
