import React from 'react';
import { 
  View, Text, Modal, StyleSheet, FlatList, TouchableOpacity, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ComidasHoy = ({ visible, onClose, comidas }) => {

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Desayuno': return { bg: '#FFFBEB', text: '#D97706' }; 
      case 'Almuerzo': return { bg: '#ECFDF5', text: '#059669' }; 
      case 'Cena': return { bg: '#FEE2E2', text: '#DC2626' }; 
      case 'Merienda': return { bg: '#E0F2FE', text: '#0284C7' }; 
      case 'Media Mañana': return { bg: '#F3E8FF', text: '#7C3AED' }; 
      case 'Post-Entrenamiento': return { bg: '#FCE7F3', text: '#DB2777' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const renderCard = ({ item }) => {
    const colors = getTipoColor(item.tipo);

    return (
      <View style={styles.card}>
        {}
        <View style={styles.cardHeader}>
          <View style={styles.infoContainer}>
            <Text style={styles.foodName}>{item.nombre}</Text>
            <View style={[styles.tag, { backgroundColor: colors.bg }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{item.tipo}</Text>
            </View>
          </View>

          {}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <Text style={styles.timeText}>{item.hora}</Text>

        {}
        <View style={styles.macrosContainer}>
          {}
          <View style={[styles.macroBox, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="flame-outline" size={16} color="#EF4444" />
            <Text style={styles.macroValue}>{item.calorias}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>

          {}
          <View style={[styles.macroBox, { backgroundColor: '#FEF2F2' }]}>
            <MaterialCommunityIcons name="food-steak" size={16} color="#EF4444" />
            <Text style={styles.macroValue}>{item.proteina}g</Text>
            <Text style={styles.macroLabel}>proteína</Text>
          </View>

          {}
          <View style={[styles.macroBox, { backgroundColor: '#FEF9C7' }]}>
            <Ionicons name="cafe-outline" size={16} color="#EAB308" />
            <Text style={styles.macroValue}>{item.carbos}g</Text>
            <Text style={styles.macroLabel}>carbos</Text>
          </View>

          {}
          <View style={[styles.macroBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="water-outline" size={16} color="#3B82F6" />
            <Text style={styles.macroValue}>{item.grasas}g</Text>
            <Text style={styles.macroLabel}>grasas</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historial de Hoy</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {comidas.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="food-off-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No hay comidas registradas hoy.</Text>
            </View>
          ) : (
            <FlatList
              data={comidas}
              keyExtractor={(item) => item.id}
              renderItem={renderCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: '#F9FAFB', 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBox: {
    width: '23%', 
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },
  macroLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
  }
});

export default ComidasHoy;