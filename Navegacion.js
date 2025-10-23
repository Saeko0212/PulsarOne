import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';

// ¡YA NO NECESITAMOS IMPORTAR EL HEADER AQUÍ!
// (Porque App.js ya lo está manejando)

// Tus 4 pantallas de Tabs
import Inicio from "./src/views/Inicio.js";
import Progreso from "./src/views/Progreso.js";
import Calendario from "./src/views/Calendario.js";
import Perfil from "./src/views/Perfil.js";

// ¡YA NO NECESITAMOS IMPORTAR LAS PANTALLAS OCULTAS AQUÍ!

const Tab = createBottomTabNavigator();
function Mytabs() {
    return (
        <Tab.Navigator
            initialRouteName='Inicio'
            // Estas son las opciones globales que ya teníamos (perfectas)
            screenOptions={{
                tabBarActiveTintColor: 'green',
                // ¡IMPORTANTE! Ocultamos el header de aquí
                headerShown: false,
                
                // (Tus opciones para arreglar el estilo de las tabs se quedan)
                tabBarLabelPosition: 'below-icon', 
                tabBarLabelStyle: {
                    fontSize: 10,
                    paddingBottom: 3,
                },
                tabBarStyle: {
                    height: 55,
                }
            }}>

            {/* --- SOLO TUS 4 PESTAÑAS VISIBLES --- */}
                <Tab.Screen name="Inicio" component={Inicio} 
                    options={{
                        tabBarLabel:'Inicio',
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="home" size={26} color={color} />
                        )
                    }}
                />
                <Tab.Screen name="Calendario" component={Calendario}
                    options={{
                        tabBarLabel:'Calendario',
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="calendar" size={26} color={color} />
                        )
                    }}
                />
                <Tab.Screen name="Progreso" component={Progreso}
                    options={{
                        tabBarLabel:'Progreso',
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="line-chart" size={26} color={color} />
                        )
                    }}
                />
                <Tab.Screen name="Perfil" component={Perfil}
                    options={{
                        tabBarLabel:'Perfil',
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="user" size={26} color={color} />
                        )
                    }}
                />
            {/* ¡YA NO ESTÁN LAS PANTALLAS OCULTAS AQUÍ! */}

        </Tab.Navigator>
    );
}

// ¡CAMBIO IMPORTANTE!
// Ya no exportamos el NavigationContainer.
// Exportamos el componente Mytabs para que App.js pueda usarlo.
export default Mytabs;