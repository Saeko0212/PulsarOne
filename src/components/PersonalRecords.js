import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HeaderRow = () => (
  <View style={styles.row}>
    <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Ejercicio</Text>
    <Text style={[styles.cell, styles.headerText]}>RP Anterior</Text>
    <Text style={[styles.cell, styles.headerText]}>RP Actual</Text>
    <Text style={[styles.cell, styles.headerText]}>Mejora</Text>
    <Text style={[styles.cell, styles.headerText, { textAlign: 'right' }]}>Fecha</Text>
  </View>
);

const RecordRow = ({ exercise, prev, current, improvement, date }) => (
  <View style={styles.row}>
    <Text style={[styles.cell, styles.exerciseText, { flex: 2 }]}>{exercise}</Text>
    <Text style={[styles.cell, styles.dataText]}>{prev}</Text>
    <Text style={[styles.cell, styles.dataText, styles.currentText]}>{current}</Text>
    <View style={[styles.cell, { alignItems: 'center' }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{improvement}</Text>
      </View>
    </View>
    <Text style={[styles.cell, styles.dateText, { textAlign: 'right' }]}>{date}</Text>
  </View>
);

const PersonalRecords = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Récords Personales</Text>
      
      <HeaderRow />

      {}
      <RecordRow 
        exercise="Press de Banca"
        prev="80 kg"
        current="85 kg"
        improvement="+5 kg"
        date={"2\nNov\n2024"} 
      />
      <RecordRow 
        exercise="Sentadillas"
        prev="100 kg"
        current="110 kg"
        improvement="+10 kg"
        date={"28\nOct\n2024"}
      />
      <RecordRow 
        exercise="Peso Muerto"
        prev="120 kg"
        current="130 kg"
        improvement="+10 kg"
        date={"25\nOct\n2024"}
      />
      <RecordRow 
        exercise="Dominadas"
        prev="8 reps"
        current="12 reps"
        improvement="+4 reps"
        date={"20\nOct\n2024"}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cell: {
    flex: 1,
    fontSize: 12,
  },
  headerText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  exerciseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dataText: {
    color: '#555',
    textAlign: 'center',
  },
  currentText: {
    color: '#007bff', 
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#e6f7eb', 
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#10b981', 
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    lineHeight: 14, 
  },
});

export default PersonalRecords;