import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

const calcularGrasaMarina = (genero, alturaCm, mediciones) => {
  const { cuello, cintura } = mediciones;

  if (genero === 'Hombre') {
    const { abdomen } = mediciones;
    if (!cuello || !abdomen || !alturaCm) return null;
    
    const log10 = (val) => Math.log(val) / Math.LN10;
    
    const porcentaje = 86.010 * log10(abdomen - cuello) - 70.041 * log10(alturaCm) + 36.76;
    return porcentaje > 0 ? porcentaje : null;

  } else if (genero === 'Mujer') {
    const { cadera } = mediciones;
    if (!cuello || !cintura || !cadera || !alturaCm) return null;
    
    const log10 = (val) => Math.log(val) / Math.LN10;
    
    const porcentaje = 163.205 * log10(cintura + cadera - cuello) - 97.684 * log10(alturaCm) - 78.387;
    return porcentaje > 0 ? porcentaje : null;
  }
  return null;
};

const CalculadoraGrasaModal = ({ visible, onClose, userData, onCalculated }) => {
  const [cuello, setCuello] = useState('');
  const [cintura, setCintura] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [cadera, setCadera] = useState('');

  const { genero, altura } = userData || {};

  const handleCalcular = () => {
    const mediciones = {
      cuello: Number(cuello),
      cintura: Number(cintura),
      abdomen: Number(abdomen),
      cadera: Number(cadera)
    };

    const resultado = calcularGrasaMarina(genero, altura, mediciones);
    
    if (resultado === null || isNaN(resultado)) {
      Alert.alert("Error", "Datos incorrectos. Asegúrate de que las medidas sean válidas (ej. abdomen > cuello).");
    } else {
      onCalculated(resultado);
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={styles.title}>Calculadora de Grasa</Text>
          <Text style={styles.subtitle}>Medidas en centímetros (cm)</Text>

          <Text style={styles.label}>Altura (de tu perfil)</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={`${altura || 0} cm`} editable={false} />

          <Text style={styles.label}>Género (de tu perfil)</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={genero || 'N/A'} editable={false} />

          <Text style={styles.label}>Cuello (cm)</Text>
          <TextInput style={styles.input} value={cuello} onChangeText={setCuello} keyboardType="numeric" />

          {genero === 'Hombre' && (
            <>
              <Text style={styles.label}>Abdomen (cm)</Text>
              <TextInput style={styles.input} value={abdomen} onChangeText={setAbdomen} keyboardType="numeric" />
            </>
          )}

          {genero === 'Mujer' && (
            <>
              <Text style={styles.label}>Cintura (cm)</Text>
              <TextInput style={styles.input} value={cintura} onChangeText={setCintura} keyboardType="numeric" />
              <Text style={styles.label}>Cadera (cm)</Text>
              <TextInput style={styles.input} value={cadera} onChangeText={setCadera} keyboardType="numeric" />
            </>
          )}

          <TouchableOpacity style={styles.buttonGreen} onPress={handleCalcular}>
            <Text style={styles.buttonTextWhite}>Calcular y Usar</Text>
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
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#f4f4f5', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
  inputDisabled: { backgroundColor: '#e9ecef', color: '#6c757d' },
  buttonGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  buttonWhite: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc' },
  buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default CalculadoraGrasaModal;