import React, { useState } from 'react';
import { 
  View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';
import SelectorEjercicios from './SelectorEjercicios'; 

const FormularioRutinas = ({ isVisible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('30-45 min');
  const [dificultad, setDificultad] = useState('Intermedio');
  
  const [ejerciciosRutina, setEjerciciosRutina] = useState([]);
  
  const [selectorVisible, setSelectorVisible] = useState(false);

  const dificultades = ['Principiante', 'Intermedio', 'Avanzado'];
  const duraciones = ['15-30 min', '30-45 min', '45-60 min', '60+ min'];

  const handleEjercicioSeleccionado = (ejercicio) => {
    setEjerciciosRutina([
      ...ejerciciosRutina,
      {
        idOriginal: ejercicio.id, 
        nombre: ejercicio.nombre,
        seriesReps: '' 
      }
    ]);
  };

  const handleUpdateSeriesReps = (texto, index) => {
    const nuevaLista = [...ejerciciosRutina];
    nuevaLista[index].seriesReps = texto;
    setEjerciciosRutina(nuevaLista);
  };

  const handleRemoveEjercicio = (index) => {
    const nuevaLista = [...ejerciciosRutina];
    nuevaLista.splice(index, 1);
    setEjerciciosRutina(nuevaLista);
  };

  const guardarRutina = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Sesión no iniciada.");
      return;
    }
    if (!nombre || ejerciciosRutina.length === 0) {
      Alert.alert('Faltan datos', 'Ponle nombre a la rutina y agrega al menos un ejercicio.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "rutinas"), {
        nombre,
        descripcion,
        duracion,
        dificultad,
        ejercicios: ejerciciosRutina,
        creadoEn: new Date(),
        userId: user.uid
      });

      Alert.alert('¡Listo!', 'Rutina creada correctamente');
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error guardando rutina: ", error);
      Alert.alert('Error', 'No se pudo guardar la rutina.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setDuracion('30-45 min');
    setDificultad('Intermedio');
    setEjerciciosRutina([]);
  };

  const renderEjercicioItem = ({ item, index }) => (
    <View style={styles.ejercicioRow}>
      <View style={{flex: 1}}>
        <Text style={styles.ejName}>{item.nombre}</Text>
      </View>
      <TextInput
        style={styles.inputSeries}
        placeholder="4x10"
        value={item.seriesReps}
        onChangeText={(text) => handleUpdateSeriesReps(text, index)}
      />
      <TouchableOpacity onPress={() => handleRemoveEjercicio(index)} style={{padding: 5}}>
        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <View style={styles.header}>
                <Text style={styles.title}>Nueva Rutina</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} placeholder="Ej: Push Day" value={nombre} onChangeText={setNombre} />

              <Text style={styles.label}>Descripción</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción..." multiline value={descripcion} onChangeText={setDescripcion} />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Duración</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={duracion} onValueChange={setDuracion} style={styles.picker}>
                      {duraciones.map(d => <Picker.Item key={d} label={d} value={d} style={{fontSize: 14}} />)}
                    </Picker>
                  </View>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Dificultad</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={dificultad} onValueChange={setDificultad} style={styles.picker}>
                      {dificultades.map(d => <Picker.Item key={d} label={d} value={d} style={{fontSize: 14}} />)}
                    </Picker>
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Ejercicios ({ejerciciosRutina.length})</Text>
              <View style={styles.listaEjercicios}>
                {ejerciciosRutina.map((item, index) => (
                  <View key={index} style={styles.ejercicioWrapper}>
                    {renderEjercicioItem({ item, index })}
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.btnAdd} onPress={() => setSelectorVisible(true)}>
                <Ionicons name="add" size={20} color="#28A745" />
                <Text style={styles.btnAddText}>Agregar Ejercicio</Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnCrear} onPress={guardarRutina} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtWhite}>Crear Rutina</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                  <Text style={styles.txtBlack}>Cancelar</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {}
      <SelectorEjercicios 
        isVisible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onSelect={handleEjercicioSeleccionado}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 10, color: '#333' },
  input: { backgroundColor: '#F5F6F8', borderRadius: 8, padding: 10, fontSize: 14 },
  textArea: { height: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  pickerBox: { backgroundColor: '#F5F6F8', borderRadius: 8, height: 50, justifyContent: 'center' },
  picker: { height: 50, width: '100%' },
  
  listaEjercicios: { marginTop: 5 },
  ejercicioWrapper: { marginBottom: 8 },
  ejercicioRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  ejName: { fontSize: 14, fontWeight: '500', color: '#333' },
  inputSeries: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 6, width: 70, textAlign: 'center', paddingVertical: 2, marginHorizontal: 10, fontSize: 12 },
  
  btnAdd: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#28A745', borderStyle: 'dashed', borderRadius: 8, marginTop: 10 },
  btnAddText: { color: '#28A745', fontWeight: '600', marginLeft: 5 },
  
  actions: { marginTop: 25 },
  btnCrear: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnCancel: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 8, alignItems: 'center' },
  txtWhite: { color: '#FFF', fontWeight: 'bold' },
  txtBlack: { color: '#333', fontWeight: 'bold' }
});

export default FormularioRutinas;