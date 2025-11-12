// src/database/firebaseconfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; 
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Tus credenciales de Firebase van aquí
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar Auth con persistencia condicional
// Esto soluciona el error en la web
const auth = Platform.OS === 'web'
  ? getAuth(app) // Para web, getAuth es suficiente
  : initializeAuth(app, { // Para nativo, se necesita persistencia
      persistence: getReactNativePersistence(AsyncStorage)
    });

export { db, auth };
