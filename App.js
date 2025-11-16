import React, { useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';

import Mytabs from './Navegacion'; 
import HeaderPersonalizado from './src/components/HeaderPersonalizado';

import Rutinas from './src/views/Rutinas.js';
import Objetivos from './src/views/Objetivos.js';
import Nutricion from './src/views/Nutricion.js';
import Sueño from './src/views/Sueño.js';
import Timer from './src/views/Timer.js';
import Ejercicios from './src/views/Ejercicios.js';
import Ranking from './src/views/Ranking.js';
import Programas from './src/views/Programas.js';

const Stack = createStackNavigator();

export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [routeName, setRouteName] = useState('');

  return (
    <SafeAreaProvider>
      {}
      <SafeAreaView style={styles.container}>
        
        {}
        {}
        <HeaderPersonalizado 
          navigation={navigationRef}
          canGoBack={canGoBack} 
          routeName={routeName} 
        />
        
        {}
        {}
        <NavigationContainer
          ref={navigationRef}
          onStateChange={() => {
            setCanGoBack(navigationRef.canGoBack());
            setRouteName(navigationRef.getCurrentRoute()?.name);
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false, 
            }}
          >
            {}
            <Stack.Screen name="AppTabs" component={Mytabs} />
            <Stack.Screen name="Rutinas" component={Rutinas} />
            <Stack.Screen name="Objetivos" component={Objetivos} />
            <Stack.Screen name="Nutricion" component={Nutricion} />
            <Stack.Screen name="Sueño" component={Sueño} />
            <Stack.Screen name="Timer" component={Timer} />
            <Stack.Screen name="Ejercicios" component={Ejercicios} />
            <Stack.Screen name="Ranking" component={Ranking} />
            <Stack.Screen name="Programas" component={Programas} />
            
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  }
});