import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ProgressBar = ({ progress, color }) => {
  const clampedProgress = Math.max(0, Math.min(progress, 100)); 
  return (
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${clampedProgress}%`, backgroundColor: color }]} />
    </View>
  );
};

const MonthlyGoals = ({
  progresoEntrenamientos, 
  metaEntrenamientos,     
  progresoPeso,          
  metaPeso,              
  activeWeightGoal,      
  onPressEntrenamientos  
}) => {

  let porcEntrenamientos = 0;
  if (metaEntrenamientos > 0) {
    porcEntrenamientos = (progresoEntrenamientos / metaEntrenamientos) * 100;
  }
  
  let porcPeso = 0;
  if (activeWeightGoal && metaPeso && progresoPeso) {
    const start = Number(activeWeightGoal.pesoInicial);
    const target = Number(metaPeso);
    const current = Number(progresoPeso);
    
    if (start !== target) {
      let progress = 0;
      if (start < target) { 
        progress = (current - start) / (target - start);
      } else { 
        progress = (start - current) / (start - target);
      }
      porcPeso = progress * 100;
    } else if (start === current) {
      porcPeso = 100; 
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Objetivos del Próximo Mes</Text>

      {}
      <TouchableOpacity onPress={onPressEntrenamientos} style={styles.row}>
        <Text style={styles.rowText}>
          Entrenamientos ({progresoEntrenamientos} / {metaEntrenamientos})
        </Text>
        <ProgressBar progress={porcEntrenamientos} color="#007bff" />
      </TouchableOpacity>

      {}
      <View style={styles.row}>
        <Text style={styles.rowText}>
          Peso objetivo ({progresoPeso ? progresoPeso.toFixed(1) : '--'} / {metaPeso ? metaPeso.toFixed(1) : '--'} kg)
        </Text>
        <ProgressBar progress={porcPeso} color="#28a745" />
      </View>

      {}
      <View style={styles.row}>
        <Text style={styles.rowText}>Fuerza +5% (3/4 ejercicios)</Text>
        <ProgressBar progress={75} color="#a855f7" />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  row: {
    marginBottom: 15,
  },
  rowText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default MonthlyGoals;