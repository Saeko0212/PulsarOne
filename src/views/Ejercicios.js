import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../database/firebaseconfig.js'; 
import BusquedaEjercicio from '../components/BusquedaEjercicio';
import EjerciciosFavoritos from '../components/EjerciciosFavoritos';
import FormularioEjercicios from '../components/FormularioEjercicios.js';

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filteredEjercicios, setFilteredEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [userId, setUserId] = useState(null);
  const [favoritosIds, setFavoritosIds] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setEjercicios([]);
        setFilteredEjercicios([]);
        setFavoritosIds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      cargarDatos(userId);
    }
  }, [userId]);

  const cargarDatos = async (currentUserId) => {
    setLoading(true);
    try {
      // A. Cargar IDs de Favoritos
      const favsRef = collection(db, 'PerfilDatos', currentUserId, 'favoritos');
      const favsSnapshot = await getDocs(favsRef);
      const favsIds = favsSnapshot.docs.map(doc => doc.id);
      setFavoritosIds(favsIds);

      const q = query(
        collection(db, "ejercicios"), 
        where("userId", "in", [currentUserId, "admin"])
      );
      
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEjercicios(lista);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (idEjercicio) => {
    if (!userId) return;

    const favDocRef = doc(db, 'PerfilDatos', userId, 'favoritos', idEjercicio);
    let nuevosFavoritos;

    if (favoritosIds.includes(idEjercicio)) {
      await deleteDoc(favDocRef);
      nuevosFavoritos = favoritosIds.filter(id => id !== idEjercicio);
    } else {
      await setDoc(favDocRef, { agregadoEl: new Date() });
      nuevosFavoritos = [...favoritosIds, idEjercicio];
    }
    setFavoritosIds(nuevosFavoritos);
  };

  useEffect(() => {
    let resultado = ejercicios;

    if (busqueda) {
      resultado = resultado.filter(e => 
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.musculoPrincipal && e.musculoPrincipal.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    if (categoria !== 'Todos') {
      if (categoria === 'Favoritos') {
        resultado = resultado.filter(e => favoritosIds.includes(e.id));
      } else {
        resultado = resultado.filter(e => e.categoria === categoria);
      }
    }

    setFilteredEjercicios(resultado);
  }, [busqueda, categoria, ejercicios, favoritosIds]);

  const renderItem = ({ item }) => {
    const esFav = favoritosIds.includes(item.id);
    const esOficial = item.userId === 'admin'; 

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, item.dificultad === 'Principiante' ? styles.bgGreen : styles.bgYellow]}>
                <Text style={[styles.badgeText, item.dificultad === 'Principiante' ? styles.textGreen : styles.textYellow]}>
                  {item.dificultad}
                </Text>
              </View>
              
              <View style={[styles.badge, esOficial ? styles.bgBlue : styles.bgGray]}>
                <Text style={[styles.badgeText, esOficial ? styles.textBlue : styles.textGray]}>
                  {esOficial ? "Oficial" : "Personalizado"}
                </Text>
              </View>
            </View>
          </View>
          
          <EjerciciosFavoritos 
            esFavorito={esFav} 
            onToggle={() => toggleFavorito(item.id)} 
          />
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Categoría:</Text>
          <Text style={styles.detailValue}>{item.categoria}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Músculo:</Text>
          <Text style={styles.detailValue}>{item.musculoPrincipal}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Equipo:</Text>
          <Text style={styles.detailValue}>{item.equipo}</Text>
        </View>
        <Text style={styles.description}>{item.descripcion}</Text>

        {item.instrucciones && item.instrucciones.length > 0 && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Instrucciones:</Text>
            {item.instrucciones.map((inst, index) => (
              <View key={index} style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{inst}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.demoButton}>
          <Ionicons name="play" size={16} color="#333" style={{marginRight: 8}} />
          <Text style={styles.demoButtonText}>Ver Demostración</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Biblioteca de Ejercicios</Text>
          <Text style={styles.headerSubtitle}>Encuentra el ejercicio perfecto</Text>
        </View>
        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
          <Text style={styles.btnAddText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <BusquedaEjercicio 
        valorBusqueda={busqueda}
        setValorBusqueda={setBusqueda}
        categoriaSeleccionada={categoria}
        setCategoriaSeleccionada={setCategoria}
      />

      {loading && <ActivityIndicator size="large" color="#28A745" style={{marginTop: 50}} />}

      {!loading && !userId && (
        <Text style={styles.emptyText}>Inicia sesión para ver la biblioteca.</Text>
      )}

      {!loading && userId && (
        <FlatList
          data={filteredEjercicios}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => cargarDatos(userId)} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {categoria === 'Favoritos' 
                ? "Aún no tienes ejercicios favoritos." 
                : "No se encontraron ejercicios."}
            </Text>
          }
        />
      )}

      <FormularioEjercicios 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => cargarDatos(userId)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  btnAdd: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnAddText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    width: '90%',
  },
  
  badgeContainer: {
    flexDirection: 'row', flexWrap: 'wrap'
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginRight: 6, marginBottom: 4
  },
  
  bgYellow: { backgroundColor: '#FFF9C4' }, // Fondo amarillo claro
  textYellow: { color: '#FBC02D', fontWeight: 'bold', fontSize: 12 },
  bgGreen: { backgroundColor: '#C8E6C9' }, // Fondo verde claro
  textGreen: { color: '#28A745', fontWeight: 'bold', fontSize: 12 },
  bgBlue: { backgroundColor: '#E3F2FD' },
  textBlue: { color: '#2196F3', fontWeight: 'bold', fontSize: 12 }, // Azul Oficial
  bgGray: { backgroundColor: '#F0F0F0' },
  textGray: { color: '#757575', fontWeight: 'bold', fontSize: 12 }, // Gris Personal
  
  detailsContainer: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    color: '#999',
    fontSize: 14,
  },
  detailValue: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  description: {
    color: '#666',
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontSize: 14,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    color: '#4A90E2', 
    fontWeight: 'bold',
    marginRight: 8,
    width: 20,
  },
  instructionText: {
    color: '#555',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  demoButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 12,
    borderRadius: 10,
  },
  demoButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  }
});

export default Ejercicios;