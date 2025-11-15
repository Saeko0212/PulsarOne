import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DrawerDer from './DrawerDer'; 

const HeaderPersonalizado = ({ navigation, canGoBack, routeName }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabScreens = ['Inicio', 'Calendario', 'Progreso', 'Perfil'];
  const showBackButton = canGoBack && !mainTabScreens.includes(routeName);

  return ( 
    <View> 
      {}
      <DrawerDer 
        visible={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        navigation={navigation} 
      />

      <View style={styles.headerContent}>
        
        {}
        {}
        {showBackButton ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()} 
            style={styles.headerButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#008000" /> 
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(true)}
            style={styles.headerButton}
          >
            <FontAwesome name="bars" size={24} color="#008000" />
          </TouchableOpacity>
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
        <View style={styles.headerButton} />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default HeaderPersonalizado;