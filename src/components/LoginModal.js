import React from 'react';
import { Modal, View, StyleSheet, SafeAreaView } from 'react-native';
// Importa la lógica de Login
import LoginScreen from './LoginScreen'; // Ajusta la ruta

const LoginModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalView}>
          {/* Modifica LoginScreen.js para que acepte 'onSuccessfulLogin' */}
          <LoginScreen onSuccessfulLogin={onClose} onCancel={onClose} />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// Reutiliza los estilos del modal de RegistroModal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default LoginModal;