import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { db } from '../database/firebaseconfig.js';
import { collection, getDocs } from 'firebase/firestore';

const MotivationCard = ({ weeklyWorkouts, weeklyGoal }) => { 
  const [quote, setQuote] = useState('El éxito no es final, el fracaso no es fatal: es el coraje para continuar lo que cuenta.');
  const totalDays = weeklyGoal || 6;
  const progressPercentage = totalDays > 0 ? (weeklyWorkouts / totalDays) * 100 : 0;
  
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const colRef = collection(db, 'Motivaciondia');
        const snapshot = await getDocs(colRef);
        
        if (!snapshot.empty) {
          const docs = snapshot.docs;
          const randomIndex = Math.floor(Math.random() * docs.length);
          const randomData = docs[randomIndex].data();
          if (randomData.frase) {
            setQuote(randomData.frase);
          }
        }
      } catch (error) {
        console.log("Error fetching quote:", error);
      }
    };
    
    fetchQuote();
  }, []);

  return (
    <LinearGradient
      colors={['#4caf50', '#2e7d32']}
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 0 }}   
      style={styles.card}>
      <View style={styles.header}>
        {}
        <Image 
          source={require('../Image/Logo.png')} 
          style={styles.logoImage} 
        />
        
        <View style={{marginLeft: 10}}>
           <Text style={styles.cardTitle}>💪Motivación del día</Text>
           <Text style={styles.cardBrand}>PulsarOne</Text>
        </View>
      </View>

      <Text style={styles.quoteText}>"{quote}"</Text>

      {}
      <View style={styles.progressSection}>
         <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>Progreso semanal</Text>
            <Text style={styles.progressLabelText}>{weeklyWorkouts}/{totalDays} días</Text> 
         </View>
         <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
         </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12, 
    padding: 20,
    marginTop: 15,
    marginBottom: 30,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logoImage: {
    width: 40, 
    height: 40, 
    resizeMode: 'contain', 
    marginRight: 10,
  },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardBrand: { color: '#e0e0e0', fontSize: 10 },
  quoteText: { color: '#fff', fontSize: 16, fontStyle: 'italic', marginBottom: 20, lineHeight: 22 },
  progressSection: { marginTop: 10 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabelText: { color: '#e0e0e0', fontSize: 12 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progressSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 15, 
  },
});

export default MotivationCard;