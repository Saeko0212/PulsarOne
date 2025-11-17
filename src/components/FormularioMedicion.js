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
  Platform, Button
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import CalculadoraGrasaModal from './CalculadoraGrasaModal'; 

const FormularioMedicion = ({ visible, onClose, userData }) => {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState(''); 
  const [masaMuscular, setMasaMuscular] = useState('');
  const [notas, setNotas] = useState('');
  
  const [calculadoraVisible, setCalculadoraVisible] = useState(false);

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

      const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');

      await addDoc(medicionesRef, {
        fecha: Timestamp.fromDate(fecha),
        peso: parseFloat(peso),
        grasa: grasa ? parseFloat(grasa) : null,
        masaMuscular: masaMuscular ? parseFloat(masaMuscular) : null,
        notas: notas,
        creadoEn: Timestamp.now(),
      });

      Alert.alert('¡Éxito!', 'Medición agregada correctamente.');
      onClose();
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

  const handleGrasaCalculada = (resultadoGrasa) => {
    if (!peso || isNaN(peso) || Number(peso) <= 0) {
      Alert.alert(
        "Falta el Peso",
        "Ingresa tu peso actual para poder calcular la masa muscular.",
        [{ text: "OK" }]
      );
      setGrasa(resultadoGrasa.toFixed(1));
      return;
    }

    const pesoActualNum = Number(peso);
    const grasaPorcentajeNum = Number(resultadoGrasa);

    const masaGrasaKg = pesoActualNum * (grasaPorcentajeNum / 100);

    const masaMuscularKg = pesoActualNum - masaGrasaKg;

    setGrasa(grasaPorcentajeNum.toFixed(1));
    setMasaMuscular(masaMuscularKg.toFixed(1)); 
  };

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
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
                <TextInput style={styles.input} placeholder="18" value={grasa} onChangeText={setGrasa} keyboardType="numeric" />
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

            <TouchableOpacity 
              style={styles.buttonCalc}
              onPress={() => {
                if (!userData || !userData.genero || !userData.altura) {
                  Alert.alert("Faltan datos", "Por favor, completa tu 'Género' y 'Altura' en tu Perfil primero.");
                } else {
                  setCalculadoraVisible(true);
                }
              }}
            >
              <Text style={styles.buttonCalcText}>Calcular % Grasa (US Navy)</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputNotas]}
              placeholder="Añade notas..."
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

      {}
      <CalculadoraGrasaModal
        visible={calculadoraVisible}
        onClose={() => setCalculadoraVisible(false)}
        userData={userData}
        onCalculated={handleGrasaCalculada}
      />
    </>
  );
};

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
  column: { flex: 1, paddingHorizontal: 5 },
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
  buttonCalc: {
    backgroundColor: '#007bff', 
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15, 
  },
  buttonCalcText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FormularioMedicion;