import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, SafeAreaView, TextInput, 
  FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { Ionicons } from '@expo/vector-icons';

const SelectorRutina = ({ isVisible, onClose, onSelect }) => {
  const [rutinas, setRutinas] = useState([]);
  const [filteredRutinas, setFilteredRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isVisible) {
      cargarRutinas();
    }
  }, [isVisible]);

  const cargarRutinas = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    try {
      const q = query(collection(db, "rutinas"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRutinas(lista);
      setFilteredRutinas(lista);
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resultado = rutinas.filter(r => 
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFilteredRutinas(resultado);
  }, [busqueda, rutinas]);

  const handleSelect = (rutina) => {
    onSelect(rutina);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
      <Text style={styles.itemNombre}>{item.nombre}</Text>
      <Text style={styles.itemTipo}>{item.dificultad} • {item.ejercicios?.length || 0} ejercicios</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Rutina</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Buscar en tus rutinas..."
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#28A745" />
        ) : (
          <FlatList
            data={filteredRutinas}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron rutinas.</Text>}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  title: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, margin: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE' },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, height: 50 },
  itemContainer: { backgroundColor: '#FFF', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 8 },
  itemNombre: { fontSize: 16, fontWeight: 'bold' },
  itemTipo: { fontSize: 12, color: '#777', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
});

export default SelectorRutina;