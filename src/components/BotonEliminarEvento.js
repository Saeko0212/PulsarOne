import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const BotonEliminarEvento = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} 
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>¿Eliminar evento?</Text>
          <Text style={styles.alertSubtitle}>Esta acción no se puede deshacer.</Text>

          {}
          <TouchableOpacity
            style={[styles.button, styles.buttonDelete]}
            onPress={onConfirm}
          >
            <Text style={styles.buttonTextDelete}>Eliminar</Text>
          </TouchableOpacity>
          
          {}
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={onClose}
          >
            <Text style={styles.buttonTextCancel}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  alertContainer: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  alertSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25, 
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDelete: {
    backgroundColor: '#E53935', 
  },
  buttonTextDelete: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonCancel: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonTextCancel: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BotonEliminarEvento;