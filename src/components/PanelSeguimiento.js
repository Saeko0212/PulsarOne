import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PanelSeguimiento = ({ 
  ejercicioNombre, 
  serieActual,
  metaSeries
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>ENTRENAMIENTO EN CURSO</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>EJERCICIO ACTUAL</Text>
          <Text style={styles.ejercicioNombre}>{ejercicioNombre}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>SERIE</Text>
          <Text style={styles.badgeText}>{serieActual}/{metaSeries}</Text>
        </View>
      </View>

      {}
      <View style={styles.animationPlaceholder}>
        <Text style={styles.placeholderText}>[Animación de {ejercicioNombre} aquí]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden', 
  },
  header: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ejercicioNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  badgeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animationPlaceholder: {
    height: 200,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#AAA',
    fontStyle: 'italic',
  }
});

export default PanelSeguimiento;