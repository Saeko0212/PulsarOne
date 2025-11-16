import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmacionModal = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  isDestructive = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons 
            name={isDestructive ? "warning-outline" : "help-circle-outline"} 
            size={48} 
            color={isDestructive ? '#E74C3C' : '#2196F3'} 
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirm, isDestructive ? styles.btnDestructive : styles.btnDefault]}
              onPress={onConfirm}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  btnCancelText: { color: '#555', fontWeight: 'bold', fontSize: 16 },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnDefault: {
    backgroundColor: '#28A745',
  },
  btnDestructive: {
    backgroundColor: '#E74C3C',
  },
});

export default ConfirmacionModal;