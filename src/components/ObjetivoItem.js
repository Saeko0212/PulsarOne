import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; 
import { FontAwesome } from '@expo/vector-icons';

const getTagColors = (categoria) => {
  switch (categoria) {
    case 'Frecuencia':
      return { bg: '#F3E8FF', text: '#A855F7' }; 
    case 'Peso':
      return { bg: '#eef6ff', text: '#3b82f6' }; 
    case 'Fuerza':
      return { bg: '#ffe4e6', text: '#e11d48' }; 
    default:
      return { bg: '#eef6ff', text: '#3b82f6' }; 
  }
};

const ProgressBar = ({ progress }) => {
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${clampedProgress}%` }]} />
    </View>
  );
};

const ObjetivoItem = ({ item, latestWeight, trainingDaysCount, onFinalizar }) => {
  let progressText = 'N/A';
  let percentage = 0;
  const target = item.objetivoValor;
  
  if (item.categoria === 'Peso' && latestWeight !== null && item.pesoInicial) {
    const start = item.pesoInicial;
    const current = latestWeight;
    let progress = 0;
    if (item.tipoMeta === 'perder') {
      progress = start - current;
    } else if (item.tipoMeta === 'ganar') {
      progress = current - start;
    }
    progress = Math.max(0, Math.min(progress, target));
    percentage = (progress / target) * 100;
    progressText = `${progress.toFixed(1)} / ${target} ${item.unidad}`;

  } else if (item.categoria === 'Frecuencia') {
    const diasEntrenados = trainingDaysCount || 0;
    
    const progress = Math.max(0, Math.min(diasEntrenados, target));
    percentage = (progress / target) * 100;
    
    const unidad = item.unidad || 'días'; 
    progressText = `${diasEntrenados} / ${target} ${unidad}`;
  } else {
    progressText = `${item.progresoActual || 0} / ${target} ${item.unidad}`;
    percentage = (item.progresoActual / target) * 100;
  }

  const tagColors = getTagColors(item.categoria);
  const isCompleted = percentage >= 100; 

  return (
    <View style={[styles.objetivoCard, isCompleted && styles.cardCompletedBorder]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        
        <View style={[styles.cardTag, { backgroundColor: tagColors.bg }]}>
          <Text style={[styles.cardTagText, { color: tagColors.text }]}>
            {item.categoria}
          </Text>
        </View>
      </View>
      
      {}
      {isCompleted ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>¡Meta Alcanzada! 🎉</Text>
          <TouchableOpacity style={styles.finishButton} onPress={() => onFinalizar(item)}>
            <Text style={styles.finishButtonText}>Guardar en Historial</Text>
            <FontAwesome name="check" size={16} color="#fff" style={{marginLeft: 5}} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressText}>{progressText}</Text>
          <ProgressBar progress={percentage} />
          <Text style={styles.progressPercent}>{percentage.toFixed(0)}% completado</Text>
        </>
      )}
      
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
  cardCompletedBorder: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cardTagText: {
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