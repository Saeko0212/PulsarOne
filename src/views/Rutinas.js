import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';
import FormularioRutinas from './FormularioRutinas';

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setRutinas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "rutinas"), where("userId", "==", userId));
    const unsubscribeSnap = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRutinas(lista);
      setLoading(false);
    }, (error) => {
      console.error("Error rutinas:", error);
      setLoading(false);
    });

    return () => unsubscribeSnap();
  }, [userId]);

  const confirmarBorrado = (id) => {
    Alert.alert(
      "Eliminar Rutina",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "rutinas", id));
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar la rutina");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const numEjercicios = item.ejercicios ? item.ejercicios.length : 0;

    return (
      <View style={styles.card}>
        
        {}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.dificultad}</Text>
          </View>
        </View>

        {}
        <Text style={styles.cardDescription}>
          {item.descripcion || "Sin descripción disponible."}
        </Text>

        {}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{item.duracion}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="barbell-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{numEjercicios} ejercicios</Text>
          </View>
        </View>

        {}
        {numEjercicios > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Ejercicios incluidos:</Text>
            {item.ejercicios.slice(0, 5).map((ej, index) => (
              <Text key={index} style={styles.previewItem}>
                • {ej.nombre} <Text style={styles.seriesText}>- {ej.seriesReps || 'Sin especificar'}</Text>
              </Text>
            ))}
            {numEjercicios > 5 && (
              <Text style={styles.moreText}>... y {numEjercicios - 5} más</Text>
            )}
          </View>
        )}

        {}
        <View style={styles.actionRow}>
          {}
          <TouchableOpacity style={styles.btnStart}>
            <Ionicons name="play" size={18} color="#FFF" style={{marginRight: 5}} />
            <Text style={styles.btnStartText}>Comenzar</Text>
          </TouchableOpacity>

          {}
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={20} color="#555" />
          </TouchableOpacity>

          {}
          <TouchableOpacity 
            style={[styles.iconButton, { borderColor: '#FADBD8' }]} 
            onPress={() => confirmarBorrado(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.mainHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.mainTitle}>Rutinas de</Text>
          <Text style={styles.mainTitle}>Entrenamiento</Text>
          <Text style={styles.mainSubtitle}>Planes estructurados para alcanzar tus objetivos de fitness</Text>
        </View>
        <TouchableOpacity style={styles.btnNew} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFF" style={{marginRight: 5}} />
          <Text style={styles.btnNewText}>Nueva Rutina</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#28A745" style={{marginTop: 50}} />}

      {!loading && (
        <FlatList
          data={rutinas}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {userId ? "No tienes rutinas creadas." : "Inicia sesión para ver tus rutinas."}
            </Text>
          }
        />
      )}

      <FormularioRutinas 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 10 }, // Fondo blanco como el diseño
  
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25, marginTop: 10 },
  mainTitle: { fontSize: 22, fontWeight: '800', color: '#002', lineHeight: 28 },
  mainSubtitle: { fontSize: 12, color: '#666', marginTop: 5, width: '90%' },
  btnNew: { flexDirection: 'row', backgroundColor: '#28A745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnNewText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#F9A825', fontWeight: 'bold', fontSize: 11 },

  cardDescription: { fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 18 },

  metaRow: { flexDirection: 'row', marginBottom: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  metaText: { fontSize: 12, color: '#888', marginLeft: 5 },

  previewContainer: { marginBottom: 15 },
  previewTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  previewItem: { fontSize: 12, color: '#555', marginBottom: 3 },
  seriesText: { color: '#999' },
  moreText: { fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 2 },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, 
  btnStart: { 
    flex: 1, 
    backgroundColor: '#28A745', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderRadius: 8,
    marginRight: 10 
  },
  btnStartText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  iconButton: {
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#EEE', 
    borderRadius: 8,
    marginLeft: 5
  },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default Rutinas;