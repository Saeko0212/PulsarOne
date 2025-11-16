import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectorEjercicioActual = ({ ejercicios, ejercicioId, onSelect }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ejercicio Actual</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={ejercicioId}
          onValueChange={(itemValue) => onSelect(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar ejercicio..." value={null} color="#999" />
          {ejercicios.map((ej) => (
            <Picker.Item key={ej.id} label={ej.nombre} value={ej.id} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  }
});

export default SelectorEjercicioActual;