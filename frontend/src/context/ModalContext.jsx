import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(null);

  const openModalHandler = (modalType) => setOpenModal(modalType);
  const closeModalHandler = () => setOpenModal(null);

  return (
    <ModalContext.Provider
      value={{ openModal, openModalHandler, closeModalHandler }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

