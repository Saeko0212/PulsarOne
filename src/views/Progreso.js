import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import React from 'react'

const Progreso = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text>Contenido de Progreso</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});

export default Progreso