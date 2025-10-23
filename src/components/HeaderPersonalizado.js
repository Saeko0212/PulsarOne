import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal,
  Platform
} from 'react-native';
// ¡YA NO NECESITAMOS useNavigation! El 'navigation' vendrá por props.
import { FontAwesome } from '@expo/vector-icons';

// --- Componente de Botón para el Menú ---
// (Este se queda igual)
const MenuButton = ({ label, iconName, navigateTo, onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    {/* NOTA: Estoy usando FontAwesome como en tu ejemplo de Tabs.
      Si quieres tus íconos exactos, reemplaza <FontAwesome> por:
      <Image source={require('../Image/icon_rutina.png')} style={styles.iconImage} />
    */}
    <FontAwesome name={iconName} size={30} color="#444" />
    <Text style={styles.menuButtonText}>{label}</Text>
  </TouchableOpacity>
);

// --- Tu Componente Header (Modificado) ---

// 1. AHORA RECIBE 'navigation' COMO PROP
const HeaderPersonalizado = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // 2. Esta función AHORA USA el 'navigation' de los props
  const handleNavigate = (screenName) => {
    setModalVisible(false); // Cierra el modal
    navigation.navigate(screenName); // Usa el 'navigation' que vino por props
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      
      {/* --- EL MODAL (EL MENÚ) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        {/* Fondo oscuro semitransparente */}
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPressOut={() => setModalVisible(false)} // Cierra al tocar fuera
        >
          {/* Contenedor del Menú (el cuadro blanco) */}
          <View style={styles.modalContent}>
            
            {/* Grid de 6 botones */}
            <View style={styles.modalGrid}>
              <MenuButton label="Rutinas" iconName="list-alt" onPress={() => handleNavigate('Rutinas')} />
              <MenuButton label="Objetivos" iconName="bullseye" onPress={() => handleNavigate('Objetivos')} />
              <MenuButton label="Nutrición" iconName="leaf" onPress={() => handleNavigate('Nutricion')} />
              <MenuButton label="Sueño" iconName="moon-o" onPress={() => handleNavigate('Sueño')} />
              <MenuButton label="Timer" iconName="clock-o" onPress={() => handleNavigate('Timer')} />
              <MenuButton label="Ejercicios" iconName="bicycle" onPress={() => handleNavigate('Ejercicios')} />
            </View>

            {/* Botón de Ranking (separado) */}
            <View style={styles.rankingContainer}>
              <MenuButton label="Ranking" iconName="trophy" onPress={() => handleNavigate('Ranking')} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- TU HEADER CON EL NUEVO ORDEN --- */}
      <View style={styles.headerContent}>
        
        {/* 1. LADO IZQUIERDO: Flecha de "Atrás" (condicional) */}
        {navigation.canGoBack() ? (
          // Si SÍ puede ir atrás (ej. en 'Rutinas'), muestra la flecha
          <TouchableOpacity
            onPress={() => navigation.goBack()} // Función para ir atrás
            style={styles.headerButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#008000" />
          </TouchableOpacity>
        ) : (
          // Si NO puede (ej. en 'Inicio'), muestra un espacio invisible
          <View style={styles.headerButton} />
        )}

        {/* 2. CENTRO: Logo y Título (sin cambios) */}
        <View style={styles.titleContainer}>
          <Image
            // Asegúrate que la ruta a tu logo es correcta
            source={require('../Image/Logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.titleBase}>
            <Text style={styles.titlePulsar}>Pulsar</Text>
            <Text style={styles.titleOne}>One</Text>
          </Text>
        </View>
        
        {/* 3. DERECHA: Botón de Menú (Modal) */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)} // Abre el modal
          style={styles.headerButton}
        >
          <FontAwesome name="bars" size={24} color="#008000" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

// --- ESTILOS ---
// (Sin cambios en los estilos)
const styles = StyleSheet.create({
  // Estilos Originales del Header
  safeAreaContainer: {
    backgroundColor: '#FFFFFF',
    // Padding para Android (SafeAreaView no siempre funciona bien)
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  headerContent: { 
    flexDirection: 'row',     
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15, // Más espacio en los lados  
    paddingVertical: 10, // Más compacto
    borderBottomWidth: 2,   
    borderBottomColor: '#E0E0E0', 
    height: 60, // Altura fija
  },
  headerButton: {
    width: 40, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35, // Ligeramente más pequeño
    height: 35,
    resizeMode: 'contain',
    marginRight: 5,       
  },
  titleBase: {
    fontSize: 26, // Ligeramente más pequeño
  },
  titlePulsar: {
    color: '#008000', 
    fontWeight: '400', 
  },
  titleOne: {
    color: '#008000', 
    fontWeight: '700', 
  },

  // --- Estilos para el Modal ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 10, // Margen a los lados
    marginTop: Platform.OS === 'android' ? 85 : 100, // Ajusta esto para que quede debajo de tu header
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 5,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuButton: { // Estilo para los botones DENTRO del modal
    width: '45%', 
    margin: '2.5%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuButtonText: {
    fontSize: 14,
    marginTop: 10,
    color: '#333',
    fontWeight: '500',
  },
  rankingContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  /* // Estilo si usas imágenes personalizadas
  iconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  }
  */
});

export default HeaderPersonalizado;