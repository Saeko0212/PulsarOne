import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CronometroEntrenamiento = ({ tiempo, isActivo, onIniciar, onDetener }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tiempo de Entrenamiento</Text>
      <Text style={styles.timerText}>{tiempo}</Text>
      <View style={styles.botones}>
        {!isActivo ? (
          <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={onIniciar}>
            <Ionicons name="play" size={16} color="#FFF" />
            <Text style={styles.btnText}>Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={onDetener}>
            <Ionicons name="stop" size={16} color="#FFF" />
            <Text style={styles.btnText}>Detener</Text>
          </TouchableOpacity>
        )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#28A745',
    marginVertical: 10,
  },
  botones: {
    flexDirection: 'row',
  },
  btn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnStart: {
    backgroundColor: '#28A745',
  },
  btnStop: {
    backgroundColor: '#DC3545',
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default CronometroEntrenamiento;