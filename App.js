import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { View } from "react-native";
import { auth } from "./src/database/firebaseconfig.js";
import Login from "./src/views/Login.js";
import Navegacion from './Navegacion.js';

export default function App() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Escucha los cambios en la autenticación (login/logout)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
        });
        return unsubscribe;
    }, []);

    if (!usuario) {
        // Si no hay usuario autenticado, mostrar login
        return <Login />;

    }

    // Si hay usuario autenticado, mostrar la navegación completa
    return <Navegacion />;
}
