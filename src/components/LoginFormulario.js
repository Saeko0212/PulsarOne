import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { EmailAuthProvider, linkWithCredential, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';

const LoginFormulario = ({ onSuccessfulRegister }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [edad, setEdad] = useState('');
  const [altura, setAltura] = useState('');
  const [genero, setGenero] = useState('Hombre');

  const handleRegistro = async () => {
    if (!nombre || !email || !password || !edad || !altura || !genero) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      const datosPerfil = {
        nombre: nombre,
        email: email.toLowerCase(),
        edad: parseInt(edad, 10),
        altura: parseInt(altura, 10),
        genero: genero
      };

      if (currentUser && currentUser.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(currentUser, credential);
        const user = userCredential.user;

        await setDoc(doc(db, "PerfilDatos", user.uid), datosPerfil, { merge: true });

        await user.reload();
        await auth.updateCurrentUser({ ...user });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "PerfilDatos", user.uid), {
          ...datosPerfil,
          uid: user.uid,
          fechaCreacion: new Date()
        });
      }

      Alert.alert('¡Éxito!', 'Registro completado.');
      if (onSuccessfulRegister) onSuccessfulRegister();

    } catch (error) {
      console.error("Error:", error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} placeholder="Tu nombre completo" value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry />

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Edad</Text>
          <TextInput style={styles.input} placeholder="25" keyboardType="numeric" value={edad} onChangeText={setEdad} />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput style={styles.input} placeholder="175" keyboardType="numeric" value={altura} onChangeText={setAltura} />
        </View>
      </View>

      <Text style={styles.label}>Género</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={genero}
          onValueChange={(itemValue) => setGenero(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Hombre" value="Hombre" />
          <Picker.Item label="Mujer" value="Mujer" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.buttonGreen} onPress={handleRegistro}>
        <Text style={styles.buttonTextWhite}>Guardar y Registrar</Text>
      </TouchableOpacity>
      {onSuccessfulRegister && (
        <TouchableOpacity style={styles.buttonWhite} onPress={onSuccessfulRegister}>
          <Text style={styles.buttonTextBlack}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { padding: 10 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
    input: { backgroundColor: '#f4f4f5', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    column: { width: '48%' },
    pickerContainer: {
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        marginBottom: 15,
        height: 50,
        justifyContent: 'center'
    },
    picker: {
        height: 50,
    },
    buttonGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    buttonWhite: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dcdcdc' },
    buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default LoginFormulario;