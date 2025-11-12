import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EjerciciosFavoritos = ({ esFavorito, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle}>
      <Ionicons 
        name={esFavorito ? "heart" : "heart-outline"} 
        size={24} 
        color={esFavorito ? "#E74C3C" : "#999"} 
      />
    </TouchableOpacity>
  );
};

export default EjerciciosFavoritos;