import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProfileView = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Leer los datos desde "PerfilDatos"
          const docRef = doc(db, "PerfilDatos", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("No se encontraron datos del perfil.");
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 'onAuthStateChanged' en App.js detectará esto
      // y automáticamente iniciará una nueva sesión anónima.
      console.log('Usuario cerró sesión');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Perfil</Text>
      {userData ? (
        <>
          <Text style={styles.text}>Nombre: {userData.nombre}</Text>
          <Text style={styles.text}>Email: {userData.email}</Text>
          <Text style={styles.text}>Edad: {userData.edad}</Text>
          <Text style={styles.text}>Altura: {userData.altura} cm</Text>
        </>
      ) : (
        <Text style={styles.text}>No se pudieron cargar los datos.</Text>
      )}

      <TouchableOpacity style={styles.buttonRed} onPress={handleLogout}>
        <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: 'white', borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10, alignSelf: 'flex-start' },
  buttonRed: {
    backgroundColor: '#dc3545', // Un botón rojo para logout
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileView;