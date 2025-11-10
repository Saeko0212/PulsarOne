import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { db } from '../database/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';


const FormularioEditarEvento = ({ visible, onClose, evento }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Entrenamiento');
  const [duracion, setDuracion] = useState('60');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (evento) {
      const eventDate = evento.fechaHora.toDate();

      setTitulo(evento.titulo);
      setDescripcion(evento.descripcion || '');
      setTipo(evento.tipo);
      setDuracion(String(evento.duracion || 0)); 
      setFecha(eventDate);
      setHora(eventDate);
    }
  }, [evento]); 

  const onChangeFecha = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setShowDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
  };

  const onChangeHora = (event, selectedTime) => {
    const currentTime = selectedTime || hora;
    setShowTimePicker(Platform.OS === 'ios');
    setHora(currentTime);
  };

  const handleActualizarEvento = async () => {
    if (!evento || !evento.id) {
      Alert.alert('Error', 'No hay un evento seleccionado para actualizar.');
      return;
    }
    if (!titulo) {
      Alert.alert('Error', 'El título es obligatorio.');
      return;
    }

    const fechaHoraEvento = new Date(fecha);
    fechaHoraEvento.setHours(hora.getHours());
    fechaHoraEvento.setMinutes(hora.getMinutes());

    try {
      const eventoRef = doc(db, 'eventos', evento.id);

      await updateDoc(eventoRef, {
        titulo: titulo,
        descripcion: descripcion,
        tipo: tipo,
        duracion: parseInt(duracion, 10) || 0,
        fechaHora: fechaHoraEvento,
      });

      Alert.alert('Éxito', 'Evento actualizado correctamente.');
      onClose(); 
    } catch (error) {
      console.error('Error al actualizar el evento: ', error);
      Alert.alert('Error', 'No se pudo actualizar el evento.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {}
          <Text style={styles.modalTitle}>Editar Evento</Text>

          {}
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Push Day"
            value={titulo}
            onChangeText={setTitulo}
          />

          {}
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalles del entrenamiento..."
            multiline
            numberOfLines={3}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {}
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Entrenamiento" value="Entrenamiento" />
              <Picker.Item label="Cardio" value="Cardio" />
              <Picker.Item label="Yoga" value="Yoga" />
              <Picker.Item label="Natación" value="Natación" />
              <Picker.Item label="Deporte" value="Deporte" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>
          </View>

          <View style={styles.row}>
            {}
            <View style={styles.column}>
              <Text style={styles.label}>Fecha</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{fecha.toLocaleDateString('es-ES')}</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.column}>
              <Text style={styles.label}>Hora</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{hora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {}
          <Text style={styles.label}>Duración (min)</Text>
          <TextInput
            style={styles.input}
            placeholder="60"
            keyboardType="numeric"
            value={duracion}
            onChangeText={setDuracion}
          />

          {/* --- Pickers Ocultos --- */}
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={fecha}
              mode="date"
              display="default"
              onChange={onChangeFecha}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={hora}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeHora}
            />
          )}

          {}
          <TouchableOpacity
            style={[styles.button, styles.buttonCreate]}
            onPress={handleActualizarEvento}
          >
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    justifyContent: 'center',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  picker: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonCreate: {
    backgroundColor: '#28a745',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextCancel: {
    color: '#555',
  },
});

export default FormularioEditarEvento;