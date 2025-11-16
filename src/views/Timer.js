import React, { useState, useEffect } from 'react';
import { 
  View, StyleSheet, ScrollView, SafeAreaView, Text, 
  Alert, TouchableOpacity 
} from 'react-native';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../database/firebaseconfig.js';
import { onAuthStateChanged } from 'firebase/auth';

import SelectorPrograma from '../components/SelectorPrograma';
import SelectorDia from '../components/SelectorDia';
import PanelSeguimiento from '../components/PanelSeguimiento'; 
import TimerDescanso from '../components/TimerDescanso';
import TimersRapidos from '../components/TimersRapidos';
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

  const [programas, setProgramas] = useState([]);
  const [rutinasMap, setRutinasMap] = useState({});
  
  const [programaSeleccionado, setProgramaSeleccionado] = useState(null);
  const [listaDias, setListaDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const [ejerciciosDelDia, setEjerciciosDelDia] = useState([]); 
  const [indiceEjercicio, setIndiceEjercicio] = useState(0);
  const [seriesActuales, setSeriesActuales] = useState(1);
  const [datosEjercicioActual, setDatosEjercicioActual] = useState(null);
  const [totalSeriesCompletadas, setTotalSeriesCompletadas] = useState(0); 
  
  const [entrenamientoActivo, setEntrenamientoActivo] = useState(false);
  const [tiempoEntrenamiento, setTiempoEntrenamiento] = useState(0); 
  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [descansoConfigurado, setDescansoConfigurado] = useState(60);
  const [descansoActivo, setDescansoActivo] = useState(false);
  const [descansoTerminado, setDescansoTerminado] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if(user) {
        setUserId(user.uid);
        cargarDatos(user.uid);
      } else {
        setUserId(null);
        setProgramas([]);
        setRutinasMap({});
      }
    });
    return unsub;
  }, []);

  const cargarDatos = async (uid) => {
    try {
      const qProg = query(collection(db, "programas"), where("userId", "==", uid));
      const snapProg = await getDocs(qProg);
      setProgramas(snapProg.docs.map(d => ({ id: d.id, ...d.data() })));

      const qRut = query(collection(db, "rutinas"), where("userId", "==", uid));
      const snapRut = await getDocs(qRut);
      const mapa = {};
      snapRut.docs.forEach(doc => { mapa[doc.id] = doc.data(); });
      setRutinasMap(mapa);
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  const handleSelectPrograma = (id) => {
    const prog = programas.find(p => p.id === id);
    setProgramaSeleccionado(prog || null);
    setListaDias(prog ? Object.keys(prog.dias) : []);
    setDiaSeleccionado(null);
    resetUIParcial();
  };
  
  const handleSelectDia = (nombreDia) => {
    setDiaSeleccionado(nombreDia);
    if (programaSeleccionado && nombreDia) {
      const rutinaIds = programaSeleccionado.dias[nombreDia];
      let ejerciciosCombinados = [];
      for (const id of rutinaIds) {
        const rutina = rutinasMap[id];
        if (rutina && rutina.ejercicios) {
          ejerciciosCombinados = [...ejerciciosCombinados, ...rutina.ejercicios];
        }
      }
      setEjerciciosDelDia(ejerciciosCombinados);
    } else {
      setEjerciciosDelDia([]);
    }
    resetUIParcial();
  };
  
  useEffect(() => {
    if (entrenamientoActivo && ejerciciosDelDia.length > 0 && indiceEjercicio < ejerciciosDelDia.length) {
      const ejercicio = ejerciciosDelDia[indiceEjercicio];
      const info = parsearSeriesReps(ejercicio.seriesReps);
      setDatosEjercicioActual({
        nombre: ejercicio.nombre,
        metaSeries: info.series,
        metaReps: info.reps,
      });
    }
  }, [indiceEjercicio, ejerciciosDelDia, entrenamientoActivo]);

  useEffect(() => {
    let interval = null;
    if (entrenamientoActivo) {
      interval = setInterval(() => setTiempoEntrenamiento(t => t + 1), 1000);
    }
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
    if (!datosEjercicioActual) return;
    setDescansoConfigurado(segundosDescanso);
    setTiempoDescanso(segundosDescanso);
    setDescansoActivo(true);
    setTotalSeriesCompletadas(prev => prev + 1);

    if (seriesActuales < datosEjercicioActual.metaSeries) {
      setSeriesActuales(prev => prev + 1);
    } else {
      if (indiceEjercicio < ejerciciosDelDia.length - 1) {
        setTimeout(() => {
          setIndiceEjercicio(prev => prev + 1);
          setSeriesActuales(1);
          Alert.alert("¡Ejercicio Completado!", "Prepárate para el siguiente.");
        }, 500);
      } else {
        Alert.alert("¡Programa Finalizado!", "Has completado todos los ejercicios.", [
          { text: "Finalizar y Guardar", onPress: () => finalizarEntrenamiento() }
        ]);
      }
    }
  };
  const saltarEjercicio = () => {
    if (ejerciciosDelDia.length > 0 && indiceEjercicio < ejerciciosDelDia.length - 1) {
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
        resetUICompleto(); 
        return;
    }

    try {
      await addDoc(collection(db, "HistorialEntrenamientos"), {
        userId: userId,
        fecha: new Date(),
        duracionSegundos: tiempoEntrenamiento,
        duracionFormato: formatTiempo(tiempoEntrenamiento),
        seriesTotales: totalSeriesCompletadas,
        rutinaUsada: programaSeleccionado ? `${programaSeleccionado.nombre} - ${diaSeleccionado}` : "Libre",
        programaId: programaSeleccionado ? programaSeleccionado.id : null
      });
      Alert.alert("¡Excelente!", "Entrenamiento registrado en tu historial.");
    } catch (error) {
        console.error("Error guardando historial:", error);
        Alert.alert("Error", "No se pudo guardar el historial.");
    } finally {
        resetUICompleto();
    }
  };

  const resetUIParcial = () => {
    setIndiceEjercicio(0);
    setSeriesActuales(1);
    setDatosEjercicioActual(null);
  };

  const resetUICompleto = () => {
    setEntrenamientoActivo(false);
    setTiempoEntrenamiento(0);
    setTotalSeriesCompletadas(0);
    setProgramaSeleccionado(undefined); 
    setDiaSeleccionado(undefined); 
    setListaDias([]);
    setEjerciciosDelDia([]);
    resetUIParcial();
  };

  const handleIniciarDescanso = () => {
    if (entrenamientoActivo) {
      registrarSerieYDescansar(descansoConfigurado);
    } else {
      setTiempoDescanso(descansoConfigurado);
      setDescansoActivo(true);
    }
  };
  const handleReiniciarDescanso = () => {
    setDescansoActivo(false);
    setTiempoDescanso(0);
    setDescansoTerminado(false);
  };
  const handleTimerRapido = (seg) => {
    setDescansoConfigurado(seg);
    if(entrenamientoActivo) {
      registrarSerieYDescansar(seg);
    } else {
      setTiempoDescanso(seg);
      setDescansoActivo(true);
    }
  };

  
  const renderSetup = () => (
    <View style={styles.setupContainer}>
      <Text style={styles.headerTitle}>¡Listo para Entrenar!</Text>
      
      <SelectorPrograma
        programas={programas}
        programaId={programaSeleccionado ? programaSeleccionado.id : undefined}
        onSelect={handleSelectPrograma}
      />
      
      {programaSeleccionado && (
        <SelectorDia 
          dias={listaDias}
          diaSeleccionado={diaSeleccionado || undefined}
          onSelect={handleSelectDia}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.btnIniciar, (!programaSeleccionado || !diaSeleccionado) && styles.btnDisabled]}
        disabled={!programaSeleccionado || !diaSeleccionado}
        onPress={() => {
          if(ejerciciosDelDia.length === 0) {
            Alert.alert("Error", "No hay ejercicios en la rutina de este día.");
            return;
          }
          setEntrenamientoActivo(true);
          setIndiceEjercicio(0); 
          setSeriesActuales(1);
        }}
      >
        <Text style={styles.btnIniciarText}>INICIAR ENTRENAMIENTO</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEnCurso = () => (
    <View>
      {datosEjercicioActual && (
        <PanelSeguimiento 
          ejercicioNombre={datosEjercicioActual.nombre}
          serieActual={seriesActuales}
          metaSeries={datosEjercicioActual.metaSeries}
        />
      )}
      
      <TimerDescanso 
        tiempoFormateado={formatTiempo(tiempoDescanso)}
        isActivo={descansoActivo}
        terminado={descansoTerminado}
        onIniciar={handleIniciarDescanso}
        onReiniciar={handleReiniciarDescanso}
      />

      <TimersRapidos onStartRapido={handleTimerRapido} />

      <TouchableOpacity 
        style={styles.btnFinalizar} 
        onPress={() => {
          Alert.alert(
            "Finalizar Entrenamiento", 
            "¿Seguro que quieres terminar el entrenamiento?", 
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Finalizar", style: "destructive", onPress: finalizarEntrenamiento } 
            ]
          );
        }}
      >
        <Text style={styles.btnFinalizarText}>Finalizar Entrenamiento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {entrenamientoActivo ? renderEnCurso() : renderSetup()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 60 },
  setupContainer: {
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 20 
  },
  btnIniciar: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnIniciarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnDisabled: {
    backgroundColor: '#A9A9A9',
  },
  btnFinalizar: {
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  btnFinalizarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default Timer;