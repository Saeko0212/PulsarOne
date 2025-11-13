import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';
import { auth } from './src/database/firebaseconfig.js'; 
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Mytabs from './src/Navigation/Navegacion.js';
import HeaderPersonalizado from './src/components/HeaderPersonalizado';
import Rutinas from './src/views/Rutinas.js';
import Objetivos from './src/views/Objetivos.js';
import Nutricion from './src/views/Nutricion.js';
import Sueño from './src/views/Sueño.js';
import Timer from './src/views/Timer.js';
import Ejercicios from './src/views/Ejercicios.js';
import Ranking from './src/views/Ranking.js';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        signInAnonymously(auth)
          .catch(error => {
            console.error("Error al iniciar sesión anónima:", error);
          });
      }
    });

    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={(props) => ({
          header: () => <HeaderPersonalizado {...props} />
        })
      }
      >
        {}
        <Stack.Screen
          name="AppTabs" 
          component={Mytabs}
        />
        {}
        <Stack.Screen name="Rutinas" component={Rutinas} />
        <Stack.Screen name="Objetivos" component={Objetivos} />
        <Stack.Screen name="Nutricion" component={Nutricion} />
        <Stack.Screen name="Sueño" component={Sueño} />
        <Stack.Screen name="Timer" component={Timer} />
        <Stack.Screen name="Ejercicios" component={Ejercicios} />
        <Stack.Screen name="Ranking" component={Ranking} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
