import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import CalendarioSemana from '../components/CalendarioSemana';
import CalendarioDia from '../components/CalendarioDia';

import { db, auth } from '../database/firebaseconfig.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

const TIPO_COLORES = {
  'Entrenamiento': '#007bff',
  'Cardio': '#28a745',
  'Yoga': '#6f42c1',
  'Natación': '#17a2b8',
  'Deporte': '#fd7e14',
  'Otro': '#6c757d',
  'default': '#6c757d',
};

const getColorForType = (tipo) => {
  return TIPO_COLORES[tipo] || TIPO_COLORES.default;
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const Calendario = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [monthDots, setMonthDots] = useState({});
  const [loadingDots, setLoadingDots] = useState(true);
  
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setMonthDots({});
      setLoadingDots(false);
      return;
    }
    setLoadingDots(true);
    const startOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const endOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);

    const q = query(
      collection(db, 'eventos'),
      where('userId', '==', user.uid),
      where('fechaHora', '>=', startOfMonth),
      where('fechaHora', '<=', endOfMonth)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newDots = {};
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const eventDate = event.fechaHora.toDate();
        const year = eventDate.getFullYear();
        const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
        const day = eventDate.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const dot = { color: getColorForType(event.tipo) };
        if (!newDots[dateString]) {
          newDots[dateString] = { dots: [dot] };
        } else if (!newDots[dateString].dots.find(d => d.color === dot.color)) {
          newDots[dateString].dots.push(dot);
        }
      });
      setMonthDots(newDots);
      setLoadingDots(false);
    }, (error) => {
        console.error("Error en puntos del mes: ", error);
        setLoadingDots(false);
    });
    return () => unsubscribe();
  }, [user, visibleMonth]);

  const markedDates = useMemo(() => {
    const marks = { ...monthDots };
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#007bff',
      disableTouchEvent: true,
    };
    return marks;
  }, [selectedDate, monthDots]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        
        {}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Calendario de Entrenamientos</Text>
          <Text style={styles.headerSubtitle}>Planifica y organiza tus sesiones</Text>
        </View>

        {}
        <View style={styles.cardContainer}>
          <CalendarioSemana />
        </View>

        {}
        <View style={[styles.cardContainer, {padding: 10}]}> 
          {}
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            onMonthChange={(month) => setVisibleMonth(new Date(month.timestamp))}
            markedDates={markedDates}
            markingType={'multi-dot'}
            monthFormat={'MMMM yyyy'}
            theme={{
              todayTextColor: '#007bff',
              arrowColor: '#007bff',
            }}
          />
        </View>

        {}
        <View style={styles.cardContainer}>
          <CalendarioDia selectedDate={selectedDate} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    padding: 15, 
  },
  headerContainer: {
    paddingHorizontal: 5, 
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 2,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default Calendario;