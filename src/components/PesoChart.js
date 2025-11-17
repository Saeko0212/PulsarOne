import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const PesoChart = ({ data }) => {
  const cleanData = data.filter(item => 
    item.fecha && item.fecha.toDate && typeof item.peso === 'number'
  );

  if (cleanData.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Evolución del Peso</Text>
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>Necesitas al menos 2 mediciones válidas para ver el gráfico.</Text>
        </View>
      </View>
    );
  }

  const chartKitData = {
    labels: cleanData.map(item => 
      item.fecha.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' })
    ),
    datasets: [
      {
        data: cleanData.map(item => item.peso), 
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, 
        strokeWidth: 3
      }
    ],
    legend: ["Peso (kg)"] 
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Evolución del Peso</Text>
      
      <LineChart
        data={chartKitData}
        width={screenWidth - 70} 
        height={220}
        yAxisLabel=""
        yAxisSuffix=" kg"
        withVerticalLines={false} 
        withInnerLines={false}
        fromZero={false}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1, 
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, 
          labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, 
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6', 
            strokeWidth: '2',
            stroke: '#007bff'
          }
        }}
        bezier 
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center', 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start', 
  },
  emptyView: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

export default PesoChart;