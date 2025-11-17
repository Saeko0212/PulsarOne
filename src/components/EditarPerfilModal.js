import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { doc, updateDoc } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';

const EditarPerfilModal = ({ visible, onClose, currentUserData }) => {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [altura, setAltura] = useState('');
  const [genero, setGenero] = useState('Hombre');

  useEffect(() => {
    if (currentUserData) {
      setNombre(currentUserData.nombre || '');
      setEdad(currentUserData.edad?.toString() || '');
      setAltura(currentUserData.altura?.toString() || '');
      setGenero(currentUserData.genero || 'Hombre');
    }
  }, [currentUserData, visible]);

  const handleUpdate = async () => {
    if (!nombre || !edad || !altura) {
      Alert.alert('Campos incompletos', 'Rellena todos los campos.');
      return;
    }
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "PerfilDatos", user.uid);

      await updateDoc(docRef, {
        nombre: nombre,
        edad: parseInt(edad, 10),
        altura: parseInt(altura, 10),
        genero: genero
      });
      Alert.alert('¡Éxito!', 'Perfil actualizado.');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar.');
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={styles.title}>Editar Perfil</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={[styles.input, styles.inputFocused]} value={nombre} onChangeText={setNombre} />

          <Text style={styles.label}>Email (No editable)</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={currentUserData.email} editable={false} />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Edad</Text>
              <TextInput style={styles.input} value={edad} onChangeText={setEdad} keyboardType="numeric" />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput style={styles.input} value={altura} onChangeText={setAltura} keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.label}>Género</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={genero}
              onValueChange={(itemValue) => setGenero(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Hombre" value="Hombre" />
              <Picker.Item label="Mujer" value="Mujer" />
            </Picker>
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

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
    input: { backgroundColor: '#f4f4f5', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
    inputFocused: { borderWidth: 1, borderColor: '#28a745' },
    inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    column: { width: '48%' },
    pickerContainer: {
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        marginBottom: 15,
        height: 50,
        justifyContent: 'center'
    },
    picker: {
        height: 50,
    },
    buttonGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    buttonWhite: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc' },
    buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default EditarPerfilModal;