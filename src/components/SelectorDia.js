import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectorDia = ({ dias, diaSeleccionado, onSelect }) => {
  return <View style={styles.container}>
    <Text style={styles.label}>Selecciona Día</Text>
    <View style={styles.pickerContainer}>
      <Picker 
        selectedValue={diaSeleccionado} 
        onValueChange={onSelect} 
        style={styles.picker}
      >
        <Picker.Item label="Selecciona el día a entrenar..." value={undefined} color="#999" />
        {dias.map((nombreDia) => (
          <Picker.Item key={nombreDia} label={nombreDia} value={nombreDia} />
        ))}
      </Picker>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 14, color: '#888', marginBottom: 5, marginLeft: 5 },
  pickerContainer: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
    justifyContent: 'center'
  },
  picker: {
    height: 50,
    width: '100%',
  }
});

export default SelectorDia;