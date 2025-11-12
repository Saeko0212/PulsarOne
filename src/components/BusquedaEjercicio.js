import React from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BusquedaEjercicio = ({ valorBusqueda, setValorBusqueda, categoriaSeleccionada, setCategoriaSeleccionada }) => {
  
  const categorias = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar ejercicios por nombre o músculo..."
          value={valorBusqueda}
          onChangeText={setValorBusqueda}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity 
            style={[styles.chip, categoriaSeleccionada === 'Favoritos' && styles.chipActive]}
            onPress={() => setCategoriaSeleccionada('Favoritos')}
        >
            <Ionicons name="heart-outline" size={16} color={categoriaSeleccionada === 'Favoritos' ? '#FFF' : '#333'} />
            <Text style={[styles.chipText, categoriaSeleccionada === 'Favoritos' && styles.chipTextActive, {marginLeft: 5}]}>
                Favoritos
            </Text>
        </TouchableOpacity>

        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, categoriaSeleccionada === cat && styles.chipActive]}
            onPress={() => setCategoriaSeleccionada(cat)}
          >
            <Text style={[styles.chipText, categoriaSeleccionada === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{width: 20}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  chipActive: {
    backgroundColor: '#28A745', 
    borderColor: '#28A745',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FFF',
  },
});

export default BusquedaEjercicio;