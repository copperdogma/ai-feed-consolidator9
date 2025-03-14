import React from 'react';

export interface TRPCProviderProps {
  children: React.ReactNode;
}

// Mock implementation of TRPCProvider for tests
export const TRPCProvider: React.FC<TRPCProviderProps> = ({ children }) => {
  return <>{children}</>;
}; 