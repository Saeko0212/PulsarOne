import React, { useState } from 'react';
import { 
  View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js'; 

const FormularioEjercicios = ({ isVisible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Pecho');
  const [dificultad, setDificultad] = useState('Principiante');
  const [musculo, setMusculo] = useState('');
  const [equipo, setEquipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [instruccionActual, setInstruccionActual] = useState('');
  const [listaInstrucciones, setListaInstrucciones] = useState([]);

  const categorias = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];
  const dificultades = ['Principiante', 'Intermedio', 'Avanzado'];

  const agregarInstruccion = () => {
    if (instruccionActual.trim()) {
      setListaInstrucciones([...listaInstrucciones, instruccionActual]);
      setInstruccionActual('');
    }
  };

  const guardarEjercicio = async () => {
    const user = auth.currentUser;
    
    if (!user) {
        Alert.alert("Error", "No hay sesión iniciada.");
        return;
    }

    if (!nombre || !descripcion) {
      Alert.alert('Error', 'Por favor completa al menos el nombre y la descripción.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "ejercicios"), {
        nombre,
        categoria,
        dificultad,
        musculoPrincipal: musculo,
        equipo,
        descripcion,
        instrucciones: listaInstrucciones,
        creadoEn: new Date(),
        userId: user.uid 
      });

      Alert.alert('Éxito', 'Ejercicio agregado correctamente');
      resetForm();
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (error) {
      console.error("Error guardando ejercicio: ", error);
      Alert.alert('Error', 'Hubo un problema al guardar el ejercicio.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setCategoria('Pecho');
    setDificultad('Principiante');
    setMusculo('');
    setEquipo('');
    setDescripcion('');
    setListaInstrucciones([]);
    setInstruccionActual('');
    setInstruccionActual('');
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Agregar Ejercicio Personalizado</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {}
            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={[styles.input, { borderColor: '#28A745' }]} 
              placeholder="Nombre del ejercicio"
              value={nombre}
              onChangeText={setNombre}
            />

            {}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoria}
                    onValueChange={(itemValue) => setCategoria(itemValue)}
                    style={styles.picker}
                  >
                    {categorias.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                  </Picker>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Dificultad</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={dificultad}
                    onValueChange={(itemValue) => setDificultad(itemValue)}
                    style={styles.picker}
                  >
                    {dificultades.map(dif => <Picker.Item key={dif} label={dif} value={dif} />)}
                  </Picker>
                </View>
              </View>
            </View>

            {}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Músculo Principal</Text>
                <TextInput 
                  style={styles.inputSlight}
                  placeholder="Ej: Pectoral mayor"
                  value={musculo}
                  onChangeText={setMusculo}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Equipo</Text>
                <TextInput 
                  style={styles.inputSlight}
                  placeholder="Ej: Mancuernas"
                  value={equipo}
                  onChangeText={setEquipo}
                />
              </View>
            </View>

            {}
            <Text style={styles.label}>Descripción</Text>
            <TextInput 
              style={[styles.inputSlight, styles.textArea]}
              placeholder="Descripción breve del ejercicio"
              multiline={true}
              value={descripcion}
              onChangeText={setDescripcion}
            />

            {}
            <Text style={styles.label}>Instrucciones</Text>
            <View style={styles.instructionRow}>
              <TextInput 
                style={[styles.inputSlight, { flex: 1 }]}
                placeholder="Paso a paso..."
                value={instruccionActual}
                onChangeText={setInstruccionActual}
              />
              <TouchableOpacity style={styles.addButton} onPress={agregarInstruccion}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {}
            {listaInstrucciones.map((inst, index) => (
              <Text key={index} style={styles.instructionItem}>• {inst.trim()}</Text>
            ))}

            {}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.btnGuardar} 
                onPress={guardarEjercicio}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#28A745',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: -15,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    paddingLeft: 10,
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
  },
});

export default FormularioEjercicios;