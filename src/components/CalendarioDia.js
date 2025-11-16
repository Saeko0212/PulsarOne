import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { db, auth } from '../database/firebaseconfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';

import FormularioEventos from './FormularioEventos';
import FormularioEditarEvento from './FormularioEditarEvento';
import BotonEliminarEvento from './BotonEliminarEvento';

const TIPO_COLORES = {
  'Entrenamiento': '#007bff', 'Cardio': '#28a745', 'Yoga': '#6f42c1',
  'Natación': '#17a2b8', 'Deporte': '#fd7e14', 'Otro': '#6c757d', 'default': '#6c757d',
};
const getColorForType = (tipo) => TIPO_COLORES[tipo] || TIPO_COLORES.default;

const CalendarioDia = ({ selectedDate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [eventoAEliminarId, setEventoAEliminarId] = useState(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

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

  // --- Funciones de Handlers (Acciones) ---
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

  const getHeaderDate = () => {
    const date = new Date(selectedDate);
    date.setUTCHours(12);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  };

  const renderEventItem = ({ item }) => {
    const eventTime = item.fechaHora.toDate().toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit'
    });
    const duration = item.duracion || 0;
    return (
      <View style={styles.eventCard}>
        <View style={[styles.tagContainer, { backgroundColor: getColorForType(item.tipo) }]}>
          <Text style={styles.tagText}>{item.tipo}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.titulo}</Text>
        <Text style={styles.eventDescription}>{item.descripcion}</Text>
        <View style={styles.eventFooter}>
          <Text style={styles.eventTime}>{`${eventTime} • ${duration} min`}</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity onPress={() => handleAbrirEditarModal(item)}>
              <Feather name="edit-2" size={18} color="#555" style={styles.icon} />
            </TouchableOpacity>
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
    <View>
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
          scrollEnabled={false} 
        />
      )}
      
      {}
      <FormularioEventos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        fechaSeleccionada={selectedDate}
      />
      <FormularioEditarEvento
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        evento={eventoSeleccionado}
      />
      <BotonEliminarEvento
        visible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setEventoAEliminarId(null);
        }}
        onConfirm={handleConfirmarEliminacion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#eee'
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

export default CalendarioDia;