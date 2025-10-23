import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';

// Importa tu configuración de Firebase
import { auth } from './src/database/firebaseconfig.js'; // <-- ¡IMPORTANTE!
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

// Importamos tu NAVEGADOR DE TABS (que ahora se llama Mytabs)
import Mytabs from './Navegacion.js';

// Importamos tu HEADER
import HeaderPersonalizado from './src/components/HeaderPersonalizado';

// Importamos TODAS las pantallas del menú (¡fíjate en las rutas!)
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
        // El usuario está logueado (real O anónimo)
        setLoading(false);
      } else {
        // No hay usuario. Lo logueamos anónimamente.
        signInAnonymously(auth)
          .catch(error => {
            console.error("Error al iniciar sesión anónima:", error);
            // Manejar error crítico si el login anónimo falla
          });
            // onAuthStateChanged se disparará de nuevo con el usuario anónimo,
            // y eso pondrá setLoading(false)
      }
    });

    return () => unsubscribe(); // Limpia el listener
  }, []);

  // Muestra un indicador de carga mientras Firebase inicia sesión
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Una vez cargado, mostramos la app principal con la nueva estructura de navegación
  return (
    <NavigationContainer>
      <Stack.Navigator
        // --- ¡CAMBIO IMPORTANTE AQUÍ! ---
        // Ahora pasamos los 'props' (como 'navigation') a tu header
        screenOptions={(props) => ({
          header: () => <HeaderPersonalizado {...props} />
        })
      }
      >
        {/* La pantalla principal es TU NAVEGADOR DE TABS */}
        <Stack.Screen
          name="AppTabs" // Un nombre para tu grupo de tabs
          component={Mytabs}
        />
        {/* Y aquí definimos las pantallas del menú */}
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
