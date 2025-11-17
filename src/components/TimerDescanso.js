import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimerDescanso = ({ 
  tiempoFormateado, 
  isActivo, 
  terminado, 
  onIniciar, 
  onReiniciar 
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Temporizador de Descanso</Text>

      {}
      <View style={styles.timerCircle}>
        <Text style={[styles.timerText, terminado && styles.timerTerminado]}>
          {tiempoFormateado}
        </Text>
      </View>
      
      {terminado && <Text style={styles.terminadoText}>¡Descanso terminado!</Text>}

      {}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnStart]} 
          onPress={onIniciar}
          disabled={isActivo} 
        >
          <Text style={styles.btnStartText}>Iniciar Descanso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, styles.btnReiniciar]} 
          onPress={onReiniciar}
        >
          <Ionicons name="refresh" size={16} color="#555" />
          <Text style={styles.btnReiniciarText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginTop: 20,
  },
  title: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 15,
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderWidth: 1,
    borderColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#28A745',
  },
  timerTerminado: {
    color: '#E74C3C', 
  },
  terminadoText: {
    color: '#28A745',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnStart: {
    backgroundColor: '#28A745',
    flex: 0.6, 
  },
  btnStartText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  btnReiniciar: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    flex: 0.35, 
  },
  btnTextReiniciar: {
    color: '#555',
    fontWeight: 'bold',
    marginLeft: 5,
  }
});

export default TimerDescanso;