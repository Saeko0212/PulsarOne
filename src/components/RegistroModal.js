import React from 'react';
import { Modal, View, StyleSheet, SafeAreaView } from 'react-native';
// Importa el formulario que ya teníamos
import LoginFormulario from './LoginFormulario'; // Ajusta la ruta

const RegistroModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true} // Fondo transparente
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalView}>
          {/* Pasamos 'onClose' a LoginFormulario para que pueda
            cerrar el modal al registrarse exitosamente.
            (Debes modificar LoginFormulario.js para aceptar esta prop)
          */}
          <LoginFormulario onSuccessfulRegister={onClose} />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// Estilos para el Modal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0, // El padding lo manejará el ScrollView del formulario
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden' // Para que el borderRadius afecte al contenido
  },
});

export default RegistroModal;