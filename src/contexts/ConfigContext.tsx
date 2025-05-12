import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ConfiguracionFormulario, Artista } from '../types';
import { supabase, checkSupabaseConnection, createRealtimeSubscription, cacheData, getCachedData } from '../lib/supabase';

interface ConfigContextType {
  config: ConfiguracionFormulario;
  updateConfig: (newConfig: Partial<ConfiguracionFormulario>) => Promise<void>;
  updateArtista: (id: string, updates: Partial<Artista>) => Promise<void>;
  addArtista: (artista: Artista) => Promise<void>;
  removeArtista: (id: string) => Promise<void>;
  connectionError: boolean;
  isLoading: boolean;
  retryConnection: () => void;
}

const defaultConfig: ConfiguracionFormulario = {
  nombreEstudio: 'Estudio de Tatuajes',
  direccionEstudio: 'Calle Principal #123, Santiago, Chile',
  preguntasSalud: [],
  artistas: [],
  textoConsentimiento: 'Yo, {Nombre Cliente}, con RUT {Rut Cliente}, de {Edad Cliente} años de edad, declaro ser la persona descrita como "CLIENTE" en este documento y autorizo al artista {Nombre Artista} de {Nombre Estudio} ubicado en {Direccion Estudio} para realizar el procedimiento de tatuaje...',
  textoTutorLegal: 'Yo, {Nombre Tutor} con cédula de identidad {Rut Tutor}, en mi calidad de {Parentesco Tutor} de {Nombre Cliente} {Apellidos Cliente} con RUT {Rut Cliente}, menor de edad ({Edad Cliente} años), autorizo que se le realice un tatuaje en {Nombre Estudio} ubicado en {Direccion Estudio}...',
  textosFooter: '¿Deseas un sistema como este? Dale clic acá',
  datosContacto: {
    nombre: 'Desarrollador Web',
    whatsapp: '+56 9 1234 5678',
    email: 'contacto@desarrollador.cl',
    instagram: '@desarrollador_web'
  },
  creamAftercare: 'CUIDADOS POST-TATUAJE CON CREMA\n\n1. Durante las primeras 2-3 horas:\n   - Mantén el vendaje original colocado por el artista.\n   - El tatuaje podría sangrar ligeramente, esto es normal.\n\n2. Después de 2-3 horas:\n   - Retira suavemente el vendaje.\n   - Lava el área con agua tibia y jabón neutro, sin frotar.\n   - Seca dando pequeños toques con una toalla limpia.\n\n3. Durante los siguientes 7-14 días:\n   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día.\n   - No cubras el tatuaje con vendajes adicionales.\n   - Evita rascarte, despegar costras o piel descamada.\n   - Evita la exposición directa al sol.\n   - Evita nadar en piscinas, mar o bañeras.\n   - Evita actividades que provoquen sudoración excesiva.\n\n4. Después de la cicatrización (2-3 semanas):\n   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.\n   - Mantén la piel hidratada.\n\n¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!',
  patchAftercare: 'CUIDADOS POST-TATUAJE CON PARCHE (SECOND SKIN)\n\n1. Parche inicial:\n   - Mantén el parche Second Skin colocado por el artista durante 24 horas (mínimo) a 5 días (máximo).\n   - Es normal ver fluidos acumulados debajo del parche, esto ayuda a la cicatrización.\n\n2. Removiendo el parche:\n   - Retíralo en la ducha con agua tibia para facilitar su desprendimiento.\n   - No lo arranques en seco para evitar dañar la piel.\n   - Lava suavemente el tatuaje con jabón neutro y agua tibia.\n\n3. Después de remover el parche:\n   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día durante 7-10 días.\n   - No apliques un nuevo parche a menos que el artista lo recomiende.\n   - Evita la exposición directa al sol.\n   - Evita nadar en piscinas, mar o bañeras hasta que el tatuaje esté completamente cicatrizado.\n\n4. Después de la cicatrización (2-3 semanas):\n   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.\n   - Mantén la piel hidratada.\n\n¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!'
};

const CONFIG_CACHE_KEY = 'app_config_data';
const CONFIG_CACHE_TTL = 3600; // 1 hora en segundos

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfiguracionFormulario>(() => {
    // Intentar cargar desde caché al iniciar
    const cachedConfig = getCachedData<ConfiguracionFormulario>(CONFIG_CACHE_KEY);
    return cachedConfig || defaultConfig;
  });
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5; // Aumentado para más persistencia

  // Función de backoff exponencial para reintentos
  const getRetryDelay = useCallback((attempt: number) => {
    const baseDelay = 1000; // 1 segundo
    const maxDelay = 30000; // 30 segundos
    const calculatedDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    // Añadir un poco de aleatoriedad (jitter) para evitar tormentas de solicitudes
    return calculatedDelay + Math.random() * 1000;
  }, []);

  // Cargar configuración inicial con mejoras
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando configuración desde Supabase...');
      
      // Intentar usar datos en caché primero si están disponibles
      const cachedConfig = getCachedData<ConfiguracionFormulario>(CONFIG_CACHE_KEY);
      const cachedConfigId = localStorage.getItem('app_config_id');
      
      if (cachedConfig && cachedConfigId) {
        console.log('Usando configuración en caché mientras verificamos conexión');
        setConfig(cachedConfig);
        setConfigId(cachedConfigId);
      }
      
      // Verificar conexión primero con un timeout
      const connectionPromise = checkSupabaseConnection();
      
      // Establecer un timeout para la verificación de conexión
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 7000); // 7 segundos de timeout (aumentado)
      });
      
      // Usar el resultado de la primera promesa que se resuelva
      const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (!isConnected) {
        console.error('No se pudo conectar a Supabase (timeout o error de conexión)');
        setConnectionError(true);
        
        // Si tenemos datos en caché, los usamos y reducimos la sensación de error
        if (cachedConfig) {
          console.log('Usando datos en caché debido a problemas de conexión');
          // No actualizamos setLoading aquí para permitir reintentos en segundo plano
          
          // Intentar nuevamente en segundo plano si no hemos superado el máximo de intentos
          if (retryCount < MAX_RETRIES) {
            const delay = getRetryDelay(retryCount);
            console.log(`Reintentando conectar en segundo plano (${retryCount + 1}/${MAX_RETRIES}) en ${delay}ms...`);
            setRetryCount(prev => prev + 1);
            setTimeout(loadConfig, delay);
          } else {
            console.log('Máximo de reintentos alcanzado, usando configuración en caché');
            setLoading(false);
          }
          return;
        }
        
        // Sin caché, reintentamos con backoff exponencial
        if (retryCount < MAX_RETRIES) {
          const delay = getRetryDelay(retryCount);
          console.log(`Reintentando conectar (${retryCount + 1}/${MAX_RETRIES}) en ${delay}ms...`);
          setRetryCount(prev => prev + 1);
          setTimeout(loadConfig, delay);
          return;
        } else {
          console.log('Máximo de reintentos alcanzado, usando configuración por defecto');
          setLoading(false);
          return;
        }
      }
      
      // Reiniciar el estado de error si la conexión fue exitosa
      setConnectionError(false);
      setRetryCount(0); // Reiniciar el contador de intentos
      
      // Utilizar AbortController para establecer un timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout (aumentado)
      
      try {
        // Buscar configuración existente
        const { data: configData, error: configError } = await supabase
          .from('config')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .abortSignal(signal);
        
        clearTimeout(timeoutId);
        
        if (configError) {
          console.error('Error al obtener la configuración:', configError);
          throw new Error(`Error al obtener configuración: ${configError.message}`);
        }
        
        console.log('Configuración obtenida:', configData);
        
        let currentConfig;
        let currentConfigId;
        
        // Si no hay configuración, crear una por defecto
        if (!configData || configData.length === 0) {
          console.log('No se encontró configuración, creando una por defecto...');
          
          const { data: newConfig, error: insertError } = await supabase
            .from('config')
            .insert({
              studio_name: defaultConfig.nombreEstudio,
              studio_address: defaultConfig.direccionEstudio,
              consent_text: defaultConfig.textoConsentimiento,
              tutor_consent_text: defaultConfig.textoTutorLegal,
              footer_text: defaultConfig.textosFooter,
              contact_info: defaultConfig.datosContacto,
              cream_aftercare: defaultConfig.creamAftercare,
              patch_aftercare: defaultConfig.patchAftercare
            })
            .select();
          
          if (insertError) {
            console.error('Error al crear configuración por defecto:', insertError);
            throw new Error(`Error al crear configuración: ${insertError.message}`);
          }
          
          console.log('Configuración por defecto creada:', newConfig);
          currentConfig = newConfig[0];
          currentConfigId = newConfig[0].id;
        } else {
          currentConfig = configData[0];
          currentConfigId = configData[0].id;
        }
        
        setConfigId(currentConfigId);
        localStorage.setItem('app_config_id', currentConfigId);
        console.log('ConfigID establecido:', currentConfigId);
        
        // Utilizar AbortController para los artistas
        const artistsController = new AbortController();
        const artistsSignal = artistsController.signal;
        const artistsTimeoutId = setTimeout(() => artistsController.abort(), 15000); // 15s timeout (aumentado)
        
        try {
          // Cargar artistas
          const { data: artistsData, error: artistsError } = await supabase
            .from('artists')
            .select('*')
            .eq('config_id', currentConfigId)
            .abortSignal(artistsSignal);
          
          clearTimeout(artistsTimeoutId);
          
          if (artistsError) {
            console.error('Error al cargar artistas:', artistsError);
            throw new Error(`Error al cargar artistas: ${artistsError.message}`);
          }
          
          console.log('Artistas cargados:', artistsData);
          const artists = artistsData ? artistsData.map(artist => ({
            id: artist.id,
            nombre: artist.name,
            activo: artist.active,
            imagen: artist.image_url
          })) : [];
          
          // Configuración completa para actualizar el estado y guardar en caché
          const completeConfig = {
            nombreEstudio: currentConfig.studio_name,
            direccionEstudio: currentConfig.studio_address,
            textoConsentimiento: currentConfig.consent_text,
            textoTutorLegal: currentConfig.tutor_consent_text,
            textosFooter: currentConfig.footer_text,
            datosContacto: currentConfig.contact_info,
            artistas: artists,
            preguntasSalud: [], // No cargamos las preguntas de salud ya que ahora son fijas
            creamAftercare: currentConfig.cream_aftercare,
            patchAftercare: currentConfig.patch_aftercare
          };
          
          // Guardar en caché para uso offline
          cacheData(CONFIG_CACHE_KEY, completeConfig, CONFIG_CACHE_TTL);
          
          // Actualizar el estado con los datos cargados
          setConfig(completeConfig);
          
          console.log('Estado de configuración actualizado correctamente');
        } catch (artistsError) {
          clearTimeout(artistsTimeoutId);
          if (artistsError.name === 'AbortError') {
            console.error('Timeout al cargar artistas');
            throw new Error('Timeout al cargar artistas. La operación ha tardado demasiado.');
          }
          throw artistsError;
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.error('Timeout al cargar configuración');
          throw new Error('Timeout al cargar configuración. La operación ha tardado demasiado.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
      setConnectionError(true);
      // Si tenemos datos en caché, los mantenemos
    } finally {
      setLoading(false);
    }
  }, [retryCount, getRetryDelay]);

  // Función para forzar reintento de conexión
  const retryConnection = useCallback(() => {
    console.log('Forzando reintento de conexión...');
    setRetryCount(0); // Reiniciar contador de intentos
    setConnectionError(false); // Resetear estado de error
    loadConfig(); // Intentar cargar datos nuevamente
  }, [loadConfig]);
  
  useEffect(() => {
    loadConfig();
    
    // Configurar suscripciones en tiempo real a cambios en las tablas
    const configSubscription = createRealtimeSubscription('config', () => {
      console.log('Actualización detectada en la tabla config, recargando datos...');
      loadConfig();
    });
    
    const artistsSubscription = createRealtimeSubscription('artists', () => {
      console.log('Actualización detectada en la tabla artists, recargando datos...');
      if (configId) {
        // Verificar conexión antes de intentar cargar artistas
        checkSupabaseConnection().then(isConnected => {
          if (!isConnected) {
            console.log('No hay conexión para cargar artistas actualizados');
            return;
          }
          
          // Sólo cargar artistas sin recargar toda la configuración
          supabase
            .from('artists')
            .select('*')
            .eq('config_id', configId)
            .then(({ data, error }) => {
              if (error) {
                console.error('Error al recargar artistas:', error);
                return;
              }
              
              const artists = data ? data.map(artist => ({
                id: artist.id,
                nombre: artist.name,
                activo: artist.active,
                imagen: artist.image_url
              })) : [];
              
              // Actualizar estado y caché
              setConfig(prev => {
                const updated = {
                  ...prev,
                  artistas: artists
                };
                
                // Actualizar caché con los nuevos datos
                cacheData(CONFIG_CACHE_KEY, updated, CONFIG_CACHE_TTL);
                
                return updated;
              });
            });
        });
      }
    });
    
    // Limpiar suscripciones al desmontar
    return () => {
      configSubscription.unsubscribe();
      artistsSubscription.unsubscribe();
    };
  }, [loadConfig, configId]);

  // Actualizar configuración general
  const updateConfig = async (newConfig: Partial<ConfiguracionFormulario>) => {
    if (!configId) {
      console.error('Error: No hay ID de configuración disponible');
      throw new Error('No hay configuración disponible para actualizar');
    }
    
    // Verificar conexión primero
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('No se puede conectar a Supabase. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
    
    console.log('Actualizando configuración con ID:', configId);
    console.log('Nuevos datos:', newConfig);
    
    try {
      // Actualizar estado local primero para una respuesta inmediata al usuario
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      
      // Guardar en caché de inmediato para persistencia offline
      cacheData(CONFIG_CACHE_KEY, updatedConfig, CONFIG_CACHE_TTL);
      
      // Utilizar AbortController para establecer un timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout (aumentado)
      
      try {
        const { data, error } = await supabase
          .from('config')
          .update({
            studio_name: newConfig.nombreEstudio,
            studio_address: newConfig.direccionEstudio,
            consent_text: newConfig.textoConsentimiento,
            tutor_consent_text: newConfig.textoTutorLegal,
            footer_text: newConfig.textosFooter,
            contact_info: newConfig.datosContacto,
            cream_aftercare: newConfig.creamAftercare,
            patch_aftercare: newConfig.patchAftercare,
            updated_at: new Date().toISOString()
          })
          .eq('id', configId)
          .select()
          .abortSignal(signal);
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error al actualizar la configuración en Supabase:', error);
          throw new Error(`Error al guardar configuración: ${error.message}`);
        }
        
        console.log('Configuración actualizada en Supabase:', data);
        console.log('Configuración actualizada correctamente');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado al actualizar la configuración. Por favor intente nuevamente.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error en updateConfig:', error);
      
      // Re-verificar conexión para actualizar estado
      const stillConnected = await checkSupabaseConnection();
      if (!stillConnected) {
        setConnectionError(true);
      }
      
      throw error;
    }
  };

  // Actualizar artista
  const updateArtista = async (id: string, updates: Partial<Artista>) => {
    // Verificar conexión primero
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('No se puede conectar a Supabase. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
    
    console.log('Actualizando artista con ID:', id);
    console.log('Nuevos datos:', updates);
    
    try {
      // Actualizar estado local primero para una respuesta inmediata
      setConfig(prevConfig => {
        const updatedConfig = {
          ...prevConfig,
          artistas: prevConfig.artistas.map(a =>
            a.id === id ? { ...a, ...updates } : a
          )
        };
        
        // Actualizar caché
        cacheData(CONFIG_CACHE_KEY, updatedConfig, CONFIG_CACHE_TTL);
        
        return updatedConfig;
      });
      
      // Utilizar AbortController para establecer un timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout (aumentado)
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .update({
            name: updates.nombre,
            active: updates.activo,
            image_url: updates.imagen,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .abortSignal(signal);
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error al actualizar el artista en Supabase:', error);
          throw new Error(`Error al actualizar artista: ${error.message}`);
        }
        
        console.log('Artista actualizado en Supabase:', data);
        console.log('Artista actualizado correctamente');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado al actualizar el artista. Por favor intente nuevamente.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error en updateArtista:', error);
      
      // Re-verificar conexión para actualizar estado
      const stillConnected = await checkSupabaseConnection();
      if (!stillConnected) {
        setConnectionError(true);
      }
      
      throw error;
    }
  };

  // Añadir artista
  const addArtista = async (artista: Artista) => {
    if (!configId) {
      console.error('Error: No hay ID de configuración disponible');
      throw new Error('No hay configuración disponible');
    }
    
    // Verificar conexión primero
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('No se puede conectar a Supabase. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
    
    console.log('Añadiendo nuevo artista para configId:', configId);
    console.log('Datos del artista:', artista);
    
    try {
      // Utilizar AbortController para establecer un timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout (aumentado)
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .insert({
            config_id: configId,
            name: artista.nombre,
            active: artista.activo,
            image_url: artista.imagen
          })
          .select()
          .abortSignal(signal);
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Error al añadir el artista en Supabase:', error);
          throw new Error(`Error al añadir artista: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('No se recibieron datos al crear el artista');
        }
        
        console.log('Artista añadido en Supabase:', data);
        
        const newArtista = {
          id: data[0].id,
          nombre: data[0].name,
          activo: data[0].active,
          imagen: data[0].image_url
        };
        
        // Actualizar estado local
        setConfig(prevConfig => {
          const updatedConfig = {
            ...prevConfig,
            artistas: [...prevConfig.artistas, newArtista]
          };
          
          // Actualizar caché
          cacheData(CONFIG_CACHE_KEY, updatedConfig, CONFIG_CACHE_TTL);
          
          return updatedConfig;
        });
        
        console.log('Artista añadido correctamente');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado al añadir el artista. Por favor intente nuevamente.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error en addArtista:', error);
      
      // Re-verificar conexión para actualizar estado
      const stillConnected = await checkSupabaseConnection();
      if (!stillConnected) {
        setConnectionError(true);
      }
      
      throw error;
    }
  };

  // Eliminar artista
  const removeArtista = async (id: string) => {
    // Verificar conexión primero
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('No se puede conectar a Supabase. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }
    
    console.log('Eliminando artista con ID:', id);
    
    try {
      // Utilizar AbortController para establecer un timeout para la verificación
      const checkController = new AbortController();
      const checkSignal = checkController.signal;
      const checkTimeoutId = setTimeout(() => checkController.abort(), 10000); // 10s timeout (aumentado)
      
      try {
        // Primero verificar si el artista tiene consentimientos asociados
        const { data: consents, error: consentsError } = await supabase
          .from('consents')
          .select('id')
          .eq('artist_id', id)
          .limit(1)
          .abortSignal(checkSignal);
        
        clearTimeout(checkTimeoutId);
        
        if (consentsError) {
          console.error('Error al verificar consentimientos asociados:', consentsError);
          throw new Error(`Error al verificar consentimientos: ${consentsError.message}`);
        }
        
        // Si hay consentimientos asociados, no permitir la eliminación
        if (consents && consents.length > 0) {
          throw new Error('No se puede eliminar el artista porque tiene consentimientos asociados. Por favor, archive o elimine los consentimientos primero.');
        }
        
        // Actualizar estado local primero para una respuesta inmediata
        setConfig(prevConfig => {
          const updatedConfig = {
            ...prevConfig,
            artistas: prevConfig.artistas.filter(a => a.id !== id)
          };
          
          // Actualizar caché
          cacheData(CONFIG_CACHE_KEY, updatedConfig, CONFIG_CACHE_TTL);
          
          return updatedConfig;
        });
        
        // Si no hay consentimientos asociados, proceder con la eliminación
        const deleteController = new AbortController();
        const deleteSignal = deleteController.signal;
        const deleteTimeoutId = setTimeout(() => deleteController.abort(), 10000); // 10s timeout (aumentado)
        
        try {
          const { error } = await supabase
            .from('artists')
            .delete()
            .eq('id', id)
            .abortSignal(deleteSignal);
          
          clearTimeout(deleteTimeoutId);
          
          if (error) {
            console.error('Error al eliminar el artista en Supabase:', error);
            throw new Error(`Error al eliminar artista: ${error.message}`);
          }
          
          console.log('Artista eliminado de Supabase');
          console.log('Artista eliminado correctamente');
        } catch (deleteError) {
          clearTimeout(deleteTimeoutId);
          if (deleteError.name === 'AbortError') {
            throw new Error('Tiempo de espera agotado al eliminar el artista. Por favor intente nuevamente.');
          }
          throw deleteError;
        }
      } catch (checkError) {
        clearTimeout(checkTimeoutId);
        if (checkError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado al verificar los consentimientos. Por favor intente nuevamente.');
        }
        throw checkError;
      }
    } catch (error) {
      console.error('Error en removeArtista:', error);
      
      // Re-verificar conexión para actualizar estado
      const stillConnected = await checkSupabaseConnection();
      if (!stillConnected) {
        setConnectionError(true);
      }
      
      throw error;
    }
  };

  return (
    <ConfigContext.Provider value={{
      config,
      updateConfig,
      updateArtista,
      addArtista,
      removeArtista,
      connectionError,
      isLoading: loading,
      retryConnection
    }}>
      {!loading && children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig debe usarse dentro de un ConfigProvider');
  }
  return context;
};