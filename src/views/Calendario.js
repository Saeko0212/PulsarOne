import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons, Feather } from '@expo/vector-icons'; 

import FormularioEventos from '../components/FormularioEventos';
import FormularioEditarEvento from '../components/FormularioEditarEvento';
import BotonEliminarEvento from '../components/BotonEliminarEvento'; 
import { db, auth } from '../database/firebaseconfig';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';

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

const formatWeeklyDate = (date) => {
  if (!date) return '';
  const dia = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const diaNum = date.toLocaleDateString('es-ES', { day: '2-digit' });
  const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${diaNum} - ${hora}`;
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const Calendario = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [events, setEvents] = useState([]); 
  const [loadingDaily, setLoadingDaily] = useState(true);

  const [weeklyEvents, setWeeklyEvents] = useState([]); 
  const [loadingWeeklyList, setLoadingWeeklyList] = useState(true); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventoAEliminarId, setEventoAEliminarId] = useState(null);

  const [monthDots, setMonthDots] = useState({}); 
  const [loadingDots, setLoadingDots] = useState(true); 
  
  const [visibleMonth, setVisibleMonth] = useState(new Date()); 
  
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
    });

    return () => unsubscribe();
  }, [user]); 


  useEffect(() => {
    if (!user) {
      setMonthDots({});
      setLoadingDots(false);
      return;
    }
    setLoadingDots(true);

    const startOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0); // Día 0 del prox. mes
    endOfMonth.setHours(23, 59, 59, 999);

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
        const month = (eventDate.getMonth() + 1).toString().padStart(2, '0'); // Mes (0-11) + 1
        const day = eventDate.getDate().toString().padStart(2, '0'); // Día
        
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
    });

    return () => unsubscribe();
  }, [user, visibleMonth]); 
  
  useEffect(() => {
    setLoadingDaily(true);
    if (!user) {
      setEvents([]);
      setLoadingDaily(false);
      return;
    }

    const parts = selectedDate.split('-').map(Number); 
    
    const startOfDay = new Date(parts[0], parts[1] - 1, parts[2]); 
    startOfDay.setHours(0, 0, 0, 0); 

    const endOfDay = new Date(parts[0], parts[1] - 1, parts[2]);
    endOfDay.setHours(23, 59, 59, 999); 

    // Crea la consulta
    const q = query(
      collection(db, 'eventos'),
      where('userId', '==', user.uid),
      where('fechaHora', '>=', startOfDay),
      where('fechaHora', '<=', endOfDay),
      orderBy('fechaHora', 'asc') 
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEvents = [];
      querySnapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() });
      });
      setEvents(fetchedEvents);
      setLoadingDaily(false);
    }, (error) => {
      console.error("Error al obtener eventos diarios: ", error);
      setLoadingDaily(false);
    });

    return () => unsubscribe();
  }, [selectedDate, user]); 

  const getHeaderDate = () => {
    const date = new Date(selectedDate);
    date.setUTCHours(12);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  const handleAbrirEditarModal = (evento) => {
    setEventoSeleccionado(evento); 
    setEditModalVisible(true);  
  };

  const handleEliminarEvento = (eventoId) => {
    setEventoAEliminarId(eventoId); 
    setShowDeleteConfirm(true);    
  };

  const handleConfirmarEliminacion = async () => {
    if (!eventoAEliminarId) return;

    try {
      await deleteDoc(doc(db, 'eventos', eventoAEliminarId));
    } catch (error) {
      console.error('Error al eliminar: ', error);
      Alert.alert('Error', 'No se pudo eliminar el evento.'); 
    } finally {
      setShowDeleteConfirm(false);
      setEventoAEliminarId(null);
    }
  };

  
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



  const renderWeeklyItem = ({ item }) => (
    <TouchableOpacity style={styles.weeklyCard}>
      <View style={[
        styles.weeklyTag, 
        { backgroundColor: getColorForType(item.tipo) }
      ]}>
        <Text style={styles.weeklyTagText}>{item.tipo}</Text>
      </View>
      <Text style={styles.weeklyTitle} numberOfLines={1}>{item.titulo}</Text>
      <Text style={styles.weeklyDate}>
        {formatWeeklyDate(item.fechaHora.toDate())}
      </Text>
    </TouchableOpacity>
  );

 
  const renderEventItem = ({ item }) => {
    
    const eventTime = item.fechaHora.toDate().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const duration = item.duracion || 0;

    return (
      <View style={styles.eventCard}>
        {}
        <View style={[
          styles.tagContainer, 
          { backgroundColor: getColorForType(item.tipo) }
        ]}>
          <Text style={styles.tagText}>{item.tipo}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.titulo}</Text>
        <Text style={styles.eventDescription}>{item.descripcion}</Text>
        <View style={styles.eventFooter}>
          <Text style={styles.eventTime}>{`${eventTime} • ${duration} min`}</Text>
          <View style={styles.iconsContainer}>
            {}
            <TouchableOpacity onPress={() => handleAbrirEditarModal(item)}>
              <Feather name="edit-2" size={18} color="#555" style={styles.icon} />
            </TouchableOpacity>

            {}
            <TouchableOpacity onPress={() => handleEliminarEvento(item.id)}>
              <Feather name="trash-2" size={18} color="#E53935" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

 
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No hay eventos para esta fecha</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Calendario de Entrenamientos</Text>
        <Text style={styles.headerSubtitle}>Planifica y organiza tus sesiones</Text>
      </View>
      {}

      {}
      <View style={styles.weeklyContainer}>
        <Text style={styles.estaSemanaTitle}>Esta Semana</Text>
        {}
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

      {}
      <View style={styles.dayViewContainer}>
        {}
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{getHeaderDate()}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {}
        {loadingDaily ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {}
      <FormularioEventos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
    fechaSeleccionada={selectedDate}
      />

  {}
  <FormularioEditarEvento
    visible={editModalVisible}
    onClose={() => setEditModalVisible(false)}
    evento={eventoSeleccionado} 
  />

  {}
  <BotonEliminarEvento
    visible={showDeleteConfirm}
    onClose={() => {
      setShowDeleteConfirm(false);
      setEventoAEliminarId(null); 
    }}
    onConfirm={handleConfirmarEliminacion}
  />

    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  
  headerContainer: {
    paddingHorizontal: 20, 
    paddingTop: 10,        
    paddingBottom: 5,      
    backgroundColor: '#f8f9fa', 
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

 
  weeklyContainer: {
    paddingVertical: 10, 
    backgroundColor: '#f8f9fa', 
  },
  estaSemanaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  weeklyListContent: {
    paddingHorizontal: 15, 
  },
  weeklyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5, 
    width: 150, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  
  // --- Contenedor de la lista ---
  dayViewContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 0,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  dayHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  addButton: {
    backgroundColor: '#28a745', 
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
 
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 10,
  },

  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  tagContainer: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
});

export default Calendario;