import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
import './toast.css'; 

export const Toaster: React.FC = () => {
  return (
    <Toast.Provider>
      {/* Tu contenido */}
      <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </Toast.Provider>
  );
};