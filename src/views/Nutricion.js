import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

import FormularioNutricion from '../components/FormularioNutricion';

const Nutricion = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrición</Text>
        {}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Resumen Diario</Text>
        {}
        <Text style={{color: 'gray', marginTop: 20}}>
            No hay comidas registradas hoy.
        </Text>
      </View>

      {}
      <FormularioNutricion 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
});

export default Nutricion;