import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';
import FormularioPrograma from '../components/FormularioPrograma'; 

const Programas = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [programaParaEditar, setProgramaParaEditar] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUserId(user ? user.uid : null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) {
      setProgramas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "programas"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snapshot) => {
      setProgramas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const handleAbrirNuevo = () => {
    setProgramaParaEditar(null);
    setModalVisible(true);
  };

  const handleAbrirEditar = (programa) => {
    setProgramaParaEditar(programa);
    setModalVisible(true);
  };

  const confirmarBorrado = (id) => {
    Alert.alert("Eliminar Programa", "¿Estás seguro?", [
      { text: "Cancelar" },
      { text: "Eliminar", style: "destructive", 
        onPress: async () => await deleteDoc(doc(db, "programas", id)) 
      }
    ]);
  };
  
  const renderItem = ({ item }) => {
    const diasNombres = item.dias ? Object.keys(item.dias) : [];
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{diasNombres.length} Días</Text></View>
        </View>
        <Text style={styles.cardDescription}>
          {diasNombres.length > 0 ? diasNombres.join(' • ') : "Programa vacío"}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnStart}><Text style={styles.btnStartText}>Usar en Timer</Text></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleAbrirEditar(item)}><Ionicons name="create-outline" size={20} color="#555" /></TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { borderColor: '#FADBD8' }]} onPress={() => confirmarBorrado(item.id)}><Ionicons name="trash-outline" size={20} color="#E74C3C" /></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeader}>
        <View><Text style={styles.mainTitle}>Mis Programas</Text><Text style={styles.mainSubtitle}>Tus splits semanales estructurados.</Text></View>
        <TouchableOpacity style={styles.btnNew} onPress={handleAbrirNuevo}>
          <Ionicons name="add" size={18} color="#FFF" style={{marginRight: 5}} />
          <Text style={styles.btnNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator />}
      <FlatList
        data={programas}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>{userId ? "No has creado programas." : "Inicia sesión."}</Text>}
      />
      <FormularioPrograma
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setModalVisible(false)}
        programaParaEditar={programaParaEditar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 10 },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25, marginTop: 10 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  mainSubtitle: { fontSize: 12, color: '#666', marginTop: 5 },
  btnNew: { flexDirection: 'row', backgroundColor: '#28A745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnNewText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#2196F3', fontWeight: 'bold', fontSize: 11 },
  cardDescription: { fontSize: 12, color: '#777', marginBottom: 15, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnStart: { flex: 1, backgroundColor: '#28A745', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  btnStartText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginLeft: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default Programas;