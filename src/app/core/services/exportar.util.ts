/** Columna de un informe tabulado: texto de cabecera y cómo obtener el valor de cada fila. */
export interface ColumnaInforme<T> {
  titulo: string;
  valor: (fila: T) => string | number;
}

const escaparCsv = (v: string | number): string => {
  let texto = String(v);
  // Evita la inyección de fórmulas al abrir el CSV en una hoja de cálculo.
  if (/^[=+\-@]/.test(texto) && typeof v === 'string') texto = `'${texto}`;
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/** Genera el texto CSV (separador `;`, el habitual en Excel en español) con BOM para conservar las tildes. */
export function construirCsv<T>(columnas: ColumnaInforme<T>[], filas: T[]): string {
  const lineas = [
    columnas.map(c => escaparCsv(c.titulo)).join(';'),
    ...filas.map(f => columnas.map(c => escaparCsv(c.valor(f))).join(';')),
  ];
  return '﻿' + lineas.join('\r\n');
}

/** Descarga un texto como archivo desde el navegador. */
export function descargarArchivo(contenido: BlobPart, nombre: string, tipo: string): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

export function exportarCsv<T>(nombre: string, columnas: ColumnaInforme<T>[], filas: T[]): void {
  descargarArchivo(construirCsv(columnas, filas), `${nombre}.csv`, 'text/csv;charset=utf-8');
}

/** Genera un PDF con título, fecha y tabla con estilo. jsPDF se carga bajo demanda para no pesar en el arranque. */
export async function exportarPdf<T>(
  nombre: string, titulo: string, columnas: ColumnaInforme<T>[], filas: T[], pie = '',
): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFontSize(18);
  doc.text(titulo, 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Generado el ${new Date().toLocaleString('es-ES')} · ${filas.length} filas`, 40, 68);
  autoTable(doc, {
    startY: 84,
    head: [columnas.map(c => c.titulo)],
    body: filas.map(f => columnas.map(c => String(c.valor(f)))),
    headStyles: { fillColor: [28, 78, 128], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 244, 250] },
    styles: { fontSize: 9 },
    didDrawPage: data => {
      doc.setFontSize(8);
      doc.text(`${pie} Página ${data.pageNumber}`, 40, doc.internal.pageSize.getHeight() - 20);
    },
  });
  doc.save(`${nombre}.pdf`);
}
