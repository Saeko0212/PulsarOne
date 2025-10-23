import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AntDesign from '@expo/vector-icons/AntDesign';

import 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';

import { auth } from "./src/database/firebaseconfig.js";
import { signOut } from "firebase/auth";


import HeaderPersonalizado from "./src/components/HeaderPersonalizado.js";
import Inicio from "./src/views/Inicio.js";
import Progreso from "./src/views/Progreso.js";
import Calendario from "./src/views/Calendario.js";
import Perfil from "./src/views/Perfil.js";

const Tab = createBottomTabNavigator();
function Mytabs() {
    return (
        <Tab.Navigator
        initialRouteName= 'Inicio'
            screenOptions={{
                tabBarActiveTintColor: 'green',
                header: () => <HeaderPersonalizado />,
            }}>
            
            <Tab.Screen name="Inicio" component={Inicio} 
            options={{
                tabBarLabel:'Inicio',
                tabBarIcon:({color, size})=>(
                    <FontAwesome name="home" size={30} color={color} />
                )
            }}
            />
            <Tab.Screen name="Calendario" component={Calendario} 
            options={{
                tabBarLabel:'Calendario',
                tabBarIcon:({color, size})=>(
                    <FontAwesome name="calendar" size={30} color={color} />
                )
            }}
            />
            <Tab.Screen name="Progreso" component={Progreso} 
            options={{
                tabBarLabel:'Progreso',
                tabBarIcon:({color, size})=>(
                    <FontAwesome name="line-chart" size={30} color={color} />
                )
            }}
            />
            <Tab.Screen name="Perfil" component={Perfil} 
            options={{
                tabBarLabel:'Perfil',
                tabBarIcon:({color, size})=>(
                    <FontAwesome name="user" size={30} color={color} />
                )
            }}
            />
            <Tab.Screen 
                name="Logout"
                component={() => null} 
                options={{
                    tabBarLabel: 'Cerrar Sesión',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="logout" size={24} color={color} />
                    ),
                }}
                listeners={{
                    // Al presionar la pestaña, cerramos la sesión
                    tabPress: (e) => {
                        e.preventDefault(); // Prevenimos la navegación
                        signOut(auth);
                    },
                }}
            />

        </Tab.Navigator>
    );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
      <Mytabs />
    </NavigationContainer>
  );
}