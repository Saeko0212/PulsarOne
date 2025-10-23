import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { auth, db } from '../database/firebaseconfig.js'; // Nota: '../' para salir de 'components'
import { signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

// Importa el nuevo modal de edición
import EditarPerfilModal from './EditarPerfilModal';

const LoggedInView = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Usamos onSnapshot para que los datos se actualicen en tiempo real
    // si el usuario los edita en el modal.
    const docRef = doc(db, "PerfilDatos", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No se encontraron datos del perfil.");
        setUserData(null); // Asegurarse de poner null si no existe
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar datos:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Limpia el listener
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged en App.js iniciará sesión anónima
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }
  
  // --- LÓGICA DE RENDER CORREGIDA ---
  return (
    <View style={styles.container}>
      
      {/* Sección Condicional: Muestra perfil O el error */}
      {userData ? (
        <>
          {/* Sección de Info de Usuario */}
          <View style={styles.profileHeader}>
            <Image 
              source={require('../Image/Logo.png')} // Corregido para apuntar a la imagen correcta
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData.nombre}</Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
              <Text style={styles.profileMember}>
                Miembro desde: {userData.fechaCreacion?.toDate().toLocaleDateString() || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Botón Editar Perfil (Solo si hay datos) */}
          <TouchableOpacity 
            style={[styles.button, styles.buttonWhite]}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.buttonTextBlack}>Editar Perfil</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Mensaje de error si no hay datos
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>No se pudieron cargar los datos del perfil.</Text>
          <Text style={styles.errorSubText}>
            Esto puede pasar si iniciaste sesión con una cuenta que no completó el registro.
          </Text>
        </View>
      )}
      
      {/* Botón Cerrar Sesión (SIEMPRE visible) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonRed]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal de Edición (Renderizado condicional) */}
      {/* Solo renderiza el modal si hay datos que pasarle */}
      {userData && (
        <EditarPerfilModal 
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          currentUserData={userData}
        />
      )}
    </View>
  );
};

// Estilos (similares a tu imagen)
const styles = StyleSheet.create({
  container: { width: '100%' },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: '#555' },
  profileMember: { fontSize: 12, color: '#777', marginTop: 5 },
  button: { width: '100%', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, },
  buttonWhite: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dcdcdc' },
  buttonTextBlack: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  buttonRed: { backgroundColor: '#dc3545' },
  buttonTextWhite: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  
  // --- NUEVOS ESTILOS PARA EL ERROR ---
  errorBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545', // Rojo
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default LoggedInView;