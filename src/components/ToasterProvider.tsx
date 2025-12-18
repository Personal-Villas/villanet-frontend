import React from 'react';
import { Toaster } from './Toaster';

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};