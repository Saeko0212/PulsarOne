// Navegacion.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// Tus 4 pantallas de Tabs
import Inicio from "../views/Inicio.js";
import Progreso from "../views/Progreso.js";
import Calendario from "../views/Calendario.js";
import Perfil from "../views/Perfil.js";

const Tab = createBottomTabNavigator();

function Mytabs() {
    
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName='Inicio'
            screenOptions={{
                tabBarActiveTintColor: 'green',
                headerShown: false, 
                
                tabBarLabelStyle: {
                    fontSize: 10,
                    paddingBottom: 3, 
                },
                tabBarStyle: {
                    height: 55 + insets.bottom, 
                    paddingBottom: insets.bottom, 
                    paddingTop: 5, 
                }
            }}>
            
            {}
            <Tab.Screen name="Inicio" component={Inicio} 
                options={{
                    tabBarLabel:'Inicio',
                    tabBarIcon:({color, size})=>(
                        <FontAwesome name="home" size={26} color={color} />
                    )
                }}
            />
            <Tab.Screen name="Calendario" component={Calendario} 
                options={{
                    tabBarLabel:'Calendario',
                    tabBarIcon:({color, size})=>(
                        <FontAwesome name="calendar" size={26} color={color} />
                    )
                }}
            />
            <Tab.Screen name="Progreso" component={Progreso} 
                options={{
                    tabBarLabel:'Progreso',
                    tabBarIcon:({color, size})=>(
                        <FontAwesome name="line-chart" size={26} color={color} />
                    )
                }}
            />
            <Tab.Screen name="Perfil" component={Perfil} 
                options={{
                    tabBarLabel:'Perfil',
                    tabBarIcon:({color, size})=>(
                        <FontAwesome name="user" size={26} color={color} />
                    )
                }}
            />
            
        </Tab.Navigator>
    );
}
export default Mytabs;