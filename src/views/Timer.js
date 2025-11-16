import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text, Alert } from 'react-native';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { onAuthStateChanged } from 'firebase/auth';

import CronometroEntrenamiento from '../components/CronometroEntrenamiento';
import SelectorRutina from '../components/SelectorRutina';
import PanelSeguimiento from '../components/PanelSeguimiento';
import TimerDescanso from '../components/TimerDescanso';
import ConfirmacionModal from '../components/ConfirmacionModal';

const formatTiempo = (totalSegundos) => {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
};

const parsearSeriesReps = (texto) => {
  if (!texto) return { series: 3, reps: "-" }; 
  
  const matchSeries = texto.match(/^(\d+)/); 
  const series = matchSeries ? parseInt(matchSeries[0]) : 3;

  let reps = texto.replace(/^\d+\s*[xX\s]\s*/, ''); 
  if (reps === texto) reps = "-"; 

  return { series, reps };
};

const Timer = () => {
  const [userId, setUserId] = useState(null);

  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);

  const [entrenamientoActivo, setEntrenamientoActivo] = useState(false);
  const [tiempoEntrenamiento, setTiempoEntrenamiento] = useState(0);

  const [indiceEjercicio, setIndiceEjercicio] = useState(0); 
  const [seriesActuales, setSeriesActuales] = useState(1); 
  const [datosEjercicioActual, setDatosEjercicioActual] = useState(null); 
  const [totalSeriesCompletadas, setTotalSeriesCompletadas] = useState(0); 
  
  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [descansoConfigurado, setDescansoConfigurado] = useState(60);
  const [descansoActivo, setDescansoActivo] = useState(false);
  const [descansoTerminado, setDescansoTerminado] = useState(false);

  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [modalFinRutinaVisible, setModalFinRutinaVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        cargarRutinas(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const cargarRutinas = async (uid) => {
    try {
      const q = query(collection(db, "rutinas"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRutinas(lista);
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    }
  };

  useEffect(() => {
    if (rutinaSeleccionada && rutinaSeleccionada.ejercicios && rutinaSeleccionada.ejercicios.length > 0) {
      const ejercicio = rutinaSeleccionada.ejercicios[indiceEjercicio];
      if (ejercicio) {
        const info = parsearSeriesReps(ejercicio.seriesReps);
        setDatosEjercicioActual({
          nombre: ejercicio.nombre,
          metaSeries: info.series,
          metaReps: info.reps,
          idOriginal: ejercicio.idOriginal
        });
      }
    }
  }, [indiceEjercicio, rutinaSeleccionada]);

  useEffect(() => {
    let interval = null;
    if (entrenamientoActivo) interval = setInterval(() => setTiempoEntrenamiento(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [entrenamientoActivo]);

  useEffect(() => {
    let interval = null;
    if (descansoActivo) {
      setDescansoTerminado(false);
      interval = setInterval(() => {
        setTiempoDescanso(t => {
          if (t <= 1) {
            clearInterval(interval);
            setDescansoActivo(false);
            setDescansoTerminado(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [descansoActivo]);

  
  const registrarSerieYDescansar = (segundosDescanso) => {
    setDescansoConfigurado(segundosDescanso);
    setTiempoDescanso(segundosDescanso);
    setDescansoActivo(true);
    setDescansoTerminado(false);

    setTotalSeriesCompletadas(prev => prev + 1);

    if (rutinaSeleccionada && datosEjercicioActual) {
      if (seriesActuales < datosEjercicioActual.metaSeries) {
        setSeriesActuales(prev => prev + 1);
      } else {
        if (indiceEjercicio < rutinaSeleccionada.ejercicios.length - 1) {
          setTimeout(() => {
            setIndiceEjercicio(prev => prev + 1);
            setSeriesActuales(1); 
            Alert.alert("¡Ejercicio Completado!", "Prepárate para el siguiente.");
          }, 500); 
        } else {
          setModalFinRutinaVisible(true);
        }
      }
    }
  };

  const saltarEjercicio = () => {
    if (rutinaSeleccionada && indiceEjercicio < rutinaSeleccionada.ejercicios.length - 1) {
      setIndiceEjercicio(prev => prev + 1);
      setSeriesActuales(1);
    } else {
      Alert.alert("Aviso", "Este es el último ejercicio.");
    }
  };

  const finalizarEntrenamiento = async () => {
    setEntrenamientoActivo(false);
    setDescansoActivo(false);

    if (!userId || tiempoEntrenamiento < 10) {
        resetUI();
        return;
    }

    try {
      await addDoc(collection(db, "HistorialEntrenamientos"), {
        userId: userId,
        fecha: new Date(),
        duracionSegundos: tiempoEntrenamiento,
        duracionFormato: formatTiempo(tiempoEntrenamiento),
        seriesTotales: totalSeriesCompletadas,
        rutinaUsada: rutinaSeleccionada ? rutinaSeleccionada.nombre : "Libre",
        rutinaId: rutinaSeleccionada ? rutinaSeleccionada.id : null
      });
      Alert.alert("¡Excelente!", "Entrenamiento registrado en tu historial.");
      resetUI();
    } catch (error) {
      console.error("Error guardando:", error);
      Alert.alert("Error", "No se pudo guardar el historial");
    }
  };

  const resetUI = () => {
    setTiempoEntrenamiento(0);
    setIndiceEjercicio(0);
    setSeriesActuales(1);
    setTotalSeriesCompletadas(0);
    setRutinaSeleccionada(null); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Timer de Entrenamiento</Text>
        
        {}
        <CronometroEntrenamiento
          tiempo={formatTiempo(tiempoEntrenamiento)}
          isActivo={entrenamientoActivo}
          onIniciar={() => {
             if(!rutinaSeleccionada) {
                Alert.alert("Atención", "Selecciona una rutina primero para iniciar el modo guiado.");
                return;
             }
             setEntrenamientoActivo(true);
          }}
          onDetener={() => setModalConfirmacionVisible(true)}
        />

        {}
        {!entrenamientoActivo ? (
            <SelectorRutina 
              rutinas={rutinas}
              rutinaId={rutinaSeleccionada ? rutinaSeleccionada.id : null}
              onSelect={(id) => {
                  const r = rutinas.find(item => item.id === id);
                  setRutinaSeleccionada(r || null);
                  setIndiceEjercicio(0);
                  setSeriesActuales(1);
              }}
            />
        ) : (
            datosEjercicioActual && (
                <PanelSeguimiento 
                    ejercicioNombre={datosEjercicioActual.nombre}
                    progresoEjercicios={`Ejercicio ${indiceEjercicio + 1} de ${rutinaSeleccionada.ejercicios.length}`}
                    progresoSeries={`Serie ${seriesActuales}`}
                    metaSeries={datosEjercicioActual.metaSeries}
                    metaReps={datosEjercicioActual.metaReps}
                    onSiguienteEjercicio={saltarEjercicio}
                />
            )
        )}

        <View style={styles.divider} />

        {}
        <TimerDescanso 
          tiempo={formatTiempo(tiempoDescanso)}
          configurado={descansoConfigurado}
          isActivo={descansoActivo}
          terminado={descansoTerminado}
          onAjustar={(val) => setDescansoConfigurado(p => Math.max(15, p + val))}
          onIniciar={() => {
              if(entrenamientoActivo) {
                  registrarSerieYDescansar(descansoConfigurado);
              } else {
                  setTiempoDescanso(descansoConfigurado);
                  setDescansoActivo(true);
              }
          }}
          onReiniciar={() => {
            setDescansoActivo(false);
            setTiempoDescanso(0);
          }}
        />

        {}
        <ConfirmacionModal
          isVisible={modalConfirmacionVisible}
          onClose={() => setModalConfirmacionVisible(false)}
          onConfirm={() => {
            setModalConfirmacionVisible(false);
            finalizarEntrenamiento();
          }}
          title="Finalizar Entrenamiento"
          message="¿Deseas terminar y guardar la sesión actual en tu historial?"
          confirmText="Finalizar"
          isDestructive={true}
        />

        {}
        <ConfirmacionModal
          isVisible={modalFinRutinaVisible}
          onClose={() => setModalFinRutinaVisible(false)}
          onConfirm={() => {
            setModalFinRutinaVisible(false);
            finalizarEntrenamiento();
          }}
          title="¡Rutina Completada!"
          message="¡Felicidades! Has completado todos los ejercicios. ¿Guardamos la sesión?"
          confirmText="Guardar Sesión"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 20, paddingBottom: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#DDD', marginVertical: 25 }
});

export default Timer;