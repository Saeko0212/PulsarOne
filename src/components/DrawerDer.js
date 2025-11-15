import React, { useEffect, useRef, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions, 
  TouchableWithoutFeedback,
  ScrollView,
  Platform
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8; 

const MenuItem = ({ icon, label, onPress, isSignOut = false, iconLib = "FontAwesome" }) => (
  <TouchableOpacity 
    style={[styles.menuItem, isSignOut && styles.signOutButton]} 
    onPress={onPress}
  >
    {iconLib === "FontAwesome" ? (
      <FontAwesome 
        name={icon} size={22} style={styles.icon}
        color={isSignOut ? '#d9534f' : '#008000'}
      />
    ) : (
      <MaterialCommunityIcons 
        name={icon} size={22} style={styles.icon}
        color={isSignOut ? '#d9534f' : '#008000'}
      />
    )}
    <Text style={[styles.menuText, isSignOut && styles.signOutText]}>{label}</Text>
  </TouchableOpacity>
);

const DrawerDer = ({ visible, onClose, navigation }) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const insets = useSafeAreaInsets(); 

  const [userName, setUserName] = useState('Cargando...');
  const [userEmail, setUserEmail] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email); 
        
        const docRef = doc(db, 'PerfilDatos', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const nombre = docSnap.data().nombre;
          setUserName(nombre); 
          setInitials(nombre.charAt(0).toUpperCase()); 
        } else {
          setUserName('Usuario');
          setInitials('U');
        }
      } else {
        setUserName('Invitado');
        setInitials('I');
      }
    });

    return () => unsubscribe(); 
  }, []); 

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      onClose(); 
    }).catch((error) => {
      console.error("Error al cerrar sesión: ", error);
    });
  };

  const handleNavigate = (screenName) => {
    onClose(); 
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 250);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>

      {}
      <Animated.View 
        style={[
          styles.drawerContainer,
          { 
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top, 
            paddingBottom: insets.bottom 
          }
        ]}
      >
        {}
        <View style={styles.profileHeader}>
          {}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {}
        <ScrollView style={styles.menuItems}>
          <MenuItem icon="list-alt" label="Rutinas" onPress={() => handleNavigate('Rutinas')} />
          <MenuItem icon="bullseye" label="Objetivos" onPress={() => handleNavigate('Objetivos')} />
          <MenuItem icon="apple" label="Nutrición" onPress={() => handleNavigate('Nutricion')} />
          <MenuItem icon="moon-o" label="Sueño" onPress={() => handleNavigate('Sueño')} />
          <MenuItem icon="clock-o" label="Timer" onPress={() => handleNavigate('Timer')} />
          <MenuItem icon="dumbbell" label="Ejercicios" onPress={() => handleNavigate('Ejercicios')} iconLib="MaterialCommunityIcons" />
          <MenuItem icon="trophy" label="Ranking" onPress={() => handleNavigate('Ranking')} />
        </ScrollView>
        
        {}
        <View style={styles.footer}>
          <MenuItem icon="sign-out" label="Cerrar Sesión" onPress={handleSignOut} isSignOut={true} />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff', 
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  profileHeader: {
    backgroundColor: '#e6f2e6', 
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d4e0d4',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#008000', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d00', 
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  menuItems: {
    flex: 1, 
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  icon: {
    width: 30,
    textAlign: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  signOutButton: {
    backgroundColor: '#fde8e8', 
  },
  signOutText: {
    color: '#d9534f', 
    fontWeight: 'bold',
  },
});

export default DrawerDer;