import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { auth, db } from '../database/firebaseconfig';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

import FormularioObjetivos from '../components/FormularioObjetivos';
import ObjetivoItem from '../components/ObjetivoItem';
import ListaObjetivosCompletados from '../components/ListaObjetivosCompletados';


const EmptyComponent = ({ onPress }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconBg}>
      <FontAwesome name="bullseye" size={50} color="#8A9AAB" />
    </View>
    <Text style={styles.emptyTitle}>No tienes objetivos activos</Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onPress}>
      <Text style={styles.emptyButtonText}>Crear tu primer objetivo</Text>
    </TouchableOpacity>
  </View>
);


const Objetivos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activos, setActivos] = useState([]);        
  const [completados, setCompletados] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [latestWeight, setLatestWeight] = useState(null);
  const [trainingDaysCount, setTrainingDaysCount] = useState(0);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false); return; }
    const objRef = collection(db, "Objetivos");
    const q = query(objRef, where("userId", "==", user.uid), orderBy("fechaLimite", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivos(lista);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando activos:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const compRef = collection(db, "ObjetivosCompletados");
    const q = query(compRef, where("userId", "==", user.uid), orderBy("fechaCompletado", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletados(lista);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');
    const qPeso = query(medicionesRef, orderBy('fecha', 'desc'), limit(1));
    const unsubPeso = onSnapshot(qPeso, (s) => setLatestWeight(s.empty ? null : s.docs[0].data().peso));

    const historyRef = collection(db, 'HistorialEntrenamientos');
    const qHist = query(historyRef, where('userId', '==', user.uid));
    const unsubHist = onSnapshot(qHist, (s) => {
        const uniqueDates = new Set();
        s.forEach(d => d.data().fecha && uniqueDates.add(d.data().fecha.toDate().toISOString().split('T')[0]));
        setTrainingDaysCount(uniqueDates.size);
    });

    return () => { 
      unsubPeso(); 
      unsubHist(); 
    };
  }, [user]);

  const handleFinalizarObjetivo = async (item) => {
    try {
      await addDoc(collection(db, "ObjetivosCompletados"), {
        ...item,
        fechaCompletado: Timestamp.now(),
        estadoFinal: "Completado" 
      });
      await deleteDoc(doc(db, "Objetivos", item.id));

      Alert.alert("¡Felicidades!", "Objetivo movido a tu historial.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar en el historial.");
    }
  };


  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.listContainer}>
        
        {}
        <View style={styles.header}>
          <View>
            <Text style={styles.mainTitle}>Mis Objetivos</Text>
            <Text style={styles.mainSubtitle}>Define y alcanza tus metas de fitness</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <FontAwesome name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Nuevo Objetivo</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.cardBlue]}>
            <FontAwesome name="dot-circle-o" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{activos.length}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={[styles.statCard, styles.cardGreen]}>
            <FontAwesome name="trophy" size={24} color="#10b981" />
            <Text style={styles.statValue}>{completados.length}</Text>
            <Text style={styles.statLabel}>Completos</Text>
          </View>
          
          <View style={[styles.statCard, styles.cardPurple]}>
            <FontAwesome name="pie-chart" size={24} color="#a855f7" />
            <Text style={styles.statValue}>--%</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Objetivos Activos</Text>
        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
        
        {!loading && activos.length === 0 && (
          <EmptyComponent onPress={() => setModalVisible(true)} />
        )}
        
        {!loading && activos.map(item => (
            <ObjetivoItem 
              key={item.id} 
              item={item} 
              latestWeight={latestWeight}
              trainingDaysCount={trainingDaysCount}
              onFinalizar={handleFinalizarObjetivo}
            />
        ))}

        {}
        {!loading && (
          <ListaObjetivosCompletados data={completados} />
        )}

      </ScrollView>

      <FormularioObjetivos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8f9fa' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  mainSubtitle: { 
    fontSize: 14, 
    color: '#666' 
  },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#28a745', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  statCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardBlue: { backgroundColor: '#eef6ff' },
  cardGreen: { backgroundColor: '#e6f7eb' },
  cardPurple: { backgroundColor: '#f9f0ff' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 12, marginTop: 10 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  emptyButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Objetivos;