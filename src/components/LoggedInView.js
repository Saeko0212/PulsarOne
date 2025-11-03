// components/LoggedInView.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Alert,
  ScrollView, // ¡Importante!
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { signOut } from 'firebase/auth';
// ¡Nuevos imports!
import { doc, onSnapshot, collection, query, orderBy, deleteDoc } from 'firebase/firestore';

// --- ¡NUEVO! Importa la librería de iconos ---
// Importa la librería de iconos
import { FontAwesome } from '@expo/vector-icons';

import EditarPerfilModal from './EditarPerfilModal';
import FormularioMedicion from './FormularioMedicion'; // <-- ¡Importa el nuevo modal!
import EditarMedicionModal from './EditarMedicionModal'; // <-- Añade esta línea
import EliminarMedicionModal from './EliminarMedicionModal';

// --- Componente para un item de la lista (actualizado con iconos) ---
// Componente para un item de la lista (actualizado con iconos)
const MedicionItem = ({ item, onEdit, onDelete }) => {
  const { fecha, peso, grasa, masaMuscular } = item;
  return (
    <View style={styles.medicionItemCard}>
      <View style={styles.medicionRow}>
        <FontAwesome name="calendar-o" size={20} color="#555" />
        <Text style={styles.medicionDate}>
          {fecha.toDate().toLocaleDateString('es-ES')}
        </Text>
        <View style={styles.medicionIcons}>
          {/* Botón de Editar con la nueva función onEdit */}
          <TouchableOpacity onPress={() => onEdit(item)}>
            <FontAwesome name="pencil" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <FontAwesome name="trash-o" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.medicionRow}>
        <Text style={styles.medicionData}>Peso: {peso} kg</Text>
        <Text style={styles.medicionData}>Grasa: {grasa || '--'}%</Text>
      </View>
      <View style={styles.medicionRow}>
        <Text style={styles.medicionData}>Músculo: {masaMuscular || '--'} kg</Text>
      </View>
    </View>
  );
};

// --- Componente Principal ---
const LoggedInView = () => {
  const [userData, setUserData] = useState(null);
  const [mediciones, setMediciones] = useState([]); // <-- ¡Nuevo estado!
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [medicionModalVisible, setMedicionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [medicionToDelete, setMedicionToDelete] = useState(null); // Almacena el ID
  const [editMedicionModalVisible, setEditMedicionModalVisible] = useState(false); // <-- Añade esta línea
  const [medicionToEdit, setMedicionToEdit] = useState(null); // <-- Añade esta línea
  // Cerca de tus otros 'useState'
  const [imcData, setImcData] = useState({ imc: null, categoria: 'Calculando...' });
  
  const user = auth.currentUser;

  // ... (después de handleLogout o handleDeleteMedicion) ...
  const calcularImcAPI = async (pesoKg, alturaM, edad) => {
    try {
      // ¡CAMBIA ESTA URL POR LA TUYA DE API GATEWAY!
      const API_URL = "https://3hj4dtla5i.execute-api.us-east-2.amazonaws.com/calcular-imc"; 

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoKg: pesoKg,
          alturaM: alturaM,
          edad: edad, 
          // El PDF también pide genero, actividad y meta, 
          // puedes añadirlos si los tienes en 'userData'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImcData({ imc: data.imc, categoria: data.categoria });
      } else {
        console.error("Error en la API:", data.message);
        setImcData({ imc: null, categoria: 'Error' });
      }
    } catch (error) {
      console.error("Error al calcular IMC en API:", error);
      setImcData({ imc: null, categoria: 'Error' });
    }
  };

  // Efecto para cargar datos del perfil (igual que antes)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const docRef = doc(db, 'PerfilDatos', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- ¡NUEVO EFECTO! ---
  // Efecto para cargar las mediciones del usuario, ordenadas por fecha
  useEffect(() => {
    if (!user) {
      setMediciones([]);
      return;
    }
    const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');
    const q = query(medicionesRef, orderBy('fecha', 'desc')); // Ordena por fecha más nueva

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaMediciones = [];
      querySnapshot.forEach((doc) => {
        listaMediciones.push({ id: doc.id, ...doc.data() });
      });
      setMediciones(listaMediciones);
    });

    return () => unsubscribe();
  }, [user]);

  // ... (después de tus otros useEffect) ...
  // Efecto para calcular el IMC cuando los datos estén listos
  useEffect(() => {
    // Solo se ejecuta si tenemos userData (para la altura) Y al menos una medición (para el peso)
    if (userData && userData.altura && mediciones.length > 0) {

      // 1. Obtener la altura del perfil y convertirla a metros
      const alturaEnMetros = userData.altura / 100;

      // 2. Obtener el peso de la medición más reciente
      const pesoActual = mediciones[0].peso;

      // 3. Obtener la edad (la guardamos en 'PerfilDatos' con el modal de edición)
      const edadActual = userData.edad; 

      // 4. Llamar a la API
      calcularImcAPI(pesoActual, alturaEnMetros, edadActual);

    } else if (!loading) {
      // Si no hay datos, resetea
      setImcData({ imc: null, categoria: 'Sin datos' });
    }
  }, [userData, mediciones, loading]); // Depende de estas variables

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  // Esta función SÍ borra el documento. Se la pasaremos al modal.
  const handleConfirmDelete = async () => {
    if (!medicionToDelete) return; // Seguridad

    try {
      if (!user) return;
      const medicionDocRef = doc(db, 'PerfilDatos', user.uid, 'mediciones', medicionToDelete);
      await deleteDoc(medicionDocRef);

      // Cierra el modal y limpia el estado
      setDeleteModalVisible(false);
      setMedicionToDelete(null);
      Alert.alert('¡Éxito!', 'Medición eliminada correctamente.');

    } catch (error) {
      console.error('Error al eliminar medición: ', error);
      Alert.alert('Error', 'No se pudo eliminar la medición.');
      setDeleteModalVisible(false);
      setMedicionToDelete(null);
    }
  };

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Vista de "Cargando" o "Error" (si no hay datos de perfil)
  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudieron cargar los datos del perfil.</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonRed, { marginTop: 20 }]}
          onPress={handleLogout}
        >
          {/* ¡Icono actualizado! */}
          <FontAwesome name="sign-out" size={16} color="#fff" style={styles.icon} />
          <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- VISTA PRINCIPAL DEL PERFIL (SI HAY DATOS) ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* 1. Títulos */}
      <Text style={styles.mainTitle}>Mi Perfil</Text>
      <Text style={styles.mainSubtitle}>Gestiona tu información personal</Text> 

      {/* 2. Encabezado del Perfil (Frame) */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <Image
            source={require('../Image/Logo.png')}
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonWhite]}
            onPress={() => setEditModalVisible(true)}
          >
            {/* ¡Icono actualizado! */}
            <FontAwesome name="pencil" size={16} color="#333" style={styles.icon} />
            <Text style={styles.buttonTextBlack}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonRed]}
            onPress={handleLogout}
          >
            {/* ¡Icono actualizado! */}
            <FontAwesome name="sign-out" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Grid de Estadísticas (Frame) */}
      <View style={styles.card}>
        {/* ... (el grid de estadísticas se mantiene igual) ... */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.cardBlue]}>
          <Text style={styles.statCardTitle}>Peso Actual</Text>
          <Text style={styles.statCardValue}>
            {/* Comprueba si hay mediciones. Si sí, muestra el peso de la primera [0]. Si no, muestra '--'. */}
            {mediciones.length > 0 ? `${mediciones[0].peso} kg` : '-- kg'}
          </Text>
        </View>
          <View style={[styles.statCard, styles.cardGreen]}>
            <Text style={styles.statCardTitle}>Altura</Text>
            <Text style={styles.statCardValue}>
              {userData.altura ? `${userData.altura} cm` : '--'}
            </Text>
          </View>
          <View style={[styles.statCard, styles.cardPurple]}>
            <Text style={styles.statCardTitle}>Objetivo</Text>
            <Text style={styles.statCardValue}>70 kg</Text>
          </View>
          <View style={[styles.statCard, styles.cardOrange]}>
            <Text style={styles.statCardTitle}>IMC</Text>
            <Text style={styles.statCardValue}>
              {/* Muestra el IMC con 1 decimal, o '--' si no hay */}
              {imcData.imc ? imcData.imc.toFixed(1) : '--'}
            </Text>
            {/* Añadimos un subtítulo para la categoría */}
            <Text style={styles.statCardSubtitle}>
              {imcData.categoria}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. ¡NUEVA SECCIÓN! Datos Físicos (Frame) */}
      <View style={styles.card}>
        <View style={styles.datosFisicosHeader}>
          <Text style={styles.datosFisicosTitle}>Datos Físicos</Text>
          <TouchableOpacity
            style={styles.agregarButton}
            onPress={() => setMedicionModalVisible(true)}
          >
            {/* ¡Icono actualizado! */}
            <FontAwesome name="line-chart" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.agregarButtonText}>Agregar Medición</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Mediciones */}
        {mediciones.length > 0 ? (
          mediciones.map((item) => (
            <MedicionItem 
              key={item.id} 
              item={item} 
              onEdit={(medicion) => {
                setMedicionToEdit(medicion); // Guarda la medición a editar
                setEditMedicionModalVisible(true); // Abre el modal
              }}
              // --- ¡CAMBIO AQUÍ! ---
              onDelete={(id) => {
                setMedicionToDelete(id); // Guarda el ID de la medición a borrar
                setDeleteModalVisible(true); // Abre el modal de confirmación
              }}
            />
          ))
        ) : (
          <Text style={styles.noMedicionesText}>No hay mediciones registradas.</Text>
        )}
      </View>

      {/* --- MODALS --- */}
      <EditarPerfilModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        currentUserData={userData}
      />

      <FormularioMedicion
        visible={medicionModalVisible}
        onClose={() => setMedicionModalVisible(false)}
      />

      <EditarMedicionModal
        visible={editMedicionModalVisible} // Usa el nuevo estado
        onClose={() => {
          setEditMedicionModalVisible(false);
          setMedicionToEdit(null); // Limpia la medición a editar al cerrar
        }}
        medicionToEdit={medicionToEdit} // Pasa la medición seleccionada
      />

      {/* --- ¡AÑADE ESTE MODAL! --- */}
      <EliminarMedicionModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setMedicionToDelete(null); // Limpia al cancelar
        }}
        onConfirmDelete={handleConfirmDelete} // Pasa la función de borrado
      />
    </ScrollView>
  );
};

// --- ESTILOS ---
// --- ESTILOS ACTUALIZADOS ---
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  errorText: { fontSize: 16, color: '#dc3545', textAlign: 'center' },
  container: { 
    flex: 1,
    backgroundColor: '#f0f2f5', // Fondo de la app
  },
  scrollContent: {
    padding: 15,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  profileEmail: { fontSize: 14, color: '#555' },
  profileMember: { fontSize: 12, color: '#777', marginTop: 4 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  // --- ¡ESTILO ACTUALIZADO PARA EL ICONO! ---
  icon: {
    marginRight: 8, // Da espacio entre el icono y el texto
  },
  buttonWhite: {
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#dcdcdc',
  },
  buttonTextBlack: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  buttonRed: { backgroundColor: '#dc3545' },
  buttonTextWhite: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  statCardTitle: { fontSize: 14, color: '#555', marginBottom: 5 },
  statCardValue: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  cardBlue: { backgroundColor: '#e7f3fe' },
  cardGreen: { backgroundColor: '#e6f7eb' },
  // --- ¡AÑADE ESTE ESTILO! ---
  statCardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cardPurple: { backgroundColor: '#f9f0ff' },
  cardOrange: { backgroundColor: '#fff8e1' },
  
  // --- ¡NUEVOS ESTILOS! ---
  datosFisicosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  datosFisicosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745', // Verde
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  agregarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  medicionItemCard: {
    backgroundColor: '#f8f9fa', // Fondo gris claro para el item
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  medicionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  medicionDate: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10, // Espacio después del icono de calendario
  },
  medicionIcons: {
    flexDirection: 'row',
    width: 60, // Ancho fijo para alinear
    justifyContent: 'space-around', // Espacio entre iconos
  },
  medicionData: {
    fontSize: 14,
    color: '#555',
    marginRight: 20,
  },
  noMedicionesText: {
    textAlign: 'center',
    color: '#777',
    paddingVertical: 20,
  },
});

export default LoggedInView;