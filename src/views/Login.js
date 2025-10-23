import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../database/firebaseconfig.js";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const manejarLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa ambos campos.');
            return;
        }

        setLoading(true); // Inicia la carga

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // No es necesario llamar a onLoginSuccess() aquí si usamos onAuthStateChanged
        } catch (error) {
            console.log(error);
            let mensaje = 'Error al iniciar sesión.';

            if (error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
                mensaje = 'Correo o contraseña inválidos.';
            } else if (error.code === 'auth/user-not-found') {
                mensaje = 'Usuario no encontrado.';
            } else if (error.code === 'auth/wrong-password') {
                mensaje = 'Contraseña incorrecta.';
            }

            Alert.alert('Error', mensaje);
        } finally {
            setLoading(false); // Finaliza la carga
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Iniciar Sesión</Text>
            <TextInput
                style={styles.input}
                placeholder='Correo electrónico'
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder='Contraseña'
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
        <TouchableOpacity style={styles.boton} onPress={manejarLogin} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="#ffffff" />
            ) : (
                <Text style={styles.textoBoton}>Entrar</Text>
            )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: "white",
    },
    boton: {
        backgroundColor: "#2196F3",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    textoBoton: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Login;

