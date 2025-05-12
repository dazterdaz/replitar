import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { formatRut } from './formatters';
import { Consentimiento } from '../types';
import { ConfiguracionFormulario } from '../types';

// Lista fija de preguntas de salud
const PREGUNTAS_SALUD = [
  '¿Comiste en las últimas 4 horas?',
  '¿Tienes alergias?',
  '¿Tienes hemofilia?',
  '¿Has tomado aspirina en los últimos 5 días?',
  '¿Tienes hepatitis?',
  '¿Tienes mala cicatrización?',
  '¿Vives con VIH?',
  '¿Tienes problemas de salud?',
  '¿Estás en tratamiento médico?',
  '¿Tienes tendencia a desmayarte?',
  '¿Fumas?',
  '¿Bebes alcohol?',
  '¿Bebiste en las últimas 3 horas?',
  '¿Consumes drogas?',
  '¿Tienes problemas dermatológicos?',
  '¿Tu piel produce queloides?',
  '¿Es tu primer tatuaje?'
];

export const generatePDF = (consentimiento: Consentimiento, config: ConfiguracionFormulario): jsPDF => {
  // Crear nuevo documento PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración de estilos
  const styles = {
    margin: 20,
    headerHeight: 40,
    lineHeight: 7,
    sectionSpacing: 15,
    colors: {
      primary: [0, 128, 128],
      secondary: [240, 240, 240],
      accent: [76, 175, 80]
    }
  };

  let y = styles.headerHeight + 10;

  // Función helper para manejar el espacio y crear nuevas páginas si es necesario
  const ensureSpace = (neededSpace: number): void => {
    if (y + neededSpace > pdf.internal.pageSize.height - 20) {
      pdf.addPage();
      y = styles.margin;
    }
  };

  // Encabezado
  pdf.setFillColor(...styles.colors.primary);
  pdf.rect(0, 0, pdf.internal.pageSize.width, styles.headerHeight, 'F');

  // Título y dirección
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(config.nombreEstudio, pdf.internal.pageSize.width / 2, 15, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.direccionEstudio, pdf.internal.pageSize.width / 2, 25, { align: 'center' });

  // Badge de verificación
  pdf.setFillColor(...styles.colors.accent);
  pdf.roundedRect(styles.margin, y, 80, 12, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text('Documento Verificado', styles.margin + 10, y + 8);

  // Código del consentimiento
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(...styles.colors.secondary);
  pdf.roundedRect(pdf.internal.pageSize.width - styles.margin - 80, y, 80, 12, 3, 3, 'F');
  pdf.text(`Código: ${consentimiento.codigo}`, pdf.internal.pageSize.width - styles.margin - 70, y + 8);

  y += 25;

  // Información del cliente
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(styles.margin, y, pdf.internal.pageSize.width - (styles.margin * 2), 65, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMACIÓN DEL CLIENTE', styles.margin + 5, y + 10);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  const clienteData = [
    [`Nombre completo: ${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`, 
     `RUT/Pasaporte: ${formatRut(consentimiento.cliente.rut)}`],
    [`Edad: ${consentimiento.cliente.edad} años`, 
     `Fecha de nacimiento: ${format(new Date(consentimiento.cliente.fechaNacimiento), 'dd/MM/yyyy')}`],
    [`Dirección: ${consentimiento.cliente.direccion.calle}`,
     `Comuna: ${consentimiento.cliente.direccion.comuna}`],
    [`Región: ${consentimiento.cliente.direccion.region}`,
     `Teléfono: ${consentimiento.cliente.telefono}`],
    [`Email: ${consentimiento.cliente.email}`, '']
  ];

  let dataY = y + 20;
  clienteData.forEach(row => {
    pdf.text(row[0], styles.margin + 10, dataY);
    if (row[1]) {
      pdf.text(row[1], pdf.internal.pageSize.width / 2 + 10, dataY);
    }
    dataY += styles.lineHeight;
  });

  y = dataY + 15;

  // Información del artista
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(styles.margin, y, pdf.internal.pageSize.width - (styles.margin * 2), 20, 3, 3, 'F');
  pdf.text(`Artista a cargo: ${consentimiento.artistaSeleccionado}`, styles.margin + 5, y + 12);

  y += 35;

  // Información de salud
  ensureSpace(120); // Asegurarse de que hay espacio para la sección de salud
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMACIÓN DE SALUD', styles.margin, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoSalud = consentimiento.informacionSalud || {};
  
  // Mostrar cada pregunta de salud con su respuesta
  PREGUNTAS_SALUD.forEach((pregunta, index) => {
    const infoRespuesta = infoSalud[index] || {};
    const respuesta = infoRespuesta.respuesta ? 'Sí' : 'No';
    const infoAdicional = infoRespuesta.informacionAdicional || '';
    
    let textoRespuesta = `${pregunta}: ${respuesta}`;
    if (infoAdicional) {
      textoRespuesta += ` (${infoAdicional})`;
    }
    
    // Verificar si hay espacio suficiente en la página actual
    ensureSpace(10);
    
    const lineasRespuesta = pdf.splitTextToSize(textoRespuesta, 170);
    pdf.text(lineasRespuesta, styles.margin, y);
    y += lineasRespuesta.length * 5 + 2;
  });

  y += 10;

  // Texto del consentimiento
  ensureSpace(100);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSENTIMIENTO GENERAL', styles.margin, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const textoConsentimiento = config.textoConsentimiento
    .replace('{Nombre Cliente}', `${consentimiento.cliente.nombre} ${consentimiento.cliente.apellidos}`)
    .replace('{Rut Cliente}', formatRut(consentimiento.cliente.rut))
    .replace('{Edad Cliente}', consentimiento.cliente.edad.toString())
    .replace('{Nombre Artista}', consentimiento.artistaSeleccionado)
    .replace(/{Nombre Estudio}/g, config.nombreEstudio)
    .replace('{Direccion Estudio}', config.direccionEstudio);

  const splitText = pdf.splitTextToSize(textoConsentimiento, 
    pdf.internal.pageSize.width - (styles.margin * 2));
  pdf.text(splitText, styles.margin, y);

  y += splitText.length * 5 + 20;

  // Datos del tutor legal (si aplica)
  if (consentimiento.cliente.edad < 18 && consentimiento.tutor) {
    ensureSpace(120);
    
    pdf.setFillColor(255, 243, 205);
    pdf.roundedRect(styles.margin, y, pdf.internal.pageSize.width - (styles.margin * 2), 90, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DEL TUTOR LEGAL', styles.margin + 5, y + 10);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Crear texto completo de parentesco
    const parentescoCompleto = consentimiento.tutor.parentesco === 'Otro' 
      ? `${consentimiento.tutor.parentesco} (${consentimiento.tutor.otroParentesco})`
      : consentimiento.tutor.parentesco;

    const tutorData = [
      [`Nombre completo: ${consentimiento.tutor.nombre}`, 
       `RUT: ${formatRut(consentimiento.tutor.rut)}`],
      [`Parentesco: ${parentescoCompleto}`, '']
    ];

    let tutorY = y + 20;
    tutorData.forEach(row => {
      pdf.text(row[0], styles.margin + 10, tutorY);
      if (row[1]) {
        pdf.text(row[1], pdf.internal.pageSize.width / 2 + 10, tutorY);
      }
      tutorY += styles.lineHeight;
    });

    const textoTutorLegal = config.textoTutorLegal
      .replace('{Nombre Tutor}', consentimiento.tutor.nombre)
      .replace('{Rut Tutor}', formatRut(consentimiento.tutor.rut))
      .replace('{Parentesco Tutor}', parentescoCompleto)
      .replace('{Nombre Cliente}', consentimiento.cliente.nombre)
      .replace('{Apellidos Cliente}', consentimiento.cliente.apellidos)
      .replace('{Rut Cliente}', formatRut(consentimiento.cliente.rut))
      .replace('{Edad Cliente}', consentimiento.cliente.edad.toString())
      .replace(/{Nombre Estudio}/g, config.nombreEstudio)
      .replace('{Direccion Estudio}', config.direccionEstudio);

    const splitTextoTutor = pdf.splitTextToSize(textoTutorLegal, 
      pdf.internal.pageSize.width - (styles.margin * 2) - 20);
    
    tutorY += 10;
    pdf.text(splitTextoTutor, styles.margin + 10, tutorY);
    
    y = tutorY + splitTextoTutor.length * 5 + 20;
  }

  // Sección de firmas
  ensureSpace(50);
  pdf.setDrawColor(...styles.colors.primary);

  // Firma del cliente
  if (consentimiento.firma) {
    pdf.addImage(consentimiento.firma, 'PNG', styles.margin, y - 20, 70, 20);
  }
  pdf.line(styles.margin, y, styles.margin + 70, y);
  pdf.text('Firma del Cliente', styles.margin, y + 5);
  pdf.text(`Fecha: ${format(new Date(consentimiento.fechaCreacion), 'dd/MM/yyyy')}`, 
    styles.margin, y + 12);

  // Firma del tutor si aplica
  if (consentimiento.tutor?.firma) {
    pdf.addImage(consentimiento.tutor.firma, 'PNG', 
      pdf.internal.pageSize.width - styles.margin - 70, y - 20, 70, 20);
    pdf.line(pdf.internal.pageSize.width - styles.margin - 70, y, 
      pdf.internal.pageSize.width - styles.margin, y);
    pdf.text('Firma del Tutor Legal', 
      pdf.internal.pageSize.width - styles.margin - 70, y + 5);
  }

  // Pie de página
  pdf.setFontSize(8);
  pdf.text(
    `Documento válido emitido por ${config.nombreEstudio} con código: ${consentimiento.codigo}. Conserve este número para futuras verificaciones.`,
    pdf.internal.pageSize.width / 2,
    pdf.internal.pageSize.height - 10,
    { align: 'center' }
  );

  return pdf;
};