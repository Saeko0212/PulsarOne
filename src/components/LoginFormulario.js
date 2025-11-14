import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js'; 
import {
  EmailAuthProvider,
  linkWithCredential,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const LoginFormulario = ({ onSuccessfulRegister }) => { 
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [edad, setEdad] = useState('');
  const [altura, setAltura] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleRegistro = async () => {
    if (!nombre || !email || !password || !edad || !altura) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }
    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.isAnonymous) {

        const credential = EmailAuthProvider.credential(email, password);

        const userCredential = await linkWithCredential(currentUser, credential);
        const user = userCredential.user;

        console.log("Cuenta anónima convertida exitosamente:", user.uid);

        await setDoc(doc(db, "PerfilDatos", user.uid), {
          nombre: nombre,
          email: email.toLowerCase(),
          edad: parseInt(edad, 10),
          altura: parseInt(altura, 10),
        }, { merge: true });

        await user.reload();
      } else {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "PerfilDatos", user.uid), {
          uid: user.uid,
          nombre: nombre,
          email: email.toLowerCase(),
          edad: parseInt(edad, 10),
          altura: parseInt(altura, 10),
          fechaCreacion: new Date()
        });
      }

      Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido registrada y tus datos guardados.');

      if (onSuccessfulRegister) {
        onSuccessfulRegister();
      }

    } catch (error) {
      setLoading(false); 
      console.error("Error en el registro: ", error);

      if (error.code === 'auth/credential-already-in-use') {
        Alert.alert('Error', 'Este correo ya está asociado a otra cuenta. Por favor, inicia sesión en lugar de registrarte.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Ese correo ya está en uso.');
      } else {
        Alert.alert('Error', error.message);
      }
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
        placeholder="Crea una contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

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

      <TouchableOpacity style={styles.buttonGreen} onPress={handleRegistro}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonTextWhite}>Guardar y Registrar</Text>
        )}
      </TouchableOpacity>

      {}
      {onSuccessfulRegister && !loading && (
        <TouchableOpacity style={styles.buttonWhite} onPress={onSuccessfulRegister}>
          <Text style={styles.buttonTextBlack}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
    backgroundColor: '#f4f4f5',
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
    marginHorizontal: 5,
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

export default LoginFormulario;