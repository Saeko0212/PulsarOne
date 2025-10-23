import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { doc, updateDoc } from "firebase/firestore";

const EditarPerfilModal = ({ visible, onClose, currentUserData }) => {
  // Pre-llena el formulario con los datos actuales
  const [nombre, setNombre] = useState(currentUserData.nombre);
  const [edad, setEdad] = useState(currentUserData.edad?.toString() || '');
  const [altura, setAltura] = useState(currentUserData.altura?.toString() || '');

  // Sincroniza el estado si los props cambian (cuando el modal se reabre)
  useEffect(() => {
    if (currentUserData) {
      setNombre(currentUserData.nombre);
      setEdad(currentUserData.edad?.toString() || '');
      setAltura(currentUserData.altura?.toString() || '');
    }
  }, [currentUserData, visible]);

  const handleUpdate = async () => {
    if (!nombre || !edad || !altura) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    try {
      const user = auth.currentUser;
      const docRef = doc(db, "PerfilDatos", user.uid);

      // Actualiza el documento en Firestore
      await updateDoc(docRef, {
        nombre: nombre,
        edad: parseInt(edad, 10),
        altura: parseInt(altura, 10),
      });

      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
      onClose(); // Cierra el modal

    } catch (error) {
      console.error("Error al actualizar: ", error);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={styles.title}>Editar Perfil</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, styles.inputFocused]} // Estilo enfocado
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]} // Estilo deshabilitado
            value={currentUserData.email}
            editable={false} // No se puede editar el email
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={styles.input}
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                value={altura}
                onChangeText={setAltura}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.buttonGreen} onPress={handleUpdate}>
            <Text style={styles.buttonTextWhite}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonWhite} onPress={onClose}>
            <Text style={styles.buttonTextBlack}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Reutiliza y ajusta los estilos
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  inputFocused: {
    borderColor: '#28a745', // Borde verde como en tu imagen
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, marginHorizontal: 5 },
  buttonGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  buttonWhite: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc' },
  buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default EditarPerfilModal;