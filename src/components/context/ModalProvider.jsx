import React, { createContext, useState } from 'react';

// Create the context
export const ModalContext = createContext();

const ModalProvider = ({ children }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);


  return (
    <ModalContext.Provider value={[modalIsOpen, setModalIsOpen] }>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
