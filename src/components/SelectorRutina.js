import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SelectorRutina = ({ rutinas, rutinaId, onSelect }) => {
  const [busqueda, setBusqueda] = useState('');
  const [rutinasFiltradas, setRutinasFiltradas] = useState(rutinas);

  useEffect(() => {
    if (busqueda) {
      const filtradas = rutinas.filter(r => 
        r.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setRutinasFiltradas(filtradas);
    } else {
      setRutinasFiltradas(rutinas);
    }
  }, [busqueda, rutinas]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, rutinaId === item.id && styles.itemSeleccionado]} 
      onPress={() => onSelect(item.id)}
    >
      <View>
        <Text style={styles.itemNombre}>{item.nombre}</Text>
        <Text style={styles.itemDetalle}>{item.dificultad} • {item.ejercicios.length} ejercicios</Text>
      </View>
      {rutinaId === item.id && <Ionicons name="checkmark-circle" size={24} color="#28A745" />}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={rutinasFiltradas}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron rutinas.</Text>}
      style={styles.card}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Rutina de Hoy</Text>
          
          {}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Buscar rutina..."
              value={busqueda}
              onChangeText={setBusqueda}
              placeholderTextColor="#999"
            />
          </View>

          {}
          <TouchableOpacity 
            style={[styles.itemContainer, !rutinaId && styles.itemSeleccionado]} 
            onPress={() => onSelect(null)}
          >
            <Text style={styles.itemNombre}>Entrenamiento Libre</Text>
            {!rutinaId && <Ionicons name="checkmark-circle" size={24} color="#28A745" />}
          </TouchableOpacity>
        </>
      }
      scrollEnabled={false} 
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    height: 50,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#333' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemSeleccionado: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
  },
  itemNombre: { fontSize: 15, fontWeight: '600', color: '#333' },
  itemDetalle: { fontSize: 12, color: '#777', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', padding: 10 },
});

export default SelectorRutina;