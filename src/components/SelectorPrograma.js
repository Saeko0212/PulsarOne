import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectorPrograma = ({ programas, programaId, onSelect }) => {
  return <View style={styles.container}>
    <Text style={styles.label}>Selecciona Programa</Text>
    <View style={styles.pickerContainer}>
      <Picker 
        selectedValue={programaId} 
        onValueChange={onSelect} 
        style={styles.picker}
      >
        <Picker.Item label="Seleccionar Programa..." value={undefined} color="#999" />
        {programas.map((p) => <Picker.Item key={p.id} label={p.nombre} value={p.id} />)}
      </Picker>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  }
});

export default SelectorPrograma;