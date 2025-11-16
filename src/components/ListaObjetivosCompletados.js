import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ObjetivoCompletadoItem from './ObjetivoCompletadoItem';

const ListaObjetivosCompletados = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Historial Completados</Text>
      {data.map((item) => (
        <ObjetivoCompletadoItem key={item.id} item={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5, 
  },
});

export default ListaObjetivosCompletados;