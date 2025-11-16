import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, db } from '../database/firebaseconfig';
import { collection, query, where, onSnapshot, doc, orderBy, limit } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';
import MetaEditorModal from './MetaEditorModal';

const StatsGrid = ({ onWeeklyDaysUpdate, onWeeklyGoalUpdate }) => { 
  const user = auth.currentUser;
  const [realDias, setRealDias] = useState(0);
  const [realCalorias, setRealCalorias] = useState(0);
  const [realMinutos, setRealMinutos] = useState(0);
  const [latestWeight, setLatestWeight] = useState(70); 

  const [metaDias, setMetaDias] = useState(6);
  const [metaCalorias, setMetaCalorias] = useState(500);
  const [metaMinutos, setMetaMinutos] = useState(60);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('dias');
  const [modalValorActual, setModalValorActual] = useState(0);

  useEffect(() => {
    if (!user) return;
    const metaRef = doc(db, 'MetasDiarias', user.uid);
    const unsubscribe = onSnapshot(metaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.metaDiasSemana) {
          setMetaDias(data.metaDiasSemana);
          if (onWeeklyGoalUpdate) onWeeklyGoalUpdate(data.metaDiasSemana); 
        }
        if (data.metaCalorias) setMetaCalorias(data.metaCalorias);
        if (data.metaMinutos) setMetaMinutos(data.metaMinutos);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const qPeso = query(collection(db, 'PerfilDatos', user.uid, 'mediciones'), orderBy('fecha', 'desc'), limit(1));
    const unsubPeso = onSnapshot(qPeso, (s) => {
      if (!s.empty) setLatestWeight(s.docs[0].data().peso);
    });
    return () => unsubPeso();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    
    const curr = new Date();
    const day = curr.getDay(); 
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
    const mondayStart = new Date(curr.setDate(diff));
    mondayStart.setHours(0,0,0,0);

    const q = query(
      collection(db, 'HistorialEntrenamientos'), 
      where('userId', '==', user.uid), 
      where('fecha', '>=', mondayStart)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uniqueDaysSet = new Set();
      let todaySeconds = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const wDate = data.fecha.toDate();
        
        uniqueDaysSet.add(wDate.toISOString().split('T')[0]);

        if (wDate >= todayStart) {
          todaySeconds += (data.duracionSegundos || 0);
        }
      });

      const diasEntrenados = uniqueDaysSet.size;
      setRealDias(diasEntrenados);
      if (onWeeklyDaysUpdate) { 
        onWeeklyDaysUpdate(diasEntrenados);
      }
      
      const mins = Math.floor(todaySeconds / 60);
      setRealMinutos(mins);

      const cals = Math.round(0.0175 * 6.0 * latestWeight * mins);
      setRealCalorias(cals);
    });

    return () => unsubscribe();
  }, [user, latestWeight, onWeeklyDaysUpdate]);

  const openModal = (tipo) => {
    setModalTipo(tipo);
    if (tipo === 'dias') setModalValorActual(metaDias);
    if (tipo === 'calorias') setModalValorActual(metaCalorias);
    if (tipo === 'tiempo') setModalValorActual(metaMinutos);
    setModalVisible(true);
  };

  const calcularPromedioTotal = () => {
    const pDias = Math.min((realDias / metaDias) * 100, 100);
    const pCals = Math.min((realCalorias / metaCalorias) * 100, 100);
    const pMins = Math.min((realMinutos / metaMinutos) * 100, 100);
    
    return Math.round((pDias + pCals + pMins) / 3);
  };

  return (
    <View style={styles.gridContainer}>
      
      {}
      <TouchableOpacity style={styles.card} onPress={() => openModal('dias')}>
        <Text style={styles.cardTitle}>Entrenamientos esta semana</Text>
        <Text style={styles.cardValue}>{realDias}</Text>
        <Text style={styles.cardSub}>de {metaDias}</Text>
        <View style={[styles.iconBg, { backgroundColor: '#eef6ff' }]}>
           <FontAwesome5 name="calendar-check" size={20} color="#3b82f6" />
        </View>
      </TouchableOpacity>

      {}
      <TouchableOpacity style={styles.card} onPress={() => openModal('calorias')}>
        <Text style={styles.cardTitle}>Calorías quemadas hoy</Text>
        <Text style={styles.cardValue}>{realCalorias}</Text>
        <Text style={styles.cardSub}>de {metaCalorias}</Text>
        <View style={[styles.iconBg, { backgroundColor: '#fff7ed' }]}>
           <FontAwesome5 name="fire" size={20} color="#f97316" />
        </View>
      </TouchableOpacity>

      {}
      <TouchableOpacity style={styles.card} onPress={() => openModal('tiempo')}>
        <Text style={styles.cardTitle}>Tiempo de ejercicio</Text>
        <Text style={styles.cardValue}>{realMinutos} min</Text>
        <Text style={styles.cardSub}>de {metaMinutos} min</Text>
        <View style={[styles.iconBg, { backgroundColor: '#f0fdf4' }]}>
           <FontAwesome5 name="clock" size={20} color="#22c55e" />
        </View>
      </TouchableOpacity>

      {}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cumplimiento Diario</Text>
        <Text style={styles.cardValue}>{calcularPromedioTotal()}%</Text>
        <Text style={styles.cardSub}>de 100%</Text>
        <View style={[styles.iconBg, { backgroundColor: '#faf5ff' }]}>
           <FontAwesome5 name="chart-pie" size={20} color="#a855f7" />
        </View>
      </View>

      {}
      <MetaEditorModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        tipo={modalTipo}
        valorActual={modalValorActual}
        onSave={() => {}} 
      />

    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
    position: 'relative',
    height: 140,
  },
  cardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSub: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  iconBg: {
    position: 'absolute', bottom: 15, left: 15, width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default StatsGrid;