// components/ObjetivoItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Componente de la barra de progreso
const ProgressBar = ({ progress }) => {
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${clampedProgress}%` }]} />
    </View>
  );
};

// Componente del item
const ObjetivoItem = ({ item, latestWeight }) => {
  let progress = 0;
  let progressText = 'N/A';
  let percentage = 0;
  const target = item.objetivoValor;

  if (item.categoria === 'Peso' && latestWeight !== null && item.pesoInicial) {
    const start = item.pesoInicial;
    const current = latestWeight;
    if (item.tipoMeta === 'perder') {
      progress = start - current;
    } else if (item.tipoMeta === 'ganar') {
      progress = current - start;
    }
    progress = Math.max(0, Math.min(progress, target));
    percentage = (progress / target) * 100;
    progressText = `${progress.toFixed(1)} / ${target} ${item.unidad}`;
  } else if (item.categoria !== 'Peso') {
    progressText = `${item.progresoActual} / ${target} ${item.unidad}`;
    percentage = (item.progresoActual / target) * 100;
  }

  return (
    <View style={styles.objetivoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <View style={styles.cardTag}>
          <Text style={styles.cardTagText}>{item.categoria}</Text>
        </View>
      </View>
      <Text style={styles.progressLabel}>Progreso</Text>
      <Text style={styles.progressText}>{progressText}</Text>
      <ProgressBar progress={percentage} />
      <Text style={styles.progressPercent}>{percentage.toFixed(0)}% completado</Text>
      <View style={styles.dateContainer}>
        <FontAwesome name="calendar-o" size={16} color="#555" />
        <Text style={styles.dateText}>Fecha Límite:</Text>
        <Text style={styles.dateValue}>
          {item.fechaLimite.toDate().toLocaleDateString('es-ES')}
        </Text>
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  objetivoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    flex: 1,
  },
  cardTag: {
    backgroundColor: '#eef6ff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cardTagText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default ObjetivoItem;