import { Region } from '../data/regiones';

export interface Cliente {
  nombre: string;
  apellidos: string;
  edad: number;
  rut: string;
  fechaNacimiento: string;
  direccion: {
    calle: string;
    region: string;
    comuna: string;
  };
  telefono: string;
  email: string;
  confirmacionDatos: boolean;
}

export interface Tutor {
  nombre: string;
  rut: string;
  parentesco: 'Padre' | 'Madre' | 'Otro';
  otroParentesco?: string;
  cedulaImagen?: File;
  firma?: string;
}

export interface PreguntaSalud {
  id: string;
  pregunta: string;
  respuestaPorDefecto: boolean;
  mostrarCampoAdicional: boolean;
  campoAdicionalSoloSi: boolean;
  textoAdicional?: string;
}

export interface Artista {
  id: string;
  nombre: string;
  activo: boolean;
  imagen?: string;
}

export interface InformacionSalud {
  [key: string]: {
    respuesta: boolean;
    informacionAdicional?: string;
  };
}

export interface ConfiguracionFormulario {
  nombreEstudio: string;
  direccionEstudio: string;
  logo?: string;
  preguntasSalud: PreguntaSalud[];
  artistas: Artista[];
  textoConsentimiento: string;
  textoTutorLegal: string;
  textosFooter: string;
  datosContacto: {
    nombre: string;
    whatsapp: string;
    email: string;
    instagram: string;
  };
  creamAftercare: string;
  patchAftercare: string;
}

export interface Consentimiento {
  id: string;
  codigo: string;
  fechaCreacion: string;
  cliente: Cliente;
  tutor?: Tutor;
  informacionSalud: InformacionSalud;
  artistaSeleccionado: string;
  cedulaCliente?: File | string;
  firma: string;
  archivado: boolean;
}

export interface EstadisticaArtista {
  nombre: string;
  totalClientes: number;
}

export interface EstadisticasGenerales {
  totalFormularios: number;
  menoresEdad: number;
  mayoresEdad: number;
  porDia: {
    fecha: string;
    cantidad: number;
  }[];
  porMes: {
    mes: string;
    cantidad: number;
  }[];
  artistasStats: EstadisticaArtista[];
}

export interface Usuario {
  id: string;
  usuario: string;
  password: string;
  rol: 'admin';
}