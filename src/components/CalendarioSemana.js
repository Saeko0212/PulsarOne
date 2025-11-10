import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { db, auth } from '../database/firebaseconfig.js'; // Asegúrate de que la ruta sea correcta
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const TIPO_COLORES = {
  'Entrenamiento': '#007bff', 'Cardio': '#28a745', 'Yoga': '#6f42c1',
  'Natación': '#17a2b8', 'Deporte': '#fd7e14', 'Otro': '#6c757d', 'default': '#6c757d',
};
const getColorForType = (tipo) => TIPO_COLORES[tipo] || TIPO_COLORES.default;
const formatWeeklyDate = (date) => {
  if (!date) return '';
  const dia = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const diaNum = date.toLocaleDateString('es-ES', { day: '2-digit' });
  const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${diaNum} - ${hora}`;
};

const CalendarioSemana = () => {
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [loadingWeeklyList, setLoadingWeeklyList] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setWeeklyEvents([]);
      setLoadingWeeklyList(false);
      return;
    }
    setLoadingWeeklyList(true);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'eventos'),
      where('userId', '==', user.uid),
      where('fechaHora', '>=', startOfWeek),
      where('fechaHora', '<=', endOfWeek),
      orderBy('fechaHora', 'asc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedWeeklyEvents = [];
      querySnapshot.forEach((doc) => {
        fetchedWeeklyEvents.push({ id: doc.id, ...doc.data() });
      });
      setWeeklyEvents(fetchedWeeklyEvents);
      setLoadingWeeklyList(false);
    }, (error) => {
      console.error("Error en lista semanal: ", error);
      setLoadingWeeklyList(false);
    });
    return () => unsubscribe();
  }, [user]);

  const renderWeeklyItem = ({ item }) => (
    <TouchableOpacity style={styles.weeklyCard}>
      <View style={[styles.weeklyTag, { backgroundColor: getColorForType(item.tipo) }]}>
        <Text style={styles.weeklyTagText}>{item.tipo}</Text>
      </View>
      <Text style={styles.weeklyTitle} numberOfLines={1}>{item.titulo}</Text>
      <Text style={styles.weeklyDate}>
        {formatWeeklyDate(item.fechaHora.toDate())}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={styles.estaSemanaTitle}>Esta Semana</Text>
      {loadingWeeklyList ? (
        <ActivityIndicator color="#007bff" />
      ) : (
        <FlatList
          data={weeklyEvents}
          renderItem={renderWeeklyItem}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weeklyListContent}
          ListEmptyComponent={
            <Text style={styles.emptyWeeklyText}>No hay eventos esta semana.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  estaSemanaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weeklyListContent: {
    paddingLeft: 5, 
  },
  weeklyCard: {
    backgroundColor: '#f8f9fa', 
    borderRadius: 10,
    padding: 12,
    marginRight: 10, 
    width: 150,
    borderWidth: 1,
    borderColor: '#eee'
  },
  weeklyTag: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  weeklyTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weeklyDate: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyWeeklyText: {
    paddingHorizontal: 20,
    color: '#999',
  },
});

export default CalendarioSemana;