/* ============================================================
   DATOS DE EJEMPLO (todo ficticio y escrito a mano).
   No hay IA conectada: estas notas, justificaciones y pistas
   las escribió el equipo para la demostración.
   ============================================================ */

const DATOS = {
  docente: 'Docente de ejemplo',

  /* ---------- Calificador ---------- */
  rubrica: {
    nombre: 'Ensayo corto · sobre 10',
    criterios: [
      { nombre: 'Tesis y contenido', desc: 'Plantea una postura clara y la desarrolla con ideas pertinentes', max: 4 },
      { nombre: 'Argumentación', desc: 'Sostiene la postura con razones y ejemplos ordenados', max: 3 },
      { nombre: 'Fuentes', desc: 'Cita fuentes verificables y las usa para apoyar sus ideas', max: 2 },
      { nombre: 'Redacción', desc: 'Ortografía, claridad y estructura del texto', max: 1 }
    ]
  },
  trabajos: [
    { id: 'Estudiante 01', confianza: 'Alta',
      cita: 'Regular la IA en la universidad es necesario porque los estudiantes deben aprender a razonar por su cuenta, como muestra el estudio de Bastani (2025).',
      puntos: [3.5, 2.5, 2, 1],
      just: ['Postura clara y desarrollada; falta profundizar un contraargumento.', 'Las razones están ordenadas y con un ejemplo; el segundo ejemplo es débil.', 'Cita una fuente verificable y la usa para sostener su postura.', 'Texto claro y sin errores relevantes.'] },
    { id: 'Estudiante 02', confianza: 'Alta',
      cita: 'Yo creo que la IA es buena y mala a la vez. Depende de cómo se use y de quién la use en cada caso.',
      puntos: [3, 2, 1, 0.5],
      just: ['Hay postura, pero es general y poco desarrollada.', 'Menciona razones sin ejemplos concretos.', 'Nombra una fuente sin datos suficientes para verificarla.', 'Hay repeticiones y dos errores de puntuación.'] },
    { id: 'Estudiante 03', confianza: 'Baja',
      cita: 'La IA ayuda. Es importante. Todos la usan hoy en día y por eso hay que usarla.',
      puntos: [2, 1.5, 0, 1],
      just: ['El texto es muy corto y la postura casi no se desarrolla.', 'La razón principal es que "todos la usan", sin otro sustento.', 'No cita fuentes.', 'Redacción correcta, aunque con frases muy breves.'] },
    { id: 'Estudiante 04', confianza: 'Media',
      cita: 'Las universidades deberían regular el uso de la IA con reglas claras de citación, ya que sin ellas la evaluación pierde sentido.',
      puntos: [4, 3, 1.5, 0.5],
      just: ['Postura clara, bien desarrollada y pertinente.', 'Argumenta con razones y ejemplos coherentes.', 'Cita fuentes, pero una no tiene año ni autor completo.', 'Buena estructura; hay algunos errores de tildes.'] },
    { id: 'Estudiante 05', confianza: 'Media',
      cita: 'Considero que se debe permitir la IA porque ahorra tiempo. Además, es el futuro y los profesores deberían adaptarse.',
      puntos: [3, 1, 1, 1],
      just: ['Postura clara, aunque el contenido es limitado.', 'Argumentación débil: afirma sin explicar por qué.', 'Cita una fuente general, sin relación directa con su idea.', 'Redacción clara y ordenada.'] }
  ],

  /* ---------- Tutor ---------- */
  problema: {
    datos: [4, 8, 6, 5, 7],
    enunciado: 'Hola, soy el tutor de Fundamentos de Estadística, armado con el material de tu profesor. Problema de la guía (p. 3): calcula la media y la desviación estándar muestral de estos datos: 4, 8, 6, 5, 7. ¿Por dónde empezarías?',
    fuenteEnunciado: 'Guía unidad 2, p. 3',
    pasos: [
      { nombre: 'Suma de los datos', esperado: [30], fuente: 'Guía unidad 2, p. 4',
        claves: /\bsuma\b|\btotal\b/,
        pregunta: '¿Cuánto te da la suma de los cinco datos?',
        pistas: ['¿Qué operación necesitas primero para llegar a la media? Piensa en cómo repartirías el total entre todos los datos.',
                 'Pista: la media es la suma de todos los datos dividida entre cuántos son. Empieza por la suma. ¿Cuánto da?',
                 'Suma uno por uno: 4 + 8, luego añade 6, 5 y 7. Dime el total.'],
        ejemplo: 'con los datos 1, 3 y 5, la suma es 1 + 3 + 5 = 9.',
        ok: 'Correcto, la suma es 30. Ahora, ¿cuánto vale la media?' },
      { nombre: 'Media', esperado: [6], fuente: 'Guía unidad 2, p. 4',
        claves: /\bmedia\b|\bpromedio\b/,
        pregunta: '¿Cuánto vale la media?',
        pistas: ['Ya tienes la suma. ¿Entre cuántos datos la repartirías?',
                 'Son 5 datos. Divide la suma entre esa cantidad. ¿Qué obtienes?',
                 'Haz el cociente de tu suma entre 5 y dime el resultado.'],
        ejemplo: 'con los datos 1, 3 y 5, la suma es 9 y hay 3 datos, así que la media es 9 ÷ 3 = 3.',
        ok: 'Bien, la media es 6. Ahora la desviación: resta la media a cada dato y eleva cada diferencia al cuadrado. ¿Cuánto te da la suma de esos cuadrados?' },
      { nombre: 'Suma de cuadrados', esperado: [10], fuente: 'Guía unidad 2, p. 7',
        claves: /cuadrado/,
        pregunta: '¿Cuánto te da la suma de los cuadrados de las diferencias?',
        pistas: ['Para la desviación necesitas saber cuánto se aleja cada dato de la media. ¿Cómo medirías esa distancia?',
                 'Pista: resta la media a cada dato y eleva cada diferencia al cuadrado. Empieza con el 4.',
                 'Calcula los cinco cuadrados de las diferencias y súmalos. Dime esa suma.'],
        ejemplo: 'con los datos 1, 3 y 5 (media 3), las diferencias son −2, 0 y 2, y la suma de sus cuadrados es 4 + 0 + 4 = 8.',
        ok: 'Exacto, la suma de cuadrados es 10. En una muestra, ¿entre cuánto divides esa suma para obtener la varianza?' },
      { nombre: 'Dividir entre n menos 1', esperado: [2.5], fuente: 'Guía unidad 2, p. 8',
        claves: /varianza/,
        pregunta: '¿Cuánto vale la varianza de la muestra?',
        pistas: ['Ya tienes la suma de cuadrados. En una muestra, ¿divides entre n o entre n menos 1?',
                 'Para una muestra se divide entre n menos 1. ¿Cuánto es n menos 1 aquí?',
                 'Divide tu suma de cuadrados entre 4 y dime la varianza.'],
        ejemplo: 'con los datos 1, 3 y 5, la suma de cuadrados es 8 y hay 3 datos; en una muestra se divide entre 3 − 1 = 2, así que la varianza es 8 ÷ 2 = 4.',
        ok: 'Correcto, la varianza es 2,5. Último paso: ¿cuánto vale la desviación estándar?' },
      { nombre: 'Raíz cuadrada', esperado: [1.58, 1.581, 1.5811, 1.6], fuente: 'Guía unidad 2, p. 8',
        claves: /desviaci[oó]n/,
        pregunta: '¿Cuánto vale la desviación estándar, con dos decimales?',
        pistas: ['La varianza está en unidades al cuadrado. ¿Qué operación te devuelve a las unidades originales?',
                 'Aplica la raíz cuadrada a la varianza.',
                 'Calcula la raíz cuadrada de tu varianza con calculadora y redondea a dos decimales.'],
        ejemplo: 'con los datos 1, 3 y 5, la varianza es 4, así que la desviación estándar es la raíz de 4, o sea 2.',
        ok: '' }
    ]
  },

  /* ---------- Panel: curso ficticio de 8 estudiantes ----------
     atasco = número de paso (1 a 5) o null si no se atascó.
     Las barras del panel se calculan a partir de esta lista. */
  curso: [
    { nombre: 'Estudiante A', pistas: 3, intentos: 0, atasco: 3 },
    { nombre: 'Estudiante B', pistas: 7, intentos: 2, atasco: 3 },
    { nombre: 'Estudiante C', pistas: 1, intentos: 0, atasco: 2 },
    { nombre: 'Estudiante D', pistas: 5, intentos: 3, atasco: 4 },
    { nombre: 'Estudiante E', pistas: 2, intentos: 0, atasco: 3 },
    { nombre: 'Estudiante F', pistas: 4, intentos: 1, atasco: 4 },
    { nombre: 'Estudiante G', pistas: 0, intentos: 0, atasco: null },
    { nombre: 'Estudiante H', pistas: 6, intentos: 1, atasco: 3 }
  ],

  /* ---------- Recorrido completo: cuentas y clases de ejemplo ---------- */
  cuentas: {
    docente: { nombre: 'Docente de ejemplo', correo: 'docente@ejemplo.test' },
    estudiante: { nombre: 'Estudiante de ejemplo', correo: 'estudiante@ejemplo.test' }
  },
  clasesEjemplo: [
    { id: 'estadistica', nombre: 'Fundamentos de Estadística', materia: 'EST-101', periodo: '2026-2', paralelo: 'Paralelo 2',
      color: 'turquesa', codigo: 'ESTAD-7K2', tutorDemo: true,
      material: [
        { nombre: 'Guía unidad 2 · Estadística descriptiva.pdf', tipo: 'PDF' },
        { nombre: 'Banco de ejercicios resueltos.pdf', tipo: 'PDF' },
        { nombre: 'Diapositivas clase 5.pptx', tipo: 'Diapositivas' }
      ],
      tareas: [] },
    { id: 'comunicacion', nombre: 'Comunicación Académica', materia: 'COM-120', periodo: '2026-2', paralelo: 'Paralelo 1',
      color: 'ambar', codigo: 'COMAC-4P9', tutorDemo: false,
      material: [],
      tareas: [{ id: 'ensayo-ia', nombre: 'Ensayo: ¿hay que regular la IA en la universidad?', entrega: '2026-10-02', ejemplo: true }] }
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = DATOS;
