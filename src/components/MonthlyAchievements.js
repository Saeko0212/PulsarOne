import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogroItem = ({ color, texto }) => (
  <View style={styles.itemRow}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.itemText}>{texto}</Text>
  </View>
);

const MonthlyAchievements = ({ totalWorkouts, pesoCambio, totalHoras }) => {
  
  let pesoTexto = '0.0 kg de peso';
  
  if (pesoCambio > 0.05) { 
    pesoTexto = `${pesoCambio.toFixed(1)} kg de peso ganado`;
  } else if (pesoCambio < -0.05) { 
    pesoTexto = `${(pesoCambio * -1).toFixed(1)} kg de peso perdido`;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Logros del Mes</Text>
      
      <LogroItem 
        color="#28a745"
        texto={`${totalWorkouts} entrenamientos completados`}
      />
      <LogroItem 
        color="#007bff" 
        texto="4 récords personales superados"
      />
      <LogroItem 
        color="#a855f7" 
        texto={pesoTexto} 
      />
      <LogroItem 
        color="#f97316" 
        texto={`${totalHoras.toFixed(1)} horas de ejercicio total`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
  },
});

export default MonthlyAchievements;