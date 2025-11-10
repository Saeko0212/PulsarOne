import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { 
  collection, addDoc, Timestamp, query, orderBy, limit, getDocs 
} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';

const FormularioObjetivos = ({ visible, onClose }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Peso');
  
  const [tipoMeta, setTipoMeta] = useState('perder'); 

  const [objetivoValor, setObjetivoValor] = useState('0');
  const [unidad, setUnidad] = useState('kg');
  const [fechaLimite, setFechaLimite] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCategoriaChange = (itemValue) => {
    setCategoria(itemValue);
    if (itemValue === 'Peso') setUnidad('kg');
    else if (itemValue === 'Fuerza') setUnidad('kg');
    else if (itemValue === 'Resistencia') setUnidad('min');
    else if (itemValue === 'Frecuencia') setUnidad('días/sem');
    else if (itemValue === 'Flexibilidad') setUnidad('cm');
    else setUnidad('');
  };

  const handleCrearObjetivo = async () => {
    if (!titulo || !objetivoValor || parseFloat(objetivoValor) <= 0) {
      Alert.alert('Campos requeridos', 'El título y un objetivo mayor a 0 son obligatorios.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes estar logueado.');
      return;
    }

    let pesoInicial = null;

    if (categoria === 'Peso') {
      try {
        const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');
        const q = query(medicionesRef, orderBy('fecha', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert('Error', 'No se encontró un registro de peso. Por favor, añade una medición de peso antes de crear un objetivo.');
          return;
        }
        
        pesoInicial = querySnapshot.docs[0].data().peso;

      } catch (error) {
        console.error("Error buscando peso inicial: ", error);
        Alert.alert('Error', 'No se pudo obtener tu peso actual.');
        return;
      }
    }
    try {
      const objRef = collection(db, "Objetivos");

      await addDoc(objRef, {
        titulo: titulo,
        descripcion: descripcion,
        categoria: categoria,
        tipoMeta: categoria === 'Peso' ? tipoMeta : null,
        objetivoValor: parseFloat(objetivoValor), 
        unidad: unidad,
        pesoInicial: categoria === 'Peso' ? pesoInicial : null, 
        progresoActual: 0, 
        fechaLimite: Timestamp.fromDate(fechaLimite),
        userId: user.uid, 
        creadoEn: Timestamp.now()
      });

      Alert.alert('¡Éxito!', 'Nuevo objetivo creado.');
      onClose();
      setTitulo(''); setDescripcion(''); setCategoria('Peso'); setObjetivoValor('0');
      setUnidad('kg'); setTipoMeta('perder'); setFechaLimite(new Date());

    } catch (error) {
      console.error("Error al crear objetivo: ", error);
      Alert.alert('Error', 'No se pudo guardar el objetivo.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || fechaLimite;
    setShowDatePicker(Platform.OS === 'ios');
    setFechaLimite(currentDate);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={styles.title}>Nuevo Objetivo</Text>

          <Text style={styles.label}>Título</Text>
          <TextInput
            style={[styles.input, styles.inputFocused]}
            placeholder="Ej: Perder 5 kg"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Detalles sobre tu objetivo..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={handleCategoriaChange}
              style={styles.picker}
            >
              <Picker.Item label="Peso" value="Peso" />
              <Picker.Item label="Fuerza" value="Fuerza" />
              <Picker.Item label="Resistencia" value="Resistencia" />
              <Picker.Item label="Frecuencia" value="Frecuencia" />
              <Picker.Item label="Flexibilidad" value="Flexibilidad" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>
          </View>

          {}
          {categoria === 'Peso' && (
            <>
              <Text style={styles.label}>Tipo de Meta</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={tipoMeta} onValueChange={(itemValue) => setTipoMeta(itemValue)} style={styles.picker}>
                  <Picker.Item label="Perder Peso" value="perder" />
                  <Picker.Item label="Ganar Peso" value="ganar" />
                </Picker>
              </View>
            </>
          )}

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Objetivo</Text>
              <TextInput style={styles.input} value={objetivoValor} onChangeText={setObjetivoValor} keyboardType="numeric" />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Unidad</Text>
              <TextInput style={styles.input} value={unidad} onChangeText={setUnidad} />
            </View>
          </View>

          <Text style={styles.label}>Fecha Límite</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
            <Text>{fechaLimite.toLocaleDateString('es-ES')}</Text>
            <FontAwesome name="calendar-o" size={18} color="#555" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={fechaLimite} mode="date" display="default" onChange={onChangeDate} />
          )}

          <TouchableOpacity style={styles.buttonGreen} onPress={handleCrearObjetivo}>
            <Text style={styles.buttonTextWhite}>Crear</Text>
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
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 12, padding: 25 },
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
    borderColor: '#28a745',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, paddingHorizontal: 5 },
  dateInput: {
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  buttonWhite: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc' },
  buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default FormularioObjetivos;