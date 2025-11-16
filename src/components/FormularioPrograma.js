import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, FlatList
} from 'react-native';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';
import SelectorRutina from './SelectorRutina'; 

const DiaProgramaEditor = ({ dia, onUpdateNombre, onRemoveDia, onOpenSelector, onRemoveRutina, rutinasInfo }) => {
  return (
    <View style={styles.diaContainer}>
      <View style={styles.diaHeader}>
        <TextInput
          style={styles.inputNombreDia}
          value={dia.nombreDia}
          onChangeText={(txt) => onUpdateNombre(txt)}
          placeholder="Ej: Lunes - Empuje"
        />
        <TouchableOpacity onPress={onRemoveDia}>
          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
      
      {}
      {dia.rutinaIds.map((rutinaId, index) => {
        const rutina = rutinasInfo[rutinaId]; 
        return (
          <View key={index} style={styles.rutinaRow}>
            <Text style={styles.rutinaText}>• {rutina ? rutina.nombre : "Rutina eliminada"}</Text>
            <TouchableOpacity onPress={() => onRemoveRutina(index)}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity style={styles.btnAddRutina} onPress={onOpenSelector}>
        <Ionicons name="add" size={16} color="#28A745" />
        <Text style={styles.btnAddRutinaText}>Asignar Rutina</Text>
      </TouchableOpacity>
    </View>
  );
};

const FormularioPrograma = ({ isVisible, onClose, onSuccess, programaParaEditar = null }) => {
  const [loading, setLoading] = useState(false);
  const [nombrePrograma, setNombrePrograma] = useState("");
  const [dias, setDias] = useState([]);
  
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [diaActualIndex, setDiaActualIndex] = useState(null);
  
  const [rutinasMap, setRutinasMap] = useState({});

  useEffect(() => {
    if (!isVisible) return;
    
    const cargarRutinasMap = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "rutinas"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const mapa = {};
      snap.docs.forEach(doc => {
        mapa[doc.id] = doc.data();
      });
      setRutinasMap(mapa);
    };
    
    cargarRutinasMap();

    if (programaParaEditar) {
      setNombrePrograma(programaParaEditar.nombre);
      const diasArray = Object.keys(programaParaEditar.dias).map(nombre => ({
        nombreDia: nombre,
        rutinaIds: programaParaEditar.dias[nombre] 
      }));
      setDias(diasArray);
    } else {
      resetForm();
    }
  }, [programaParaEditar, isVisible]);

  const resetForm = () => {
    setNombrePrograma('');
    setDias([{ nombreDia: "Día 1", rutinaIds: [] }]);
  };

  // --- Days Logic ---
  const handleAgregarDia = () => setDias([...dias, { nombreDia: `Día ${dias.length + 1}`, rutinaIds: [] }]);
  const handleRemoveDia = (index) => setDias(dias.filter((_, i) => i !== index));
  const handleUpdateNombreDia = (index, nombre) => {
    const nuevos = [...dias];
    nuevos[index].nombreDia = nombre;
    setDias(nuevos);
  };

  const handleOpenSelector = (index) => {
    setDiaActualIndex(index);
    setSelectorVisible(true);
  };
  const handleRemoveRutina = (indexDia, indexRutina) => {
    const nuevos = [...dias];
    nuevos[indexDia].rutinaIds.splice(indexRutina, 1);
    setDias(nuevos);
  };
  const handleRutinaSeleccionada = (rutina) => {
    if (diaActualIndex === null) return;
    const nuevos = [...dias];
    nuevos[diaActualIndex].rutinaIds.push(rutina.id);
    setDias(nuevos);
    setSelectorVisible(false);
  };

  // --- SAVE ---
  const guardarPrograma = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!nombrePrograma.trim()) {
        Alert.alert("Faltan datos", "Dale un nombre a tu programa.");
        return;
    }
    setLoading(true);

    const diasMap = {};
    for (const dia of dias) {
      if (dia.nombreDia && dia.rutinaIds.length > 0) {
        diasMap[dia.nombreDia] = dia.rutinaIds;
      }
    }
    
    if (Object.keys(diasMap).length === 0) {
        Alert.alert("Programa vacío", "Añade al menos una rutina a un día para poder guardar.");
        setLoading(false);
        return;
    }

    try {
      const datos = {
        nombre: nombrePrograma,
        userId: user.uid,
        actualizadoEn: new Date(),
        dias: diasMap
      };
      if (programaParaEditar) {
        await updateDoc(doc(db, "programas", programaParaEditar.id), datos);
      } else {
        await addDoc(collection(db, "programas"), { ...datos, creadoEn: new Date() });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  return (
    <>
      <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.header}>
                <Text style={styles.title}>{programaParaEditar ? "Editar" : "Nuevo"} Programa</Text>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#999" /></TouchableOpacity>
              </View>
              <Text style={styles.label}>Nombre del Programa</Text>
              <TextInput style={styles.input} placeholder="Ej: Mi Split PPL" value={nombrePrograma} onChangeText={setNombrePrograma} />
              <Text style={styles.label}>Asignación de Días</Text>
              
              {dias.map((dia, index) => (
                <DiaProgramaEditor 
                  key={index}
                  dia={dia}
                  rutinasInfo={rutinasMap} 
                  onUpdateNombre={(nombre) => handleUpdateNombreDia(index, nombre)}
                  onRemoveDia={() => handleRemoveDia(index)}
                  onOpenSelector={() => handleOpenSelector(index)}
                  onRemoveRutina={(idxRutina) => handleRemoveRutina(index, idxRutina)}
                />
              ))}

              <TouchableOpacity style={styles.btnAgregarDia} onPress={handleAgregarDia}>
                <Ionicons name="add-circle-outline" size={20} color="#555" />
                <Text style={styles.btnAgregarDiaText}>Agregar otro Día</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnCrear} onPress={guardarPrograma} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtWhite}>Guardar Programa</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SelectorRutina
        isVisible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onSelect={handleRutinaSeleccionada}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '95%', height: '95%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 10, color: '#333' },
  input: { backgroundColor: '#F5F6F8', borderRadius: 8, padding: 12, fontSize: 14 },
  diaContainer: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#FAFAFA' },
  diaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8, marginBottom: 8 },
  inputNombreDia: { flex: 1, fontWeight: 'bold', fontSize: 16, color: '#28A745', padding: 5 },
  rutinaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, marginBottom: 3 },
  rutinaText: { fontSize: 14, color: '#555' },
  btnAddRutina: { flexDirection: 'row', alignItems: 'center', padding: 8, marginTop: 5, borderStyle: 'dashed', borderWidth: 1, borderColor: '#28A745', borderRadius: 5 },
  btnAddRutinaText: { color: '#28A745', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  btnAgregarDia: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#CCC', borderStyle: 'dashed', borderRadius: 8, marginTop: 5 },
  btnAgregarDiaText: { color: '#555', fontWeight: '600', marginLeft: 5 },
  actions: { marginTop: 25, marginBottom: 20 },
  btnCrear: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center' },
  txtWhite: { color: '#FFF', fontWeight: 'bold' },
});

export default FormularioPrograma;