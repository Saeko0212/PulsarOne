import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { auth, db } from '../database/firebaseconfig';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import MetaEditorModal from '../components/MetaEditorModal'; 
import PesoChart from '../components/PesoChart';
import WeeklyWorkoutChart from '../components/WeeklyWorkoutChart';
import PersonalRecords from '../components/PersonalRecords';
import MonthlyAchievements from '../components/MonthlyAchievements';
import MonthlyGoals from '../components/MonthlyGoals';

const Progreso = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [userData, setUserData] = useState(null);
  const [latestMedicion, setLatestMedicion] = useState(null);
  const [medicionesHistorico, setMedicionesHistorico] = useState([]);
  
  const [pesoObjetivoCalculado, setPesoObjetivoCalculado] = useState(null);
  const [activeWeightGoal, setActiveWeightGoal] = useState(null);
  
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const [metaGrasa, setMetaGrasa] = useState(null);
  const [metaMasaMuscular, setMetaMasaMuscular] = useState(null);

  const [metaEntrenamientosMes, setMetaEntrenamientosMes] = useState(25); 
  const [progresoEntrenamientosMes, setProgresoEntrenamientosMes] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('grasa');
  const [modalValorActual, setModalValorActual] = useState(0);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'PerfilDatos', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'PerfilDatos', user.uid, 'mediciones'), 
      orderBy('fecha', 'asc')
    );
    const unsubscribe = onSnapshot(q, (s) => {
      if (!s.empty) {
        const allData = s.docs.map(doc => doc.data());

        const latestPerDay = {};
        allData.forEach(medicion => {
          const dayKey = medicion.fecha.toDate().toISOString().split('T')[0];
          latestPerDay[dayKey] = medicion;
        });

        const filteredData = Object.values(latestPerDay);

        setMedicionesHistorico(filteredData);
        setLatestMedicion(allData[allData.length - 1]); 
      } else {
        setMedicionesHistorico([]);
        setLatestMedicion(null);
      }
      setLoading(false); 
    }, (error) => {
      console.error("Error cargando mediciones:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const historyRef = collection(db, 'HistorialEntrenamientos');
    const q = query(historyRef, where('userId', '==', user.uid));
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalSecs = 0;
      let countThisMonth = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalSecs += data.duracionSegundos || 0;
        if (data.fecha && data.fecha.toDate() >= firstDayOfMonth) {
          countThisMonth++;
        }
      });
      setTotalWorkouts(snapshot.size); 
      setTotalSeconds(totalSecs); 
      setProgresoEntrenamientosMes(countThisMonth); 
    });
    return () => unsubscribe();
  }, [user]);


  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "Objetivos"), 
      where("userId", "==", user.uid),
      where("categoria", "==", "Peso"),
      orderBy("creadoEn", "desc"),
      limit(1)
    );
    const unsubscribeGoal = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const objetivoData = snapshot.docs[0].data();
        setActiveWeightGoal(objetivoData); 
        const pesoBaseParaCalculo = objetivoData.pesoInicial;

        if (pesoBaseParaCalculo) {
          try {
            const API_URL = "https://3hj4dtla5i.execute-api.us-east-2.amazonaws.com/calcular-peso-objetivo"; 
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pesoBase: pesoBaseParaCalculo,
                objetivoValor: objetivoData.objetivoValor, 
                tipoMeta: objetivoData.tipoMeta,
              }),
            });
            const data = await response.json();
            if (response.ok) setPesoObjetivoCalculado(Number(data.pesoObjetivo));
          } catch (error) {
            console.error("Error API:", error); 
          }
        } else { 
          setPesoObjetivoCalculado(null); 
        }
      } else { 
        setPesoObjetivoCalculado(null);
        setActiveWeightGoal(null);
      }
    });

    return () => unsubscribeGoal();
  }, [user]);


  useEffect(() => {
    if (!user) return;
    const metaRef = doc(db, 'MetasDiarias', user.uid); 
    const unsubscribe = onSnapshot(metaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMetaGrasa(data.metaGrasa);
        setMetaMasaMuscular(data.metaMasaMuscular);
        setMetaEntrenamientosMes(data.metaEntrenamientosMes || 25); 
      }
    });
    return () => unsubscribe();
  }, [user]);
  
  const openModal = (tipo) => {
    setModalTipo(tipo);
    if (tipo === 'grasa') setModalValorActual(metaGrasa);
    if (tipo === 'musculo') setModalValorActual(metaMasaMuscular);
    if (tipo === 'entrenamientosMes') setModalValorActual(metaEntrenamientosMes); 
    setModalVisible(true);
  };


  
  const actualPeso = latestMedicion?.peso;
  const actualGrasa = latestMedicion?.grasa;
  const altura = userData?.altura;

  const calcularIMC = (peso, alturaCm) => {
    if (!peso || !alturaCm) return null;
    return peso / ((alturaCm / 100) ** 2);
  };

  let pesoCambio = 0;
  let pesoCambioTexto = '-- kg';
  let pesoCambioStyle = styles.badgeBlue; 

  if (actualPeso && activeWeightGoal && activeWeightGoal.pesoInicial) {
    
    pesoCambio = actualPeso - activeWeightGoal.pesoInicial; 
    
    if (pesoCambio > 0.05) { 
      pesoCambioTexto = `+${pesoCambio.toFixed(1)} kg`;
      pesoCambioStyle = styles.badgeGreen; 
    } else if (pesoCambio < -0.05) { 
      pesoCambioTexto = `${pesoCambio.toFixed(1)} kg`; 
      pesoCambioStyle = styles.badgeBlue; 
    } else {
      pesoCambioTexto = '0.0 kg';
      pesoCambioStyle = styles.badgeBlue;
    }
  }

  let grasaDiff = null;
  let grasaDiffText = '-- %';
  if (actualGrasa && metaGrasa) {
    grasaDiff = metaGrasa - actualGrasa;
    grasaDiffText = `${grasaDiff.toFixed(1)}%`;
    if (grasaDiff > 0) {
        grasaDiffText = `+${grasaDiffText}`;
    }
  }

  let masaMuscular = null;
  if (actualPeso && actualGrasa) {
    const masaGrasaKg = actualPeso * (actualGrasa / 100);
    masaMuscular = actualPeso - masaGrasaKg;
  }
  let musculoDiff = null;
  let musculoDiffText = '-- kg';
  if (masaMuscular && metaMasaMuscular) {
    musculoDiff = metaMasaMuscular - masaMuscular;
    musculoDiffText = `${musculoDiff.toFixed(1)} kg`; 
  }

  const actualIMC = calcularIMC(actualPeso, altura);
  const metaIMC = calcularIMC(pesoObjetivoCalculado, altura);
  let imcDiff = null;
  let imcDiffText = '--';
  if (actualIMC && metaIMC) {
    imcDiff = metaIMC - actualIMC;
    imcDiffText = imcDiff.toFixed(1); 
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#28a745" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.mainTitle}>Seguimiento de Progreso</Text>
        <Text style={styles.mainSubtitle}>Monitorea tu evolución y logros en el tiempo</Text>

        {}
        <View style={styles.gridContainer}>
          {}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Peso Corporal</Text>
            <View style={[styles.badge, pesoCambioStyle]}>
              <Text style={styles.badgeText}>{pesoCambioTexto}</Text>
            </View>
            <Text style={styles.cardValue}>{actualPeso ? `${actualPeso} kg` : '-- kg'}</Text>
            <Text style={styles.cardMeta}>Meta: {pesoObjetivoCalculado ? `${pesoObjetivoCalculado.toFixed(1)} kg` : '-- kg'}</Text>
          </View>

          {}
          <TouchableOpacity style={styles.card} onPress={() => openModal('grasa')}>
            <Text style={styles.cardTitle}>Grasa Corporal</Text>
            <View style={[styles.badge, grasaDiff > 0 ? styles.badgeGreen : styles.badgeBlue]}>
              <Text style={styles.badgeText}>{grasaDiffText}</Text>
            </View>
            <Text style={styles.cardValue}>{actualGrasa ? `${actualGrasa}%` : '-- %'}</Text>
            <Text style={styles.cardMeta}>Meta: {metaGrasa ? `${metaGrasa}%` : '-- %'}</Text>
          </TouchableOpacity>
          
          {}
          <TouchableOpacity style={styles.card} onPress={() => openModal('musculo')}>
            <Text style={styles.cardTitle}>Masa Muscular</Text>
            <View style={[styles.badge, musculoDiff > 0 ? styles.badgeGreen : styles.badgeBlue]}>
              <Text style={styles.badgeText}>{musculoDiff > 0 ? `+${musculoDiffText}` : musculoDiffText}</Text>
            </View>
            <Text style={styles.cardValue}>{masaMuscular ? `${masaMuscular.toFixed(1)} kg` : '-- kg'}</Text>
            <Text style={styles.cardMeta}>Meta: {metaMasaMuscular ? `${metaMasaMuscular} kg` : '-- kg'}</Text>
          </TouchableOpacity>
          
          {}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>IMC</Text>
            <View style={[styles.badge, imcDiff > 0 ? styles.badgeGreen : styles.badgeBlue]}>
              <Text style={styles.badgeText}>{imcDiff > 0.1 ? `+${imcDiffText}` : imcDiffText}</Text>
            </View>
            <Text style={styles.cardValue}>{actualIMC ? actualIMC.toFixed(1) : '--'}</Text>
            <Text style={styles.cardMeta}>Meta: {metaIMC ? metaIMC.toFixed(1) : '--'}</Text>
          </View>
        </View>

        {}
        <PesoChart data={medicionesHistorico} />
        <WeeklyWorkoutChart />
        <PersonalRecords />

        {}
        <MonthlyAchievements
          totalWorkouts={totalWorkouts}
          pesoCambio={actualPeso - (activeWeightGoal?.pesoInicial || actualPeso)}
          totalHoras={totalSeconds / 3600}
        />

        {}
        <MonthlyGoals 
          progresoEntrenamientos={progresoEntrenamientosMes}
          metaEntrenamientos={metaEntrenamientosMes}
          progresoPeso={actualPeso}
          metaPeso={pesoObjetivoCalculado}
          activeWeightGoal={activeWeightGoal}
          onPressEntrenamientos={() => openModal('entrenamientosMes')}
        />
        
      </ScrollView>
      
      {}
      <MetaEditorModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        tipo={modalTipo}
        valorActual={modalValorActual}
        onSave={() => {}} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
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
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeBlue: {
    backgroundColor: '#e6f0ff', 
  },
  badgeGreen: {
    backgroundColor: '#e6f7eb',
  },
  badgeRed: {
    backgroundColor: '#fde2e4',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
  },
});

export default Progreso;