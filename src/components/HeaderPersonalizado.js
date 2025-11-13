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
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const MenuButton = ({ label, iconName, iconLib = "FontAwesome", onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    {iconLib === 'MaterialCommunityIcons' ? (
      <MaterialCommunityIcons name={iconName} size={30} color="#444" />
    ) : iconLib === 'FontAwesome5' ? (
      <FontAwesome5 name={iconName} size={24} color="#444" />
    ): (
      <FontAwesome name={iconName} size={30} color="#444" />
    )}
    <Text style={styles.menuButtonText}>{label}</Text>
  </TouchableOpacity>
);

const HeaderPersonalizado = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleNavigate = (screenName) => {
    setModalVisible(false); 
    navigation.navigate(screenName); 
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      
      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        {}
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPressOut={() => setModalVisible(false)} 
        >
          {}
          <View style={styles.modalContent}>
            
            {}
            <View style={styles.modalGrid}>
              <MenuButton label="Rutinas" iconName="book" onPress={() => handleNavigate('Rutinas')} />
              <MenuButton label="Objetivos" iconName="bullseye" onPress={() => handleNavigate('Objetivos')} />
              <MenuButton label="Nutrición" iconName="food-apple" iconLib="MaterialCommunityIcons" onPress={() => handleNavigate('Nutricion')} />
              <MenuButton label="Sueño" iconName="moon-o" onPress={() => handleNavigate('Sueño')} />
              <MenuButton label="Timer" iconName="clock-o" onPress={() => handleNavigate('Timer')} />
              <MenuButton label="Ejercicios" iconName="dumbbell" iconLib="FontAwesome5" onPress={() => handleNavigate('Ejercicios')} />
            </View>

            {}
            <View style={styles.rankingContainer}>
              <MenuButton label="Ranking" iconName="trophy" onPress={() => handleNavigate('Ranking')} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {}
      <View style={styles.headerContent}>
        
        {}
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()} 
            style={styles.headerButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#008000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        {}
        <View style={styles.titleContainer}>
          <Image
            source={require('../Image/Logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.titleBase}>
            <Text style={styles.titlePulsar}>Pulsar</Text>
            <Text style={styles.titleOne}>One</Text>
          </Text>
        </View>
        
        {}
        <TouchableOpacity
          onPress={() => setModalVisible(true)} 
          style={styles.headerButton}
        >
          <FontAwesome name="bars" size={24} color="#008000" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  headerContent: { 
    flexDirection: 'row',     
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,  
    paddingVertical: 10, 
    borderBottomWidth: 2,   
    borderBottomColor: '#E0E0E0', 
    height: 60, 
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
    width: 35, 
    height: 35,
    resizeMode: 'contain',
    marginRight: 5,       
  },
  titleBase: {
    fontSize: 26, 
  },
  titlePulsar: {
    color: '#008000', 
    fontWeight: '400', 
  },
  titleOne: {
    color: '#008000', 
    fontWeight: '700', 
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 10, 
    marginTop: Platform.OS === 'android' ? 85 : 100, 
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
  menuButton: { 
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

});

export default HeaderPersonalizado;