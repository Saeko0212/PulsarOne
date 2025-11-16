import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PanelSeguimiento = ({ 
  ejercicioNombre, 
  progresoEjercicios, 
  progresoSeries,     
  metaSeries,         
  metaReps,           
  onSiguienteEjercicio 
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.labelProgreso}>{progresoEjercicios}</Text>
        <TouchableOpacity onPress={onSiguienteEjercicio}>
          <Text style={styles.btnSaltar}>Saltar Ejercicio ›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ejercicioTitle}>{ejercicioNombre}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SERIE ACTUAL</Text>
          <Text style={styles.statValue}>
            {progresoSeries} <Text style={styles.statTotal}>/ {metaSeries}</Text>
          </Text>
        </View>
        <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#EEE' }]}>
          <Text style={styles.statLabel}>REPS META</Text>
          <Text style={styles.statValue}>{metaReps}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#2196F3" style={{marginRight:5}} />
        <Text style={styles.infoText}>
          Al terminar la serie, presiona "Iniciar Descanso" abajo para registrarla.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E3F2FD' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  labelProgreso: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  btnSaltar: {
    color: '#999',
    fontSize: 12,
  },
  ejercicioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTotal: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'normal',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  infoText: {
    color: '#1565C0',
    fontSize: 12,
    flex: 1
  }
});

export default PanelSeguimiento;