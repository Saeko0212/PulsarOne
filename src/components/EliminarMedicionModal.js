// components/EliminarMedicionModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
// Ya no necesitamos FontAwesome para este modal

const EliminarMedicionModal = ({ visible, onClose, onConfirmDelete }) => {
  return (
    <Modal
      animationType="fade" // 'fade' es más sutil para una confirmación
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          {/* Título */}
          <Text style={styles.title}>¿Eliminar medición?</Text>
          
          {/* Subtítulo */}
          <Text style={styles.subtitle}>
            Esta acción no se puede deshacer.
          </Text>

          {/* Botón de Eliminar (rojo) */}
          <TouchableOpacity
            style={[styles.button, styles.buttonRed]}
            onPress={onConfirmDelete}
          >
            <Text style={styles.buttonTextWhite}>Eliminar</Text>
          </TouchableOpacity>

          {/* Botón de Cancelar (blanco con borde) */}
          <TouchableOpacity
            style={[styles.button, styles.buttonWhite]}
            onPress={onClose}
          >
            <Text style={styles.buttonTextBlack}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 8, // Bordes un poco más suaves
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Menos sombra
    shadowRadius: 3,
    elevation: 3,
    width: '80%', // Ajusta el ancho para que sea más como tu imagen
    maxWidth: 300, // Máximo de ancho para pantallas grandes
  },
  // ¡Icono eliminado de los estilos!
  title: {
    fontSize: 18, // Un poco más pequeño
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333', // Color de texto más oscuro
  },
  subtitle: {
    fontSize: 14, // Un poco más pequeño
    color: '#666', // Color de texto más suave
    textAlign: 'center',
    marginBottom: 20, // Más espacio debajo del subtítulo
  },
  button: {
    width: '100%',
    padding: 12, // Un poco menos de padding
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10, // Espacio entre botones
  },
  buttonRed: {
    backgroundColor: '#dc3545', // Rojo
  },
  buttonTextWhite: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonWhite: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcdcdc', // Borde gris claro
  },
  buttonTextBlack: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EliminarMedicionModal;