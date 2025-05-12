// Función para formatear RUT chileno
export const formatRut = (rut: string): string => {
  // Si está vacío o es muy corto, devolver el original
  if (!rut || rut.length < 2) return rut;
  
  // Si parece ser un pasaporte (contiene letras), devolver sin formato
  if (/[a-zA-Z]/.test(rut)) return rut;
  
  // Limpiar el RUT de cualquier formato previo
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  
  // Si no es un RUT válido después de limpiarlo, retornar el valor original
  if (cleanRut.length < 2) return rut;
  
  // Separar el dígito verificador
  const dv = cleanRut.slice(-1);
  const rutBody = cleanRut.slice(0, -1);
  
  // Formatear el cuerpo del RUT con puntos
  let formattedRut = '';
  let count = 0;
  
  for (let i = rutBody.length - 1; i >= 0; i--) {
    if (count === 3) {
      formattedRut = '.' + formattedRut;
      count = 0;
    }
    formattedRut = rutBody[i] + formattedRut;
    count++;
  }
  
  // Retornar el RUT formateado
  return `${formattedRut}-${dv}`;
};

// Función para validar RUT chileno (opcional)
export const validarRut = (rut: string): boolean => {
  // Si parece ser un pasaporte (contiene letras), considerarlo válido
  if (/[a-zA-Z]/.test(rut)) return true;
  
  // Limpiar el RUT de cualquier formato previo
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim();
  
  // Verificar longitud mínima
  if (cleanRut.length < 2) return false;
  
  // Separar el dígito verificador
  const dv = cleanRut.slice(-1).toUpperCase();
  const rutBody = cleanRut.slice(0, -1);
  
  // Verificar que el cuerpo del RUT sea numérico
  if (!/^\d+$/.test(rutBody)) return false;
  
  // Aplicar algoritmo de validación
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = rutBody.length - 1; i >= 0; i--) {
    suma += parseInt(rutBody.charAt(i)) * multiplicador;
    multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto);
  
  return dvCalculado === dv;
};