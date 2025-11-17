import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { doc, setDoc } from 'firebase/firestore';
 
const MetaEditorModal = ({ visible, onClose, tipo, valorActual, onSave }) => {
  const [valor, setValor] = useState('');

  useEffect(() => {
    if (visible) {
      setValor(valorActual ? valorActual.toString() : '');
    }
  }, [visible, valorActual]);

  const handleSave = async () => {
    if (!valor || isNaN(valor) || Number(valor) <= 0) {
      Alert.alert("Error", "Ingresa un número válido mayor a 0.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      const numValor = Number(valor);
      const metaRef = doc(db, 'MetasDiarias', user.uid); 
      
      const dataToUpdate = {};
      
      if (tipo === 'dias') dataToUpdate.metaDiasSemana = numValor;
      if (tipo === 'calorias') dataToUpdate.metaCalorias = numValor;
      if (tipo === 'tiempo') dataToUpdate.metaMinutos = numValor;
      
      if (tipo === 'grasa') dataToUpdate.metaGrasa = numValor;
      if (tipo === 'musculo') dataToUpdate.metaMasaMuscular = numValor;
      
      if (tipo === 'entrenamientosMes') dataToUpdate.metaEntrenamientosMes = numValor;

      await setDoc(metaRef, dataToUpdate, { merge: true });
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Error guardando meta:", error);
      Alert.alert("Error", "No se pudo guardar la meta.");
    }
  };

  const getTitulo = () => {
    if (tipo === 'dias') return "Meta de Días Semanales";
    if (tipo === 'calorias') return "Meta de Calorías Diarias";
    if (tipo === 'tiempo') return "Meta de Tiempo Diario (min)";
    if (tipo === 'grasa') return "Meta de Grasa Corporal (%)";
    if (tipo === 'musculo') return "Meta de Masa Muscular (kg)";
    if (tipo === 'entrenamientosMes') return "Meta de Entrenamientos Mensuales";
    return "Editar Meta";
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{getTitulo()}</Text>
          
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            placeholder="Ingresa tu meta..."
            autoFocus={true}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 5 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold', color: '#28a745' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  saveButton: { backgroundColor: '#28a745' },
  cancelText: { color: '#666', fontWeight: 'bold' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});

export default MetaEditorModal;