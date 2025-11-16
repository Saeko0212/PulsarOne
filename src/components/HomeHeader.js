import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const HomeHeader = ({ userData }) => {
  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0]; 
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.textContainer}>
        {}
        <Text style={styles.welcomeText}>
          ¡Bienvenido de vuelta, {getFirstName(userData?.nombre)}!
        </Text>
        
        {}
        <Text style={styles.subtitleText}>
          Aquí está tu resumen de fitness de hoy
        </Text>
      </View>
      
      {userData?.foto ? (
        <Image 
          source={{ uri: userData.foto }} 
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileImage, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {getFirstName(userData?.nombre).charAt(0)}
          </Text>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    flex: 1, 
    paddingRight: 10,
  },
  welcomeText: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 4, 
  },
  subtitleText: {
    fontSize: 14,
    color: '#666', 
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#008000',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#008000', 
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HomeHeader;