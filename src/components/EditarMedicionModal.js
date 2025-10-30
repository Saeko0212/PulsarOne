// components/EditarMedicionModal.js
import React, { useState, useEffect } from 'react';
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
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons'; // Para los iconos de flecha
// ¡Ya no necesitamos 'FontAwesome' aquí!
const EditarMedicionModal = ({ visible, onClose, medicionToEdit }) => {
  // Estado para los campos del formulario, inicializados con la medición actual
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState('');
  const [masaMuscular, setMasaMuscular] = useState('');
  const [notas, setNotas] = useState('');

  // Sincroniza el estado del formulario cuando medicionToEdit cambie
  useEffect(() => {
    if (medicionToEdit) {
      setFecha(medicionToEdit.fecha?.toDate() || new Date());
      setPeso(medicionToEdit.peso?.toString() || '');
      setGrasa(medicionToEdit.grasa?.toString() || '');
      setMasaMuscular(medicionToEdit.masaMuscular?.toString() || '');
      setNotas(medicionToEdit.notas || '');
    }
  }, [medicionToEdit]); // Ejecuta este efecto cuando medicionToEdit cambie

  const handleActualizarMedicion = async () => {
    if (!medicionToEdit?.id) {
      Alert.alert('Error', 'No se ha seleccionado una medición para editar.');
      return;
    }
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

      // Referencia al documento específico de la medición a actualizar
      const medicionDocRef = doc(
        db,
        'PerfilDatos',
        user.uid,
        'mediciones',
        medicionToEdit.id
      );

      // Prepara los datos a actualizar
      const dataToUpdate = {
        fecha: Timestamp.fromDate(fecha),
        peso: parseFloat(peso),
        grasa: grasa ? parseFloat(grasa) : null,
        masaMuscular: masaMuscular ? parseFloat(masaMuscular) : null,
        notas: notas,
        ultimaActualizacion: Timestamp.now(), // Opcional: añade un campo de actualización
      };

      await updateDoc(medicionDocRef, dataToUpdate);

      Alert.alert('¡Éxito!', 'Medición actualizada correctamente.');
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al actualizar medición: ', error);
      Alert.alert('Error', 'No se pudo actualizar la medición.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
  };

  // --- ¡Las funciones 'incrementValue' y 'decrementValue' se han eliminado! ---

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={styles.title}>Editar Medición</Text>

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
              {/* Vuelve a ser un TextInput normal */}
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
              {/* Vuelve a ser un TextInput normal */}
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

          <TouchableOpacity style={styles.buttonGreen} onPress={handleActualizarMedicion}>
            <Text style={styles.buttonTextWhite}>Actualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonWhite} onPress={onClose}>
            <Text style={styles.buttonTextBlack}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Estilos
const styles = StyleSheet.create({ // --- ESTILOS (simplificados) ---
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
    // Puedes poner un borde verde si quieres, como en el FormularioMedicion
    // borderColor: '#28a745',
    // borderWidth: 2,
    // backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, paddingHorizontal: 5 }, // ¡Ajuste aquí! El 'marginHorizontal' negativo ya no es necesario
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
  // --- ¡Estilos de 'stepper' eliminados! ---
});

export default EditarMedicionModal;