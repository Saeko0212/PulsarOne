// components/FormularioMedicion.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const FormularioMedicion = ({ visible, onClose }) => {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState('');
  const [masaMuscular, setMasaMuscular] = useState('');
  const [notas, setNotas] = useState('');

  const handleAgregarMedicion = async () => {
    if (!peso) {
      Alert.alert('Campo requerido', 'El peso es obligatorio.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No se ha encontrado usuario.');
        return;
      }

      // Referencia a la subcolección 'mediciones'
      const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');

      // Añade el nuevo documento
      await addDoc(medicionesRef, {
        fecha: Timestamp.fromDate(fecha),
        peso: parseFloat(peso),
        grasa: grasa ? parseFloat(grasa) : null,
        masaMuscular: masaMuscular ? parseFloat(masaMuscular) : null,
        notas: notas,
        creadoEn: Timestamp.now(),
      });

      Alert.alert('¡Éxito!', 'Medición agregada correctamente.');
      onClose(); // Cierra el modal
      // Resetea el formulario
      setPeso('');
      setGrasa('');
      setMasaMuscular('');
      setNotas('');
      setFecha(new Date());
    } catch (error) {
      console.error('Error al agregar medición: ', error);
      Alert.alert('Error', 'No se pudo guardar la medición.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
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
          <Text style={styles.title}>Nueva Medición</Text>

          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
            <Text>{fecha.toLocaleDateString('es-ES')}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={fecha}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="75"
            value={peso}
            onChangeText={setPeso}
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>% Grasa (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="18"
                value={grasa}
                onChangeText={setGrasa}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Masa Muscular (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="35"
                value={masaMuscular}
                onChangeText={setMasaMuscular}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputNotas]}
            placeholder="Añade notas sobre esta medición..."
            value={notas}
            onChangeText={setNotas}
            multiline
          />

          <TouchableOpacity style={styles.buttonGreen} onPress={handleAgregarMedicion}>
            <Text style={styles.buttonTextWhite}>Agregar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonWhite} onPress={onClose}>
            <Text style={styles.buttonTextBlack}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Estilos (similares a EditarPerfilModal)
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
    padding: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  dateInput: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputNotas: {
    height: 80,
    textAlignVertical: 'top',
    borderColor: '#28a745',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, marginHorizontal: -5 }, // Ajuste para que los inputs se alineen
  buttonGreen: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextWhite: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonWhite: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  buttonTextBlack: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormularioMedicion;