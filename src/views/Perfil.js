import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { auth } from '../database/firebaseconfig.js';
import { onAuthStateChanged } from "firebase/auth";

// Importa las dos vistas que crearemos
import LoggedInView from '../components/LoggedInView';
import LoggedOutView from '../components/LoggedOutView';

const Perfil = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios de estado (login, logout, link)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {user && !user.isAnonymous ? (
          // El usuario está registrado
          <LoggedInView />
        ) : (
          // El usuario es un invitado
          <LoggedOutView />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
});

export default Perfil;