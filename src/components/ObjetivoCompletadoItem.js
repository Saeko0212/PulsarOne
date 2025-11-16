import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const getTagColors = (categoria) => {
  switch (categoria) {
    case 'Frecuencia':
      return { bg: '#F3E8FF', text: '#A855F7' }; 
    case 'Peso':
      return { bg: '#eef6ff', text: '#3b82f6' };
    default:
      return { bg: '#eef6ff', text: '#3b82f6' };
  }
};

const ObjetivoCompletadoItem = ({ item }) => {
  const tagColors = getTagColors(item.categoria);

  return (
    <View style={[styles.objetivoCard, styles.completadoCard]}>
      <View style={styles.cardHeader}>
        <FontAwesome name="trophy" size={24} color="#10b981" />
        
        {}
        <View style={[styles.cardTag, styles.completadoTag, { borderColor: tagColors.text }]}>
          <Text style={[styles.cardTagText, { color: tagColors.text }]}>
            {item.categoria}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.cardTitle, { marginTop: 10 }]}>{item.titulo}</Text>
      {item.descripcion && (
         <Text style={styles.cardDescription}>{item.descripcion}</Text>
      )}
      <View style={styles.completadoCheck}>
        <FontAwesome name="check-circle" size={16} color="#10b981" />
        <Text style={styles.completadoCheckText}>
          {item.objetivoValor} {item.unidad} alcanzados
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
  completadoCard: {
    backgroundColor: '#e6f7eb',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  completadoTag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
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
  cardDescription: {
    fontSize: 14,
    color: '#333',
    marginVertical: 10,
  },
  completadoCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#b4e3c9',
  },
  completadoCheckText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ObjetivoCompletadoItem;