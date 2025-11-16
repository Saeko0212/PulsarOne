import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EstadisticasSesion = ({ 
  tiempoTotal, 
  series, 
  ejercicioActual, 
  rutinaSeleccionada 
}) => {

  let nombreEjercicio = "Ninguno";
  let progreso = "";

  if (ejercicioActual) {
    nombreEjercicio = ejercicioActual.nombre;
    
    if (rutinaSeleccionada && rutinaSeleccionada.ejercicios) {
      const index = rutinaSeleccionada.ejercicios.findIndex(e => e.idOriginal === ejercicioActual.id);
      if (index !== -1) {
        progreso = ` (${index + 1}/${rutinaSeleccionada.ejercicios.length})`;
      }
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Estadísticas de la Sesión</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Tiempo total:</Text>
        <Text style={styles.value}>{tiempoTotal}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Series completadas:</Text>
        <Text style={styles.value}>{series}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Ejercicio actual:</Text>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={styles.value} numberOfLines={1}>{nombreEjercicio}</Text>
            {progreso !== "" && <Text style={styles.progresoText}>{progreso}</Text>}
        </View>
      </View>

      {rutinaSeleccionada && (
         <View style={styles.row}>
          <Text style={styles.label}>Modo:</Text>
          <Text style={[styles.value, {color: '#28A745'}]}>{rutinaSeleccionada.nombre}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10, },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  label: { fontSize: 14, color: '#777', },
  value: { fontSize: 14, color: '#333', fontWeight: 'bold', textAlign: 'right', },
  progresoText: { fontSize: 12, color: '#28A745', fontWeight: '600' }
});

export default EstadisticasSesion;