import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import React from 'react'

const Inicio = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        
        {/* --- SECCIÓN DE BIENVENIDA --- */}
        <View style={styles.welcomeContainer}>
          
          {/* Contenedor para los textos */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>¡Bienvenido de vuelta!</Text>
            <Text style={styles.subtitle}>Aquí está tu resumen de fitness de hoy</Text>
          </View>

          {/* Círculo gris (placeholder de perfil) */}
          <View style={styles.profilePlaceholder} />

        </View>
        {/* --- FIN DE SECCIÓN --- */}

        {/* <Text>PulsarOne - Contenido de Inicio</Text> */} 
        {/* (Comentamos el texto anterior) */}
        
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
    // Quitamos justifyContent y alignItems para alinear arriba
    padding: 20,
  },
  // --- Estilos para la bienvenida ---
  welcomeContainer: {
    flexDirection: 'row', // Pone los textos y el círculo uno al lado del otro
    justifyContent: 'space-between', // Empuja el texto a la izq. y el círculo a la der.
    alignItems: 'center', // Los centra verticalmente
    marginBottom: 24, // Espacio antes del siguiente elemento (las tarjetas)
  },
  textContainer: {
    flex: 1, // Permite que el texto ocupe el espacio y se ajuste
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Color negro
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666', // Color gris oscuro
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30, // La mitad del ancho/alto para hacerlo un círculo
    backgroundColor: '#E0E0E0', // Color gris claro
    marginLeft: 16, // Espacio para que el texto no se pegue si es muy largo
  },
});
export default Inicio