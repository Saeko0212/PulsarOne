import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Modal, TouchableOpacity, 
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { db, auth } from '../database/firebaseconfig.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const FormularioMetasNutricion = ({ visible, onClose, onGoalsUpdated }) => {
  const [calorias, setCalorias] = useState('');
  const [proteina, setProteina] = useState('');
  const [carbos, setCarbos] = useState('');
  const [grasas, setGrasas] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && auth.currentUser) {
      cargarMetasActuales();
    }
  }, [visible]);

  const cargarMetasActuales = async () => {
    try {
      const docRef = doc(db, "PerfilDatos", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().metasNutricionales) {
        const metas = docSnap.data().metasNutricionales;
        setCalorias(metas.calorias.toString());
        setProteina(metas.proteina.toString());
        setCarbos(metas.carbos.toString());
        setGrasas(metas.grasas.toString());
      }
    } catch (error) {
      console.log("Error cargando metas:", error);
    }
  };

  const guardarMetas = async () => {
    if (!calorias || !proteina || !carbos || !grasas) {
      Alert.alert("Atención", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "PerfilDatos", userId);

      await setDoc(userRef, {
        metasNutricionales: {
          calorias: Number(calorias),
          proteina: Number(proteina),
          carbos: Number(carbos),
          grasas: Number(grasas),
          ultimaActualizacion: new Date()
        }
      }, { merge: true });

      Alert.alert("Éxito", "Metas actualizadas correctamente");
      if (onGoalsUpdated) onGoalsUpdated();
      onClose();
    } catch (e) {
      console.error("Error al guardar metas: ", e);
      Alert.alert("Error", "No se pudieron guardar las metas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade" 
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Configurar Metas Diarias</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {}
            <Text style={styles.label}>Calorías</Text>
            <TextInput
              style={styles.inputSlight}
              placeholder="Ej: 2000"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={calorias}
              onChangeText={setCalorias}
            />

            {}
            <Text style={styles.label}>Proteína (g)</Text>
            <TextInput
              style={styles.inputSlight}
              placeholder="Ej: 150"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={proteina}
              onChangeText={setProteina}
            />

            {}
            <Text style={styles.label}>Carbohidratos (g)</Text>
            <TextInput
              style={styles.inputSlight}
              placeholder="Ej: 200"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={carbos}
              onChangeText={setCarbos}
            />

            {}
            <Text style={styles.label}>Grasas (g)</Text>
            <TextInput
              style={styles.inputSlight}
              placeholder="Ej: 65"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={grasas}
              onChangeText={setGrasas}
            />

            {}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.btnGuardar} 
                onPress={guardarMetas}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextWhite}>Guardar</Text>}
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
  inputSlight: {
    backgroundColor: '#F5F6F8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#333',
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

export default FormularioMetasNutricion;