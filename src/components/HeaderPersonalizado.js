import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native'; // Importa SafeAreaView

const HeaderPersonalizado = () => {
  return (
    // Envuelve el contenido del encabezado en un SafeAreaView
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.headerContent}>
        {/* Aquí es donde irá el ícono de menú hamburguesa más adelante.
          Dejamos el espacio por ahora. 
        */}

        {/* El logo de tu app */}
        <Image
          // ¡IMPORTANTE! Debes cambiar esta ruta por la ubicación real de tu logo.
          source={require('../Image/Logo.png')} 
          style={styles.logo}
        />
        
        {/* Título (con dos estilos) */}
        <Text style={styles.titleBase}>
          <Text style={styles.titlePulsar}>Pulsar</Text>
          <Text style={styles.titleOne}>One</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: '#FFFFFF', // El fondo blanco para toda el área del encabezado, incluyendo la zona segura
  },
  headerContent: { // Nuevo estilo para el contenido interno del encabezado
    flexDirection: 'row',     // Alinear hijos horizontalmente
    alignItems: 'center',
    justifyContent: 'center',    // Alinear hijos verticalmente en el centro
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,   // Espacio a los lados
    paddingVertical: 20,     // Espacio arriba y abajo
    borderBottomWidth: 2,    // Línea divisoria inferior
    borderBottomColor: '#E0E0E0', // Color gris claro para la línea
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: 'contain', // Asegura que el logo se escale bien
    marginRight: 20,       // Espacio entre el logo y el texto
    // Cuando agregues el ícono de hamburguesa, 
    // podrías querer cambiar esto a 'marginLeft: 10'
  },
  titleBase: {
    fontSize: 30, // Tamaño de fuente base
  },
  titlePulsar: {
    color: '#008000', // Un color verde (ajusta al de tu logo)
    fontWeight: '400', // Peso regular
  },
  titleOne: {
    color: '#008000', // Mismo color verde
    fontWeight: '700', // Peso "bold" (negrita)
  },
});

export default HeaderPersonalizado;