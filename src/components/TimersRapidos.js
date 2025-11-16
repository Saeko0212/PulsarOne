import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TimersRapidos = ({ onStartRapido }) => {
  const tiempos = [
    { label: "Descanso corto", seg: 30 },
    { label: "Descanso medio", seg: 60 },
    { label: "Descanso largo", seg: 90 },
    { label: "Entre ejercicios", seg: 120 },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Timers Rápidos</Text>
      {tiempos.map((t) => (
        <TouchableOpacity key={t.seg} style={styles.btnRapido} onPress={() => onStartRapido(t.seg)}>
          <Text style={styles.btnLabel}>{t.label}</Text>
          <Text style={styles.btnSeg}>{t.seg}s</Text>
        </TouchableOpacity>
      ))}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  btnRapido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  btnLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  btnSeg: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  }
});

export default TimersRapidos;