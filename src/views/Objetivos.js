import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import FormularioObjetivos from '../components/FormularioObjetivos'; 
import { FontAwesome } from '@expo/vector-icons';

const ObjetivoItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{item.titulo}</Text>
    <Text style={styles.cardInfo}>Categoría: {item.categoria}</Text>
    <Text style={styles.cardInfo}>Objetivo: {item.objetivo} {item.unidad}</Text>
    <Text style={styles.cardInfo}>Progreso: {item.progresoActual} {item.unidad}</Text>
    <Text style={styles.cardInfo}>
      Fecha Límite: {item.fechaLimite.toDate().toLocaleDateString('es-ES')}
    </Text>
    {item.descripcion && (
      <Text style={styles.cardDescription}>Nota: {item.descripcion}</Text>
    )}
  </View>
);

const Objetivos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Referencia a la colección raíz 'Objetivos'
    const objRef = collection(db, "Objetivos");
    
    // Consulta para traer solo los objetivos del usuario actual (gracias a la regla y el 'userId')
    const q = query(
      objRef, 
      where("userId", "==", user.uid), 
      orderBy("fechaLimite", "asc") // Ordena por fecha límite
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaObjetivos = [];
      querySnapshot.forEach((doc) => {
        listaObjetivos.push({ id: doc.id, ...doc.data() });
      });
      setObjetivos(listaObjetivos);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar objetivos: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Mis Objetivos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!loading && objetivos.length === 0 && (
        <Text style={styles.emptyText}>Aún no tienes objetivos. ¡Crea uno!</Text>
      )}

      <FlatList
        data={objetivos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ObjetivoItem item={item} />}
        contentContainerStyle={styles.listContainer}
      />

      <FormularioObjetivos
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
  card: {
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default Objetivos;