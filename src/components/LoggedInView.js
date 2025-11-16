import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Alert,
  ScrollView, 
} from 'react-native';
import { auth, db } from '../database/firebaseconfig.js';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, deleteDoc,
   limit, where, getDocs, updateDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import EditarPerfilModal from './EditarPerfilModal';
import FormularioMedicion from './FormularioMedicion'; 
import EditarMedicionModal from './EditarMedicionModal'; 
import EliminarMedicionModal from './EliminarMedicionModal';

const MedicionItem = ({ item, onEdit, onDelete }) => {
  const { fecha, peso, grasa, masaMuscular } = item;
  return (
    <View style={styles.medicionItemCard}>
      <View style={styles.medicionRow}>
        <FontAwesome name="calendar-o" size={18} color="#555" style={styles.icon} />
        <Text style={styles.medicionDate}>
          {fecha.toDate().toLocaleDateString('es-ES')}
        </Text>
        <View style={styles.medicionIcons}>
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

const LoggedInView = () => {
  const [userData, setUserData] = useState(null);
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [imcData, setImcData] = useState({ imc: null, categoria: 'Calculando...' });
  const [pesoObjetivoCalculado, setPesoObjetivoCalculado] = useState(null);
  const [profileImage, setProfileImage] = useState(null); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [medicionModalVisible, setMedicionModalVisible] = useState(false);
  const [editMedicionModalVisible, setEditMedicionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const [medicionToEdit, setMedicionToEdit] = useState(null);
  const [medicionToDelete, setMedicionToDelete] = useState(null); 
  
  const user = auth.currentUser;

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar el perfil.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.4, 
      base64: true, 
    });

    if (!resultado.canceled) {
      const base64Img = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      
      setProfileImage(base64Img);

      try {
        const docRef = doc(db, 'PerfilDatos', user.uid);
        await updateDoc(docRef, {
          foto: base64Img 
        });
      } catch (error) {
        console.error("Error al guardar foto:", error);
        Alert.alert("Error", "No se pudo guardar la foto en la nube.");
      }
    }
  };

  const eliminarImagen = async () => {
    setProfileImage(null);

    try {
      const docRef = doc(db, 'PerfilDatos', user.uid);
      await updateDoc(docRef, {
        foto: null 
      });
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      Alert.alert("Error", "No se pudo eliminar la foto de la nube.");
    }
  };

  const handleProfileImagePress = () => {
    if (profileImage) {
      Alert.alert(
        'Foto de Perfil',
        '¿Qué deseas hacer?',
        [
          {
            text: 'Seleccionar otra foto',
            onPress: seleccionarImagen,
          },
          {
            text: 'Eliminar foto actual',
            onPress: eliminarImagen,
            style: 'destructive', 
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      seleccionarImagen();
    }
  };
  const calcularImcAPI = async (pesoKg, alturaM, edad) => {
    try {
      const API_URL = "https://3hj4dtla5i.execute-api.us-east-2.amazonaws.com/calcular-imc"; 

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoKg: pesoKg,
          alturaM: alturaM,
          edad: edad,
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
      console.error("Error IMC:", error);
      setImcData({ imc: null, categoria: 'Error' });
    }
  };

  const calcularPesoObjetivoAPI = async (pesoBase, objetivoData) => {
    try {
      const API_URL = "https://3hj4dtla5i.execute-api.us-east-2.amazonaws.com/calcular-peso-objetivo"; 
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoBase: pesoBase,
          objetivoValor: objetivoData.objetivoValor,
          tipoMeta: objetivoData.tipoMeta 
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setPesoObjetivoCalculado(data.pesoObjetivo);
      }
    } catch (error) {
      console.error("Error Peso Objetivo:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const docRef = doc(db, 'PerfilDatos', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        if (data.foto) {
          setProfileImage(data.foto);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMediciones([]);
      return;
    }
    const medicionesRef = collection(db, 'PerfilDatos', user.uid, 'mediciones');
    const q = query(medicionesRef, orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaMediciones = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMediciones(listaMediciones);
    });

    return () => unsubscribe();
  }, [user]);
  useEffect(() => {
    let unsubscribeGoal = () => {}; 

    if (userData && userData.altura && mediciones.length > 0) {
      const pesoActual = mediciones[0].peso;
      const alturaEnMetros = userData.altura / 100;
      const edadActual = userData.edad;

      calcularImcAPI(pesoActual, alturaEnMetros, edadActual);

      const objRef = collection(db, "Objetivos");
      const q = query(
        objRef, 
        where("userId", "==", user.uid), 
        where("categoria", "==", "Peso"),
        orderBy("creadoEn", "desc"), 
        limit(1)
      );
      
      unsubscribeGoal = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const objetivoData = snapshot.docs[0].data();
          
          const pesoBaseParaCalculo = objetivoData.pesoInicial || pesoActual;
          
          calcularPesoObjetivoAPI(pesoBaseParaCalculo, objetivoData);
        } else {
          setPesoObjetivoCalculado(null);
        }
      });

    } else if (!loading) {
      setImcData({ imc: null, categoria: 'Sin datos' });
    }

    return () => unsubscribeGoal();

  }, [userData, mediciones, loading]); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!medicionToDelete || !user) return;

    try {
      if (!user) return;
      const medicionDocRef = doc(db, 'PerfilDatos', user.uid, 'mediciones', medicionToDelete);
      await deleteDoc(medicionDocRef);

      setDeleteModalVisible(false);
      setMedicionToDelete(null);

    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar.');
      setDeleteModalVisible(false);
      setMedicionToDelete(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error de carga.</Text>
        <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={handleLogout}>
          <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.mainTitle}>Mi Perfil</Text>
      <Text style={styles.mainSubtitle}>Gestiona tu información personal</Text> 

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleProfileImagePress}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImage, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : ''}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconOverlay}>
               <FontAwesome name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
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
            <FontAwesome name="pencil" size={16} color="#333" style={styles.icon} />
            <Text style={styles.buttonTextBlack}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonRed]}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonTextWhite}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.cardBlue]}>
          <Text style={styles.statCardTitle}>Peso Actual</Text>
          <Text style={styles.statCardValue}>
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
            <Text style={styles.statCardValue}>
              {pesoObjetivoCalculado ? `${pesoObjetivoCalculado} kg` : '-- kg'}
            </Text>
          </View>

          <View style={[styles.statCard, styles.cardOrange]}>
            <Text style={styles.statCardTitle}>IMC</Text>
            <Text style={styles.statCardValue}>
              {imcData.imc ? imcData.imc.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statCardSubtitle}>
              {imcData.categoria}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.datosFisicosHeader}>
          <Text style={styles.datosFisicosTitle}>Datos Físicos</Text>
          <TouchableOpacity
            style={styles.agregarButton}
            onPress={() => setMedicionModalVisible(true)}
          >
            <FontAwesome name="line-chart" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.agregarButtonText}>Agregar Medición</Text>
          </TouchableOpacity>
        </View>

        {mediciones.length > 0 ? (
          mediciones.map((item) => (
            <MedicionItem 
              key={item.id} 
              item={item} 
              onEdit={(medicion) => { setMedicionToEdit(medicion); setEditMedicionModalVisible(true); }}
              onDelete={(id) => {
                setMedicionToDelete(id);
                setDeleteModalVisible(true);
              }}
            />
          ))
        ) : (
          <Text style={styles.noMedicionesText}>No hay mediciones registradas.</Text>
        )}
      </View>

      <EditarPerfilModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} currentUserData={userData} />
      <FormularioMedicion visible={medicionModalVisible} onClose={() => setMedicionModalVisible(false)} />
      <EditarMedicionModal visible={editMedicionModalVisible} onClose={() => { setEditMedicionModalVisible(false); setMedicionToEdit(null); }} medicionToEdit={medicionToEdit} />

      <EliminarMedicionModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setMedicionToDelete(null); 
        }}
        onConfirmDelete={handleConfirmDelete}
      />
    </ScrollView>
  );
};

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
    backgroundColor: '#f0f2f5', 
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
    marginBottom: 20 
  },
  profileImage: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    marginRight: 15, 
  },
  avatarPlaceholder: {
    backgroundColor: '#008000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    backgroundColor: '#28a745',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  profileInfo: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  profileName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'left' 
  },
  profileEmail: { 
    fontSize: 14, 
    color: '#555',
    textAlign: 'left', 
    marginBottom: 2
  },
  profileMember: { 
    fontSize: 12, 
    color: '#999',
    textAlign: 'left' 
  },
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
  icon: {
    marginRight: 8, 
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
  statCardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cardPurple: { backgroundColor: '#f9f0ff' },
  cardOrange: { backgroundColor: '#fff8e1' },
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
    backgroundColor: '#28a745', 
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
    backgroundColor: '#f8f9fa',
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
    marginLeft: 10,
  },
  medicionIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-around',
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