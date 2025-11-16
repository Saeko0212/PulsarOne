import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, View } from 'react-native';
import { auth, db } from '../database/firebaseconfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; 

import HomeHeader from '../components/HomeHeader';
import StatsGrid from '../components/StatsGrid';
import RecentWorkouts from '../components/RecentWorkouts';
import MotivationCard from '../components/MotivationCard';

const Inicio = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 
  
  const [weeklyWorkoutsCount, setWeeklyWorkoutsCount] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(6); 

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, 'PerfilDatos', currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#28a745" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {}
        <HomeHeader userData={userData} />

        {}
        <StatsGrid onWeeklyDaysUpdate={setWeeklyWorkoutsCount} onWeeklyGoalUpdate={setWeeklyGoal} />

        {}
        <RecentWorkouts />

        {}
        <MotivationCard weeklyWorkouts={weeklyWorkoutsCount} weeklyGoal={weeklyGoal} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Inicio;