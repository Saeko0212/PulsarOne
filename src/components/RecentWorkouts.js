import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const formatRelativeDate = (timestamp) => {
  const date = timestamp.toDate();
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1 && date.getDate() === now.getDate()) return `Hoy, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  if (diffDays <= 2) return `Ayer, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  return date.toLocaleDateString('es-ES');
};

const RecentWorkouts = () => {
  const [recent, setRecent] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const historyRef = collection(db, 'HistorialEntrenamientos');
    
    const q = query(
      historyRef, 
      where('userId', '==', user.uid),
      orderBy('fecha', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecent(list);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrenamientos Recientes</Text>
      
      <View style={styles.listContainer}>
        {recent.length > 0 ? (
          recent.map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index !== recent.length - 1 && styles.separator]}>
              <View style={styles.leftCol}>
                <Text style={styles.workoutName}>{item.rutinaUsada || 'Entrenamiento'}</Text>
                <Text style={styles.workoutDate}>{formatRelativeDate(item.fecha)}</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.workoutDuration}>{item.duracionFormato || '0 min'}</Text>
                <Text style={styles.workoutExercises}>{item.seriesTotales || 0} series</Text>
              </View>
            </View>
          ))
        ) : (
           <Text style={styles.emptyText}>No hay entrenamientos recientes.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  listContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  leftCol: { flex: 1 },
  rightCol: { alignItems: 'flex-end' },
  workoutName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  workoutDate: { fontSize: 12, color: '#999', marginTop: 2 },
  workoutDuration: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  workoutExercises: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic' }
});

export default RecentWorkouts;