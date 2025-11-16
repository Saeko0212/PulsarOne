import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimerDescanso = ({ tiempo, configurado, isActivo, terminado, onAjustar, onIniciar, onReiniciar }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Timer de Descanso</Text>
      <Text style={[styles.timerText, isActivo && styles.timerActivo, terminado && styles.timerTerminado]}>
        {tiempo}
      </Text>
      
      {terminado && <Text style={styles.terminadoText}>¡Descanso terminado!</Text>}

      {}
      <View style={styles.controles}>
        <TouchableOpacity style={styles.btnAjuste} onPress={() => onAjustar(-15)}>
          <Ionicons name="remove" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.tiempoConfigurado}>{configurado}s</Text>
        <TouchableOpacity style={styles.btnAjuste} onPress={() => onAjustar(15)}>
          <Ionicons name="add" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {}
      {!isActivo ? (
        <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={onIniciar}>
          <Text style={styles.btnText}>Iniciar Descanso</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={onReiniciar}>
          <Text style={styles.btnText}>Detener</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.btn, styles.btnReiniciar]} onPress={onReiniciar}>
        <Ionicons name="refresh" size={16} color="#555" />
        <Text style={styles.btnTextReiniciar}>Reiniciar Descanso</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#AAA',
    marginVertical: 5,
  },
  timerActivo: {
    color: '#28A745',
  },
  timerTerminado: {
    color: '#E74C3C',
  },
  terminadoText: {
    color: '#28A745',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  btnAjuste: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiempoConfigurado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 30,
    width: 60,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnStart: {
    backgroundColor: '#28A745',
    marginBottom: 10,
  },
  btnStop: {
    backgroundColor: '#E74C3C',
    marginBottom: 10,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnReiniciar: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  btnTextReiniciar: {
    color: '#555',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default TimerDescanso;