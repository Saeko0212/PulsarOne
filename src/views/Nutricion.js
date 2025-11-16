import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, ScrollView, SafeAreaView, RefreshControl, 
  Text, TouchableOpacity, Alert 
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../database/firebaseconfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import FormularioNutricion from '../components/FormularioNutricion';
import FormularioMetasNutricion from '../components/FormularioMetasNutricion';
import ResumenHoyNutricion from '../components/ResumenHoyNutricion';

const Nutricion = () => {
  const [modalComidaVisible, setModalComidaVisible] = useState(false);
  const [modalMetasVisible, setModalMetasVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  const [metas, setMetas] = useState({
    calorias: 2000, proteina: 150, carbos: 200, grasas: 65
  });

  const [consumido, setConsumido] = useState({
    calorias: 0,
    proteina: 0,
    carbos: 0,
    grasas: 0
  });

  const [listaComidas, setListaComidas] = useState([]); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      cargarDatos();
    } else {
      // Limpiar datos si no hay usuario
      setMetas({ calorias: 2000, proteina: 150, carbos: 200, grasas: 65 });
      setConsumido({ calorias: 0, proteina: 0, carbos: 0, grasas: 0 });
      setListaComidas([]);
    }
  }, [user]);

  const cargarDatos = async () => {
    setRefreshing(true);
    await Promise.all([cargarMetas(), cargarComidasHoy()]);
    setRefreshing(false);
  };

  const cargarMetas = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "metasNutricionales", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMetas(docSnap.data());
      } else {
        console.log("No hay metas nutricionales guardadas para este usuario, usando valores por defecto.");
        setMetas({
          calorias: 2000, proteina: 150, carbos: 200, grasas: 65
        });
      }
    } catch (e) { 
      console.error("Error cargando metas:", e);
      setMetas({
        calorias: 2000, proteina: 150, carbos: 200, grasas: 65
      });
    }
  };

  const cargarComidasHoy = async () => {
    if (!user) return;
    try {
      const hoy = new Date();
      const q = query(
        collection(db, "Nutricion"), 
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      
      let totalCal = 0, totalProt = 0, totalCarb = 0, totalGrasa = 0;
      let comidasTemp = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fechaRegistro = data.timestamp ? data.timestamp.toDate() : new Date();
        
        if (esMismoDia(fechaRegistro, new Date())) {
          totalCal += data.calorias || 0;
          totalProt += data.proteina || 0;
          totalCarb += data.carbos || 0;
          totalGrasa += data.grasas || 0;
          comidasTemp.push({ id: doc.id, ...data });
        }
      });

      setConsumido({
        calorias: totalCal, proteina: totalProt, carbos: totalCarb, grasas: totalGrasa
      });
      
      setListaComidas(comidasTemp.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA; 
      }));

    } catch (e) { console.error("Error cargando comidas", e); }
  };

  const esMismoDia = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const handleDelete = (id, nombre) => {
    Alert.alert(
      "Eliminar Comida",
      `¿Estás seguro de eliminar "${nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Nutricion", id));
              cargarDatos(); 
            } catch (error) {
              console.error("Error eliminando:", error);
              Alert.alert("Error", "No se pudo eliminar la comida");
            }
          }
        }
      ]
    );
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Desayuno': return { bg: '#FFFBEB', text: '#D97706' }; 
      case 'Almuerzo': return { bg: '#ECFDF5', text: '#059669' }; 
      case 'Cena': return { bg: '#FEE2E2', text: '#DC2626' }; 
      case 'Merienda': return { bg: '#E0F2FE', text: '#0284C7' }; 
      case 'Media Mañana': return { bg: '#F3E8FF', text: '#7C3AED' }; 
      case 'Post-Entrenamiento': return { bg: '#FCE7F3', text: '#DB2777' }; 
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={cargarDatos} />}
      >
        {}
        <ResumenHoyNutricion 
          metas={metas}
          consumido={consumido}
          onPressMetas={() => setModalMetasVisible(true)}
          onPressAgregar={() => setModalComidaVisible(true)}
        />

        {}
        <Text style={styles.sectionTitle}>Comidas de Hoy</Text>

        {}
        {listaComidas.length === 0 ? (
          <View style={styles.emptyState}>
             <Text style={styles.emptyText}>No hay comidas registradas hoy.</Text>
          </View>
        ) : (
          listaComidas.map((item) => {
            const colors = getTipoColor(item.tipo);
            return (
              <View key={item.id} style={styles.card}>
                {}
                <View style={styles.cardHeader}>
                  <View style={styles.infoContainer}>
                    <Text style={styles.foodName}>{item.nombre}</Text>
                    <View style={[styles.tag, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.tagText, { color: colors.text }]}>{item.tipo}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsContainer}>
                    {}
                    <TouchableOpacity style={styles.iconButton}>
                      <Ionicons name="create-outline" size={20} color="#333" />
                    </TouchableOpacity>
                    {}
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id, item.nombre)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {}
                <Text style={styles.timeText}>{item.hora}</Text>

                {}
                <View style={styles.macrosContainer}>
                  {}
                  <View style={[styles.macroBox, { backgroundColor: '#FFF5F1' }]}> 
                    <Ionicons name="flame-outline" size={18} color="#F97316" />
                    <Text style={styles.macroValue}>{item.calorias}</Text>
                    <Text style={styles.macroLabel}>kcal</Text>
                  </View>

                  {}
                  <View style={[styles.macroBox, { backgroundColor: '#FEF2F2' }]}> 
                    <MaterialCommunityIcons name="food-steak" size={18} color="#EF4444" />
                    <Text style={styles.macroValue}>{item.proteina}g</Text>
                    <Text style={styles.macroLabel}>proteína</Text>
                  </View>

                  {}
                  <View style={[styles.macroBox, { backgroundColor: '#FEFCE8' }]}> 
                    <Ionicons name="cafe-outline" size={18} color="#EAB308" />
                    <Text style={styles.macroValue}>{item.carbos}g</Text>
                    <Text style={styles.macroLabel}>carbos</Text>
                  </View>

                  {}
                  <View style={[styles.macroBox, { backgroundColor: '#EFF6FF' }]}> 
                    <Ionicons name="water-outline" size={18} color="#3B82F6" />
                    <Text style={styles.macroValue}>{item.grasas}g</Text>
                    <Text style={styles.macroLabel}>grasas</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

      </ScrollView>

      {}
      <FormularioNutricion 
        visible={modalComidaVisible} 
        onClose={() => { setModalComidaVisible(false); cargarDatos(); }} 
      />

      {}
      <FormularioMetasNutricion 
        visible={modalMetasVisible} 
        onClose={() => { setModalMetasVisible(false); cargarDatos(); }}
        onGoalsUpdated={cargarDatos}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
  },
  content: {
    padding: 20,
    paddingTop: 10, 
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 25,
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap', 
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700', 
    color: '#1F2937', 
    marginRight: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 5,
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280', 
    marginTop: 4,
    marginBottom: 15, 
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBox: {
    width: '23%', 
    borderRadius: 12, 
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  macroLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  }
});

export default Nutricion;