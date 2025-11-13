import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const ProgressBar = ({ label, current, target, unit, icon, color, iconLib = "Ionicons" }) => {
  const progress = target > 0 ? Math.min((current / target), 1) : 0;
  const remaining = Math.max(target - current, 0);
  const widthPercentage = `${progress * 100}%`;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.labelRow}>
        <View style={styles.iconLabel}>
            {iconLib === "FontAwesome" ?
                <FontAwesome name={icon} size={20} color={color} /> :
             iconLib === "Ionicons" ? 
                <Ionicons name={icon} size={20} color={color} /> :
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            }
          <Text style={styles.progressLabel}>{label}</Text>
        </View>
        <Text style={styles.valuesText}>
          <Text style={styles.boldValue}>{current}{unit}</Text>/{target}{unit}
        </Text>
      </View>

      {}
      <View style={styles.track}>
        {}
        <View style={[styles.fill, { width: widthPercentage, backgroundColor: color }]} />
      </View>
      
      <Text style={styles.remainingText}>{remaining}{unit} restantes</Text>
    </View>
  );
};

const ResumenHoyNutricion = ({ 
  metas, 
  consumido, 
  onPressMetas, 
  onPressAgregar 
}) => {
  return (
    <View style={styles.container}>
      
      {}
      <View style={styles.topSection}>
        <View style={styles.textHeader}>
            <Text style={styles.mainTitle}>Nutrición</Text>
            <Text style={styles.subTitle}>Controla tus calorías y macros diarios</Text>
        </View>
        
        <View style={styles.buttonsRow}>
            {}
            <TouchableOpacity style={styles.btnMetas} onPress={onPressMetas}>
                <FontAwesome name="pencil" size={16} color="#333" />
                <Text style={styles.btnMetasText}>Metas</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity style={styles.btnAgregar} onPress={onPressAgregar}>
                <FontAwesome name="plus" size={16} color="#fff" />
                <Text style={styles.btnAgregarText}>Nueva Comida</Text>
            </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen de Hoy</Text>

        {}
        <ProgressBar 
          label="Calorías"
          current={consumido.calorias}
          target={metas.calorias}
          unit=""
          icon="flame-outline"
          color="#F97316" 
        />

        {}
        <ProgressBar 
          label="Proteína"
          current={consumido.proteina}
          target={metas.proteina}
          unit="g"
          icon="food-steak"
          color="#EF4444" 
          iconLib="MaterialCommunityIcons"
        />

        {}
        <ProgressBar 
          label="Carbohidratos"
          current={consumido.carbos}
          target={metas.carbos}
          unit="g"
          icon="cafe-outline" 
          color="#EAB308" 
        />

        {}
        <ProgressBar 
          label="Grasas"
          current={consumido.grasas}
          target={metas.grasas}
          unit="g"
          icon="water-outline"
          color="#3B82F6"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
  },
  topSection: {
    marginBottom: 20,
  },
  textHeader: {
    marginBottom: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    width: '60%', 
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  btnMetas: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  btnMetasText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  btnAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnAgregarText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: 'white',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3, 
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  progressContainer: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  valuesText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  boldValue: {
    color: '#111827',
    fontWeight: 'bold',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E7EB', 
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  }
});

export default ResumenHoyNutricion;