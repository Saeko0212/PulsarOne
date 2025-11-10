import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { auth, db } from '../database/firebaseconfig';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

import FormularioObjetivos from '../components/FormularioObjetivos';
import ObjetivoItem from '../components/ObjetivoItem';
import ObjetivoCompletadoItem from '../components/ObjetivoCompletadoItem';


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
  const [allObjetivos, setAllObjetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestWeight, setLatestWeight] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false); return; }
    const objRef = collection(db, "Objetivos");
    const q = query(objRef, where("userId", "==", user.uid), orderBy("fechaLimite", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaObjetivos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllObjetivos(listaObjetivos);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar objetivos: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { return; }
    const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');
    const q = query(medicionesRef, orderBy('fecha', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestWeight(snapshot.docs[0].data().peso);
      } else {
        setLatestWeight(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const { activos, completados } = useMemo(() => {
    const activosArr = [];
    const completadosArr = [];
    for (const item of allObjetivos) {
      let isCompleted = false;
      if (item.categoria === 'Peso' && latestWeight !== null && item.pesoInicial) {
        const target = item.objetivoValor;
        const start = item.pesoInicial;
        const current = latestWeight;
        let progress = 0;
        if (item.tipoMeta === 'perder') progress = start - current;
        else if (item.tipoMeta === 'ganar') progress = current - start;
        
        if (progress >= target) isCompleted = true;
      } else if (item.categoria !== 'Peso') {
        if (item.progresoActual >= item.objetivoValor) isCompleted = true;
      }
      if (isCompleted) {
        completadosArr.push(item);
      } else {
        activosArr.push(item);
      }
    }
    return { activos: activosArr, completados: completadosArr };
  }, [allObjetivos, latestWeight]);


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
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Objetivos Activos</Text>
        {loading && <ActivityIndicator size="large" style={{ marginTop: 50 }} />}
        
        {!loading && activos.length === 0 && (
          <EmptyComponent onPress={() => setModalVisible(true)} />
        )}
        
        {!loading && activos.length > 0 && (
          activos.map(item => (
            <ObjetivoItem key={item.id} item={item} latestWeight={latestWeight} />
          ))
        )}

        {}
        {!loading && completados.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Objetivos Completados</Text>
            {completados.map(item => (
              <ObjetivoCompletadoItem key={item.id} item={item} />
            ))}
          </>
        )}

      </ScrollView>

      {}
      <FormularioObjetivos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  listContainer: { 
    paddingHorizontal: 15, 
    paddingBottom: 30 
  },

  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15 
  },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  mainSubtitle: { 
    fontSize: 14, 
    color: '#666' 
  },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#28a745', 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 8 
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14, 
    marginLeft: 8 
  },

  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 15 
  },
  statCard: { 
    flex: 1, 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginHorizontal: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 2 
  },
  cardBlue: { 
    backgroundColor: '#eef6ff' 
  },
  cardGreen: { 
    backgroundColor: '#e6f7eb' 
  },
  cardPurple: { 
    backgroundColor: '#f9f0ff' 
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 8 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },

  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15, 
    marginTop: 10 
  },

  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginTop: 10 
  },
  emptyIconBg: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15 
  },
  emptyButton: { 
    backgroundColor: '#28a745', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 8 
  },
  emptyButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  objetivoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    flex: 1,
  },
  cardTag: {
    backgroundColor: '#eef6ff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cardTagText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },

  completadoCard: {
    backgroundColor: '#e6f7eb',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  completadoTag: {
    backgroundColor: 'transparent',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  completadoTagText: {
    color: '#10b981',
  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    marginVertical: 10,
  },
  completadoCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#b4e3c9',
  },
  completadoCheckText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Objetivos;