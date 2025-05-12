/**
 * Utilidades para la exportación de datos en formato CSV
 */

/**
 * Convierte un array de objetos a formato CSV
 * @param data Array de objetos a convertir
 * @param headers Objeto con las cabeceras del CSV (clave: nombre de la propiedad, valor: título en el CSV)
 * @returns String en formato CSV
 */
export const objectsToCsv = <T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>
): string => {
  if (!data || data.length === 0) return '';

  // Crear cabecera
  let csv = Object.values(headers).join(',') + '\n';

  // Crear filas de datos
  data.forEach((item) => {
    const row = Object.keys(headers)
      .map((key) => {
        const value = item[key]?.toString().replace(/"/g, '""') || '';
        return `"${value}"`; // Envolver en comillas para manejar comas en los datos
      })
      .join(',');
    csv += row + '\n';
  });

  return csv;
};

/**
 * Descarga un string como archivo CSV
 * @param csvContent Contenido CSV
 * @param fileName Nombre del archivo (sin extensión)
 */
export const downloadCsv = (csvContent: string, fileName: string): void => {
  // Crear blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Crear URL del blob
  const url = window.URL.createObjectURL(blob);
  
  // Crear elemento a para descargar
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  
  // Agregar a documento, hacer clic y eliminar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Función para formatear la fecha actual para nombres de archivos
 * @returns Fecha formateada (YYYYMMDD)
 */
export const getFormattedDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};