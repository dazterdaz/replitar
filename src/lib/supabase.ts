import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase');
  throw new Error('Missing Supabase environment variables');
}

// Función para verificar si estamos en modo offline para testing o si hemos detectado problemas de red
const isOfflineMode = () => {
  return localStorage.getItem('app_offline_mode') === 'true' || 
         localStorage.getItem('app_network_unreachable') === 'true';
};

// Cache para almacenar el último estado de conectividad
let lastConnectionStatus = {
  isConnected: false,
  timestamp: 0
};

// Configuración de reintentos con backoff exponencial - Valores aumentados
const RETRY_SETTINGS = {
  initialDelay: 2000,  // Tiempo inicial aumentado a 2000ms
  maxDelay: 120000,    // Tiempo máximo aumentado a 120000ms (2 minutos)
  maxRetries: 10,      // Número máximo de reintentos aumentado a 10
  factor: 2            // Factor de incremento exponencial
};

// Función de ayuda para esperar un tiempo específico
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Añadimos opciones de configuración adicionales para mejorar la conexión
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
      },
      // Mejorar el manejo de errores en fetch
      fetch: (...args) => {
        // Si estamos en modo offline, rechazar todas las peticiones
        if (isOfflineMode()) {
          console.log('Operación de Supabase bloqueada: modo offline activado');
          return Promise.reject(new Error('Aplicación en modo offline'));
        }
        
        // Añadir timeout a las peticiones - AUMENTADO a 60s
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        // Reemplazar el primer argumento (URL) con un objeto que incluya signal
        if (typeof args[0] === 'string') {
          args[1] = { ...args[1], signal };
        } else if (args[0] instanceof Request) {
          args[0] = new Request(args[0], { signal });
        }
        
        return fetch(...args)
          .then(response => {
            clearTimeout(timeoutId);
            
            // Restablecer el estado de red si estaba marcado como no disponible
            if (localStorage.getItem('app_network_unreachable') === 'true') {
              localStorage.removeItem('app_network_unreachable');
            }
            
            return response;
          })
          .catch(err => {
            clearTimeout(timeoutId);
            console.error('Error en fetch Supabase:', err);
            
            // Mejorar el mensaje de error dependiendo del tipo
            let errorMessage = err.message || 'Error desconocido al conectar con el servidor';
            
            if (err.name === 'AbortError') {
              errorMessage = 'La conexión con el servidor ha excedido el tiempo de espera';
              // Marcar la red como no disponible si es un timeout
              localStorage.setItem('app_network_unreachable', 'true');
            } else if (err.name === 'TypeError' && 
                     (err.message.includes('NetworkError') || 
                      err.message.includes('Failed to fetch'))) {
              errorMessage = 'Error de red: No se pudo conectar al servidor. Compruebe su conexión a Internet.';
              // Marcar la red como no disponible
              localStorage.setItem('app_network_unreachable', 'true');
            }
            
            const enhancedError = new Error(errorMessage);
            enhancedError.name = err.name;
            throw enhancedError;
          });
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 1 // Reducido para disminuir la carga de red
      }
    }
  }
);

// Función para verificar la conectividad de Internet general con múltiples fuentes
const checkInternetConnection = async (): Promise<boolean> => {
  // Lista de URLs de prueba para verificar redundante
  const testUrls = [
    'https://www.gstatic.com/generate/1x1.png',  // Google
    'https://www.apple.com/favicon.ico',         // Apple
    'https://www.cloudflare.com/favicon.ico'     // Cloudflare
  ];
  
  try {
    // Intentamos con múltiples fuentes para aumentar las probabilidades de éxito
    for (const url of testUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Incrementado a 10s
        
        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        // Si llegamos aquí con cualquiera de las URLs, hay conexión
        return true;
      } catch (e) {
        // Continuamos con la siguiente URL si esta falló
        console.log(`Verificando conexión - Falló ${url}, probando siguiente...`);
      }
    }
    
    // Si llegamos aquí, todas las URLs fallaron
    return false;
  } catch (error) {
    console.error('Error al verificar conexión a Internet:', error);
    return false;
  }
};

// Función de ayuda para verificar la conexión con mejoras
export const checkSupabaseConnection = async (): Promise<boolean> => {
  // Si ya verificamos la conexión recientemente, devolver el resultado en caché
  const CACHE_TTL = 10000; // Aumentado a 10 segundos para reducir verificaciones frecuentes
  const now = Date.now();
  
  if (now - lastConnectionStatus.timestamp < CACHE_TTL) {
    return lastConnectionStatus.isConnected;
  }
  
  // Si estamos en modo offline, devolver false inmediatamente
  if (isOfflineMode()) {
    lastConnectionStatus = { isConnected: false, timestamp: now };
    return false;
  }
  
  // Primero verificar si hay conexión a Internet en general
  const hasInternet = await checkInternetConnection();
  if (!hasInternet) {
    console.log('No hay conexión a Internet disponible');
    localStorage.setItem('app_network_unreachable', 'true');
    lastConnectionStatus = { isConnected: false, timestamp: now };
    return false;
  }
  
  // Implementar retries con backoff exponencial
  let currentRetry = 0;
  let delay = RETRY_SETTINGS.initialDelay;
  
  while (currentRetry < RETRY_SETTINGS.maxRetries) {
    try {
      // Verificar conexión con Supabase usando un endpoint más ligero 
      // y con timeout aumentado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Aumentado a 30s timeout
      
      // Intentar una operación simple que no requiera muchos recursos
      const { error } = await supabase.from('config').select('count', { count: 'exact', head: true })
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      const isConnected = !error;
      lastConnectionStatus = { isConnected, timestamp: now };
      
      // Si recuperamos la conexión y estábamos en modo offline o red no disponible, desactivar esos modos
      if (isConnected) {
        localStorage.removeItem('app_offline_mode');
        localStorage.removeItem('app_network_unreachable');
        console.log('Conexión a Supabase establecida correctamente');
      } else if (error) {
        console.error('Error de Supabase en verificación de conexión:', error);
      }
      
      return isConnected;
    } catch (error) {
      console.error(`Intento ${currentRetry + 1}/${RETRY_SETTINGS.maxRetries} fallido:`, error);
      
      currentRetry++;
      
      // Si hemos agotado los reintentos, actualizamos el estado y retornamos false
      if (currentRetry >= RETRY_SETTINGS.maxRetries) {
        console.error('Todos los intentos de conexión a Supabase han fallado');
        lastConnectionStatus = { isConnected: false, timestamp: now };
        // Marcar la red como no disponible después de agotar los reintentos
        localStorage.setItem('app_network_unreachable', 'true');
        return false;
      }
      
      // Calcular el siguiente delay con backoff exponencial y jitter aleatorio
      // para evitar tormentas de conexión
      const jitter = Math.random() * 0.3 * delay; // Añadir hasta 30% de variación aleatoria
      delay = Math.min(delay * RETRY_SETTINGS.factor + jitter, RETRY_SETTINGS.maxDelay);
      
      console.log(`Reintentando en ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }
  
  // Si llegamos aquí, todos los intentos han fallado
  lastConnectionStatus = { isConnected: false, timestamp: now };
  return false;
};

// Función para activar/desactivar modo offline (para pruebas y uso manual)
export const toggleOfflineMode = (active: boolean) => {
  if (active) {
    localStorage.setItem('app_offline_mode', 'true');
    console.log('Modo offline activado manualmente');
  } else {
    localStorage.removeItem('app_offline_mode');
    localStorage.removeItem('app_network_unreachable');
    console.log('Modo offline desactivado manualmente');
  }
};

// Función para crear suscripciones en tiempo real con mejor manejo de errores
export const createRealtimeSubscription = (
  table: string, 
  callback: () => void,
  schema: string = 'public',
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
) => {
  // Si estamos en modo offline, retornar una suscripción falsa
  if (isOfflineMode()) {
    console.log(`Suscripción en tiempo real para ${table} no iniciada (modo offline)`);
    return {
      unsubscribe: () => console.log(`Cancelando suscripción de ${table} (modo offline)`)
    };
  }
  
  return supabase
    .channel(`changes_${table}`)
    .on(
      'postgres_changes',
      {
        event: event,
        schema: schema,
        table: table
      },
      () => {
        console.log(`Cambios detectados en la tabla ${table}`);
        callback();
      }
    )
    .subscribe((status) => {
      console.log(`Supabase subscription status for ${table}:`, status);
      
      // Si hay un error de conexión, intentar volver a conectar después de un tiempo
      if (status === 'OFFLINE' || status === 'CLOSED') {
        console.log(`Suscripción ${table} ${status}, intentando reconectar en 30s...`);
        setTimeout(() => {
          // Verificar si debemos intentar reconectar
          checkSupabaseConnection().then(isConnected => {
            if (isConnected) {
              // Forzar una recarga de datos cuando la conexión se recupera
              callback();
            }
          }).catch(err => {
            console.error('Error al verificar conexión para reconexión de suscripción:', err);
          });
        }, 30000); // Aumentado a 30s para dar más tiempo
      }
    });
};

// Función para gestionar caching avanzado
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Cache en memoria para datos
const dataCache = new Map<string, CacheItem<any>>();

// Función para guardar datos en cache
export const cacheData = <T>(key: string, data: T, ttlSeconds: number = 7200) => { // Aumentado a 2 horas por defecto
  const now = Date.now();
  
  // Solo actualizar la caché si los datos no son null y no están vacíos
  if (data === null || (Array.isArray(data) && data.length === 0)) {
    console.log(`No se guarda en caché ${key}: datos vacíos o nulos`);
    return;
  }
  
  dataCache.set(key, {
    data,
    timestamp: now,
    expiry: now + (ttlSeconds * 1000)
  });
  
  console.log(`Datos guardados en caché: ${key}, expira en ${ttlSeconds}s`);
  
  // También guardar en localStorage para persistencia entre sesiones
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: now,
      expiry: now + (ttlSeconds * 1000)
    }));
  } catch (e) {
    console.error('Error al guardar caché en localStorage:', e);
  }
};

// Función para obtener datos de cache con respaldo de localStorage
export const getCachedData = <T>(key: string): T | null => {
  const now = Date.now();
  
  // Primero intentar obtener de la caché en memoria
  const item = dataCache.get(key);
  
  if (item && now <= item.expiry) {
    return item.data as T;
  }
  
  // Si no está en memoria o expiró, intentar recuperar de localStorage
  try {
    const storedItem = localStorage.getItem(`cache_${key}`);
    if (storedItem) {
      const parsedItem = JSON.parse(storedItem) as CacheItem<T>;
      
      if (now <= parsedItem.expiry) {
        // Si los datos de localStorage son válidos, restaurarlos a la caché en memoria
        dataCache.set(key, parsedItem);
        return parsedItem.data;
      } else {
        // Limpiar localStorage si expiró
        localStorage.removeItem(`cache_${key}`);
      }
    }
  } catch (e) {
    console.error('Error al recuperar caché de localStorage:', e);
  }
  
  return null;
};

// Función para borrar un item específico del cache
export const clearCacheItem = (key: string) => {
  dataCache.delete(key);
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (e) {
    console.error('Error al borrar caché de localStorage:', e);
  }
};

// Función para borrar todo el cache
export const clearCache = () => {
  dataCache.clear();
  
  // Limpiar solo las entradas de caché en localStorage
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error al limpiar caché de localStorage:', e);
  }
};