import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Modal, TouchableOpacity, 
  StyleSheet, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { db, auth } from '../database/firebaseconfig.js';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 

const FormularioMetasNutricion = ({ visible, onClose, onGoalsUpdated }) => {
  const [calorias, setCalorias] = useState('');
  const [proteina, setProteina] = useState('');
  const [carbos, setCarbos] = useState('');
  const [grasas, setGrasas] = useState('');

  useEffect(() => {
    if (visible && auth.currentUser) {
      cargarMetasActuales();
    }
  }, [visible]);

  const cargarMetasActuales = async () => {
    try {
      const docRef = doc(db, "metasNutricionales", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) { 
        const metas = docSnap.data();
        setCalorias(metas.calorias?.toString() || '');
        setProteina(metas.proteina?.toString() || '');
        setCarbos(metas.carbos?.toString() || '');
        setGrasas(metas.grasas?.toString() || '');
      } else {
        setCalorias('');
        setProteina('');
        setCarbos('');
        setGrasas('');
      }
    } catch (error) {
      console.log("Error cargando metas:", error);
      Alert.alert("Error", "No se pudieron cargar las metas existentes.");
    }
  };

  const guardarMetas = async () => {
    if (!calorias || !proteina || !carbos || !grasas) {
      Alert.alert("Atención", "Por favor completa todos los campos");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const userGoalsDocRef = doc(db, "metasNutricionales", userId);

      await setDoc(userGoalsDocRef, { 
        calorias: Number(calorias),
        proteina: Number(proteina),
        carbos: Number(carbos),
        grasas: Number(grasas),
        ultimaActualizacion: new Date(),
        userId: userId 
      });

      Alert.alert("Éxito", "Metas actualizadas correctamente");
      if (onGoalsUpdated) onGoalsUpdated(); 
      onClose();
    } catch (e) {
      console.error("Error al guardar metas: ", e);
      Alert.alert("Error", "No se pudieron guardar las metas. Intenta de nuevo.");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalView}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configurar Metas Diarias</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Calorías</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={calorias}
            onChangeText={setCalorias}
          />

          <Text style={styles.label}>Proteína (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 150"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={proteina}
            onChangeText={setProteina}
          />

          <Text style={styles.label}>Carbohidratos (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 200"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={carbos}
            onChangeText={setCarbos}
          />

          <Text style={styles.label}>Grasas (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 65"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={grasas}
            onChangeText={setGrasas}
          />

          <TouchableOpacity style={styles.btnGuardar} onPress={guardarMetas}>
            <Text style={styles.textBtnGuardar}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
            <Text style={styles.textBtnCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  btnGuardar: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  textBtnGuardar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnCancelar: {
    marginTop: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  textBtnCancelar: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default FormularioMetasNutricion;