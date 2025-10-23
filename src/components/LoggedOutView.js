import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Importa los modals que crearemos
import RegistroModal from './RegistroModal';
import LoginModal from './LoginModal';

const LoggedOutView = () => {
  const [registroModalVisible, setRegistroModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.subtitle}>
        Regístrate para guardar tu progreso o inicia sesión si ya tienes cuenta.
      </Text>

      {/* Botón de Registrarse (Verde) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonGreen]}
        onPress={() => setRegistroModalVisible(true)}
      >
        <Text style={styles.buttonTextWhite}>Registrarse</Text>
      </TouchableOpacity>

      {/* Botón de Iniciar Sesión (Blanco) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonWhite]}
        onPress={() => setLoginModalVisible(true)}
      >
        <Text style={styles.buttonTextBlack}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* --- Modals --- */}
      <RegistroModal
        visible={registroModalVisible}
        onClose={() => setRegistroModalVisible(false)}
      />

      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
      />
    </View>
  );
};

// Estilos para los botones
const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30 },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonGreen: { backgroundColor: '#28a745' },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  buttonWhite: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dcdcdc' },
  buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default LoggedOutView;