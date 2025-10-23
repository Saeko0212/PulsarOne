import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
// Asegúrate de importar tus configuraciones de Firebase
import { auth, db } from '../database/firebaseconfig.js'; // <-- ¡IMPORTANTE! Ajusta esta ruta
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const LoginFormulario = ({ onSuccessfulRegister }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [edad, setEdad] = useState('');
  const [altura, setAltura] = useState('');

  // Función para manejar el registro
  const handleSignUpAndLink = async () => {
    if (!nombre || !email || !password || !edad || !altura) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
         Alert.alert('Error', 'No se ha encontrado un usuario invitado.');
         return;
      }

      // 1. Crear la credencial de Email/Password
      const credential = EmailAuthProvider.credential(email, password);

      // 2. Vincular la credencial a la cuenta anónima actual
      const userCredential = await linkWithCredential(currentUser, credential);
      const user = userCredential.user; // Este usuario ya NO es anónimo

      console.log('¡Cuenta anónima vinculada exitosamente!', user.uid);

      // 3. Guardar la información adicional en Firestore (en "PerfilDatos")
      // Usamos el MISMO UID que ya tenía el usuario anónimo
      await setDoc(doc(db, "PerfilDatos", user.uid), {
        uid: user.uid,
        nombre: nombre,
        email: email.toLowerCase(),
        edad: parseInt(edad, 10), // Guardar como número
        altura: parseInt(altura, 10), // Guardar como número
        fechaCreacion: new Date(),
      });

      Alert.alert('¡Éxito!', 'Usuario registrado correctamente.');
      if (onSuccessfulRegister) {
        onSuccessfulRegister(); // Llama a la función para cerrar el modal
      }
      
    } catch (error) {
      console.error("Error en el registro: ", error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

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
        placeholder="Tu contraseña segura"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Oculta la contraseña
      />

      {/* Fila para Edad y Altura */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Edad</Text>
          <TextInput
            style={styles.input}
            placeholder="28"
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="175"
            value={altura}
            onChangeText={setAltura}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Botones */}
      <TouchableOpacity style={styles.buttonGreen} onPress={handleSignUpAndLink}>
        <Text style={styles.buttonTextWhite}>Guardar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonWhite} onPress={onSuccessfulRegister}>
        <Text style={styles.buttonTextBlack}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Estilos inspirados en tu imagen
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
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
    backgroundColor: '#f4f4f5', // Gris claro como en tu imagen
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginHorizontal: 5, // Pequeño espacio entre columnas
  },
  buttonGreen: {
    backgroundColor: '#28a745', // Verde de tu imagen
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
    borderColor: '#dcdcdc', // Borde gris claro
  },
  buttonTextBlack: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginFormulario;