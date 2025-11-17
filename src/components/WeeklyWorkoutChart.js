import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit'; 
import { auth, db } from '../database/firebaseconfig.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const WeeklyWorkoutChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const now = new Date();
    now.setHours(23, 59, 59, 999); 

    const dayOfWeek = now.getDay(); 
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const thisWeekMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    thisWeekMonday.setHours(0, 0, 0, 0); 

    const startDate = new Date(thisWeekMonday.getTime() - (35 * 24 * 60 * 60 * 1000));

    const historyRef = collection(db, 'HistorialEntrenamientos');
    const q = query(
      historyRef, 
      where('userId', '==', user.uid),
      where('fecha', '>=', startDate),
      where('fecha', '<=', now) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const weekBuckets = Array(6).fill(null).map(() => new Set());
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.fecha) return;
        
        const workoutDate = data.fecha.toDate();
        
        const diffTime = workoutDate.getTime() - startDate.getTime(); 
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7); 

        if (weekIndex >= 0 && weekIndex < 6) {
          weekBuckets[weekIndex].add(workoutDate.toISOString().split('T')[0]);
        }
      });

      const counts = weekBuckets.map(weekSet => weekSet.size);
      
      const chartLabels = ["-5 sem", "-4 sem", "-3 sem", "-2 sem", "Pasada", "Actual"];
      
      setChartData({
        labels: chartLabels,
        datasets: [{ data: counts }],
      });
      setLoading(false);

    }, (error) => {
      console.error("Error al cargar historial de semanas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Entrenamientos por Semana</Text>
        <ActivityIndicator style={{ height: 200 }} />
      </View>
    );
  }
  
  if (!chartData || chartData.datasets[0].data.every(v => v === 0)) {
     return (
      <View style={styles.card}>
        <Text style={styles.title}>Entrenamientos por Semana</Text>
        <View style={styles.emptyView}>
           <Text style={styles.emptyText}>Registra entrenamientos para ver tu racha.</Text>
        </View>
      </View>
     );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Entrenamientos por Semana</Text>
      
      <BarChart
        data={chartData}
        width={screenWidth - 70}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero={true}
        showValuesOnTopOfBars={true}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(38, 166, 154, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '0' },
          barPercentage: 0.7,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

// ... (Tus estilos se mantienen exactamente igual)
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  emptyView: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

export default WeeklyWorkoutChart;