import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../database/firebaseconfig.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ onSuccessfulLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, introduce tu email y contraseña.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El login fue exitoso, el listener en Perfil.js lo detectará.
      if (onSuccessfulLogin) {
        onSuccessfulLogin(); // Cierra el modal
      }
    } catch (error) {
      console.error("Error en el inicio de sesión: ", error);
      Alert.alert('Error', 'Email o contraseña incorrectos.');
    }
  };

  return (
    <View>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
            style={styles.input}
            placeholder="usuario@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
            style={styles.input}
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />

        <TouchableOpacity style={styles.buttonGreen} onPress={handleLogin}>
            <Text style={styles.buttonTextWhite}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonWhite} onPress={onCancel}>
            <Text style={styles.buttonTextBlack}>Cancelar</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    buttonGreen: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonTextWhite: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonWhite: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dcdcdc',
    },
    buttonTextBlack: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;