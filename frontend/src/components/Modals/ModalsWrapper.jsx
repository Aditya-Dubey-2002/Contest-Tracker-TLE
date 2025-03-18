import LoginModal from "../Modals/LoginModal";
import SignupModal from "../Modals/SignupModal";
import AdminLoginModal from "../Modals/AdminLoginModal";
import ReminderPopup from "../Modals/ReminderPopup";
import { useModal } from "../../context/ModalContext";

const ModalsWrapper = () => {
  const { openModal, closeModalHandler, reminderPopup, closeReminderPopup,openModalHandler } = useModal();

  return (
    <>
      <LoginModal open={openModal === "login"} onClose={closeModalHandler} switchToSignup={() => openModalHandler("signup")} switchToAdmin={() => openModalHandler("admin")} />
      <SignupModal open={openModal === "signup"} onClose={closeModalHandler} switchToLogin={() => openModalHandler("login")} />
      <AdminLoginModal open={openModal === "admin"} onClose={closeModalHandler} switchToLogin={() => openModalHandler("login")} />
      <ReminderPopup open={reminderPopup} onClose={closeModalHandler} switchToLogin={() => openModalHandler("login")} switchToSignup={() => openModalHandler("signup")} switchToAdmin={() => openModalHandler("admin")} />
    </>
  );
};

export default ModalsWrapper;
