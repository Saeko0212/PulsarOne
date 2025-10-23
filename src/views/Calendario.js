import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons'; // Necesitarás íconos
import { db, auth } from '../database/firebaseconfig'; // <-- Importa tu config
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// --- Configuración de idioma para el calendario ---
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

const Calendario = () => {
  const [selected, setSelected] = useState('2025-10-21');
  const [allEvents, setAllEvents] = useState([]); 
  const [markedDates, setMarkedDates] = useState({}); 

  useEffect(() => {
    loadEventsFromFirebase();
  }, []); 

  const loadEventsFromFirebase = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No hay usuario logueado");
      return;
    }

    const eventsRef = collection(db, "eventos");
    const q = query(eventsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);

    let loadedEvents = [];
    let newMarkedDates = {};

    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      const eventId = doc.id;

      loadedEvents.push({ id: eventId, ...eventData });

      const dotColor = eventData.tipo === 'Cardio' ? '#10b981' : '#8b5cf6';
      newMarkedDates[eventData.fecha] = { 
        marked: true, 
        dotColor: dotColor 
      };
    });

    setAllEvents(loadedEvents);
    setMarkedDates(newMarkedDates);
  };

  const onDayPress = (day) => {
    setSelected(day.dateString);
    // AQUÍ: En el futuro, llamarías a Firebase para cargar los eventos de ESE día.
  };

  // Función para combinar los puntos marcados con el día seleccionado
  const getMarkedDates = () => {
    return {
      ...markedDates, // <-- USA EL ESTADO, NO DUMMY_MARKED_DATES
      [selected]: {
        selected: true,
        selectedColor: '#E6F9F1', // Un fondo verde claro para el seleccionado
        selectedTextColor: '#000',
        // Mantenemos el punto si ese día también tiene evento
        marked: markedDates[selected]?.marked,     // <-- USA EL ESTADO
        dotColor: markedDates[selected]?.dotColor, // <-- USA EL ESTADO
      }
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Usamos ScrollView para que toda la pantalla sea deslizable */}
      <ScrollView style={styles.body}>
        
        {/* --- 1. SECCIÓN DE TÍTULO --- */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Calendario de Entrenamientos</Text>
          <Text style={styles.subtitle}>Planifica y organiza tus sesiones</Text>
        </View>
        
        {/* --- 2. SECCIÓN "ESTA SEMANA" (Basada en tu imagen) --- */}
        <Text style={styles.sectionTitle}>Esta Semana</Text>
        <View style={styles.estaSemanaContainer}>
          {/* Card 1: Push Day */}
          <View style={[styles.cardSmallBase, { backgroundColor: '#F3E8FF' }]}>
            <View style={[styles.tagBase, { backgroundColor: '#8b5cf6' }]}><Text style={styles.tagText}>Entrenamiento</Text></View>
            <Text style={styles.cardTitleSmall}>Push Day</Text>
            <Text style={styles.cardSubtitle}>dom 19 - 9:00</Text>
          </View>
          {/* Card 2: Cardio HIIT */}
          <View style={[styles.cardSmallBase, { backgroundColor: '#D1FAE5' }]}>
            <View style={[styles.tagBase, { backgroundColor: '#10b981' }]}><Text style={styles.tagText}>Cardio</Text></View>
            <Text style={styles.cardTitleSmall}>Cardio HIIT</Text>
            <Text style={styles.cardSubtitle}>lun 20 - 18:00</Text>
          </View>
        </View>

        {/* --- 3. EL CALENDARIO --- */}
        <View style={styles.calendarContainer}>
          <Calendar
            // Especificamos el mes actual para el ejemplo
            current={'2025-10-01'}
            // Estilo del calendario
            style={styles.calendar}
            // Marcamos los días
            markedDates={getMarkedDates()}
            // Acción al presionar un día
            onDayPress={onDayPress}
            // Tema para que coincida con tu diseño
            theme={calendarTheme}
          />
        </View>

        {/* --- 4. SECCIÓN "EVENTOS DEL DÍA" (Basada en tu imagen) --- */}
        <View style={styles.dayEventsHeader}>
          <Text style={styles.sectionTitle}>21 de Octubre</Text>
          <TouchableOpacity style={styles.addButton}>
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Card 3: Evento del día */}
        <View style={styles.cardLarge}>
          <View style={[styles.tagBase, { backgroundColor: '#10b981', alignSelf: 'flex-start' }]}>
            <Text style={styles.tagText}>Cardio</Text>
          </View>
          <Text style={styles.cardTitleLarge}>Cardio HIIT</Text>
          <Text style={styles.cardSubtitle}>Sesion de cardio intenso</Text>
          <View style={styles.divider} />
          <View style={styles.cardFooter}>
            <Text style={styles.cardSubtitle}>18:00 . 30 min</Text>
            <View style={styles.iconContainer}>
              <FontAwesome name="pencil" size={20} color="#666" style={{marginRight: 15}} />
              <FontAwesome name="trash" size={20} color="#E53E3E" />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1, padding: 20 },
  titleContainer: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 12 },
  
  // Estilos "Esta Semana"
  estaSemanaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardSmallBase: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4, // Pequeño espacio entre tarjetas
  },
  tagBase: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  cardTitleSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },

  // Estilos Calendario
  calendarContainer: {
    backgroundColor: '#FAFAFA', // Fondo gris claro
    borderRadius: 16,
    padding: 10,
    marginBottom: 24,
  },
  calendar: {
    backgroundColor: 'transparent',
  },

  // Estilos "Eventos del Día"
  dayEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#10b981', // Verde
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLarge: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40, // Espacio al final del scroll
  },
  cardTitleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
  },
});

// --- TEMA PARA EL CALENDARIO ---
const calendarTheme = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: '#E6F9F1',
  selectedDayTextColor: '#000000',
  todayTextColor: '#10b981',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  arrowColor: '#10b981', // Color de flechas
  monthTextColor: '#000',
  indicatorColor: 'blue',
  textDayFontWeight: '500',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: 'bold',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};

export default Calendario;