import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, SafeAreaView, TextInput, 
  FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';

const SelectorEjercicios = ({ isVisible, onClose, onSelect }) => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filteredEjercicios, setFilteredEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isVisible) {
      cargarEjercicios();
      setBusqueda('');
    }
  }, [isVisible]);

  const cargarEjercicios = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "ejercicios"), 
        where("userId", "in", [user.uid, "admin"])
      );
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEjercicios(lista);
      setFilteredEjercicios(lista);
    } catch (error) {
      console.error("Error cargando selector:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (busqueda) {
      const resultado = ejercicios.filter(e => 
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.musculoPrincipal && e.musculoPrincipal.toLowerCase().includes(busqueda.toLowerCase()))
      );
      setFilteredEjercicios(resultado);
    } else {
      setFilteredEjercicios(ejercicios);
    }
  }, [busqueda, ejercicios]);

  const handleSelect = (ejercicio) => {
    onSelect(ejercicio);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
      <View>
        <Text style={styles.itemNombre}>{item.nombre}</Text>
        <Text style={styles.itemDetalle}>{item.musculoPrincipal} • {item.userId === 'admin' ? 'Oficial' : 'Mío'}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color="#28A745" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Ejercicio</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre o músculo..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor="#999"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#28A745" style={{marginTop: 20}} />
        ) : (
          <FlatList
            data={filteredEjercicios}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron ejercicios.</Text>}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    margin: 15, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    height: 50 
  },
  searchIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: '100%', 
    color: '#333' 
  },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  itemNombre: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemDetalle: { fontSize: 12, color: '#777', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999' },
});

export default SelectorEjercicios;