import React, { useState } from 'react';
import { 
  View, Text, TextInput, Modal, TouchableOpacity, 
  StyleSheet, Alert, Platform, ScrollView, ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons'; 

import { db, auth } from '../database/firebaseconfig.js'; 
import { collection, addDoc } from 'firebase/firestore';

const FormularioNutricion = ({ visible, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Desayuno');
  const [hora, setHora] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [calorias, setCalorias] = useState('');
  const [proteina, setProteina] = useState('');
  const [carbos, setCarbos] = useState('');
  const [grasas, setGrasas] = useState('');

  const categorias = [
    "Desayuno", "Media Mañana", "Almuerzo", 
    "Merienda", "Cena", "Post-Entrenamiento"
  ];

  const onChangeTime = (event, selectedDate) => {
    const currentDate = selectedDate || hora;
    setShowTimePicker(false);
    setHora(currentDate);
  };

  const registrarComida = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para la comida");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "Nutricion"), {
        userId: auth.currentUser.uid, 
        nombre: nombre,
        tipo: tipo,
        hora: hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        timestamp: hora, 
        calorias: Number(calorias) || 0,
        proteina: Number(proteina) || 0,
        carbos: Number(carbos) || 0,
        grasas: Number(grasas) || 0,
        fechaRegistro: new Date()
      });

      Alert.alert("Éxito", "Comida registrada correctamente");
      resetForm();
      onClose(); // Cerrar modal
    } catch (e) {
      console.error("Error al guardar: ", e);
      Alert.alert("Error", "No se pudo guardar la comida");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setTipo('Desayuno');
    setCalorias('');
    setProteina('');
    setCarbos('');
    setGrasas('');
    setHora(new Date());
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Registrar Comida</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Nombre */}
            <Text style={styles.label}>Nombre</Text>
            <TextInput
            style={[styles.inputSlight, { borderColor: '#10B981' }]}
              placeholder="Ej: Pechuga de pollo con arroz"
              placeholderTextColor="#888"
              value={nombre}
              onChangeText={setNombre}
            />

            <View style={styles.row}>
              {/* Tipo (Picker) */}
            <View style={styles.col}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                    itemStyle={{fontSize: 16}} 
                  >
                    {categorias.map((cat) => (
                      <Picker.Item key={cat} label={cat} value={cat} style={{fontSize: 16}} />
                    ))}
                  </Picker>
                </View>
              </View>

              {}
            <View style={styles.col}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity 
                  style={styles.timeInput} 
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{fontSize: 16, color: '#333'}}>
                    {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time-outline" size={20} color="gray" />
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={hora}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTime}
                  />
                )}
              </View>
            </View>

            {}
            <Text style={styles.label}>Calorías</Text>
            <TextInput
            style={styles.inputSlight}
            placeholder="0"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={calorias}
              onChangeText={setCalorias}
            />

            {}
            <View style={styles.row}>
            <View style={styles.thirdInput}>
                <Text style={styles.label}>Proteína (g)</Text>
                <TextInput
                style={styles.inputSlight}
                placeholder="0"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={proteina}
                  onChangeText={setProteina}
                />
              </View>
            <View style={[styles.thirdInput, {marginHorizontal: 5}]}>
                <Text style={styles.label}>Carbos (g)</Text>
                <TextInput
                style={styles.inputSlight}
                placeholder="0"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={carbos}
                  onChangeText={setCarbos}
                />
              </View>
            <View style={styles.thirdInput}>
                <Text style={styles.label}>Grasas (g)</Text>
                <TextInput
                style={styles.inputSlight}
                placeholder="0"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={grasas}
                  onChangeText={setGrasas}
                />
              </View>
            </View>

          {}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.btnGuardar}
              onPress={registrarComida}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextWhite}>Agregar</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
              <Text style={styles.btnTextBlack}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    fontSize: 24,
    color: '#999',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  inputSlight: {
    backgroundColor: '#F5F6F8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  thirdInput: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  timeInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  actionButtons: {
    marginTop: 20,
  },
  btnGuardar: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCancelar: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  btnTextBlack: {
    color: '#333',
    fontWeight: 'bold',
  }
});

export default FormularioNutricion;