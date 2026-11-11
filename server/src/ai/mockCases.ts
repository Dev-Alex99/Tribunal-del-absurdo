import { CaseData, PlayerEvaluation, VerdictData } from '../types.js';

export const MOCK_CASES: CaseData[] = [
  {
    caseNumber: 'EXP-104-B/Bis',
    title: 'La Invasión de la Embajada con una Alpaca Reclamada como Diplomática',
    plaintiff: 'El Cónsul Honorario de San Marino y tres guardias con dolor de cabeza',
    description: 'Se le acusa de haber ingresado montado en una alpaca con corbatín a la recepción diplomática, exigiendo asilo político para ambos y derribando la fuente de ponche.',
    requiredWords: ['microondas', 'burbujas', 'herencia']
  },
  {
    caseNumber: 'EXP-982-C/Ter',
    title: 'Sabotaje de la Máquina de Café del Departamento de Trámites Inútiles',
    plaintiff: 'El Subsecretario Adjunto de Archivo Muerto y Sellos Gastados',
    description: 'Fue sorprendido a las 4:00 AM rellenando el molinillo de café con arena para gatos con brillantina, alegando que buscaba "acelerar la iluminación metafísica de los secretarios".',
    requiredWords: ['mayonesa', 'reencarnación', 'plancha']
  },
  {
    caseNumber: 'EXP-411-A/Quater',
    title: 'Venta Ilegal de Terrenos en la Cuarta Dimensión a Palomas Mensajeras',
    plaintiff: 'Doña Enriqueta (78 años, defensora vecinal de las aves urbanas)',
    description: 'Estableció una inmobiliaria no registrada en una banca de la plaza, cobrando migas de pan añejo a palomas a cambio de escrituras notariales de nubes bajas.',
    requiredWords: ['bluetooth', 'dentadura', 'meteorito']
  },
  {
    caseNumber: 'EXP-309-K/Ext',
    title: 'Conducción Temeraria de un Carrito de Supermercado con Turbina a Gas',
    plaintiff: 'La Dirección General de Tránsito Fluvial y Terrestre',
    description: 'Circulaba a 90 km/h por el pasillo de lácteos impulsado por una sopladora de hojas y una garrafa de gas, declarando ser "el heraldo del libre mercado".',
    requiredWords: ['abuela', 'pararrayos', 'yogur']
  },
  {
    caseNumber: 'EXP-552-Z/Null',
    title: 'Falsificación de Títulos Nobiliarios para un Maniquí de Sastrería',
    plaintiff: 'El Tribunal Heráldico de la Burocracia Metropolitana',
    description: 'Nombró "Duque de las Perchas y Canciller de Fieltro" a un maniquí sin brazos, logrando que el banco le otorgara un crédito hipotecario de 4 millones.',
    requiredWords: ['peluca', 'cataclismo', 'sartén']
  }
];

export const MOCK_RIVAL_PLEAS: Record<string, string[]> = {
  default: [
    'Señor Magistrado: no era una invasión, era una intervención artística sobre la vacuidad del ponche. La alpaca heredó el título de mi abuela y las burbujas del microondas avalan mi inmunidad.',
    'Todo fue un experimento acústico. El molinillo necesitaba resonancia cósmica y la reencarnación de la mayonesa fue avalada por mi plancha en el último sínodo.',
    'Las palomas me pagaron voluntariamente con pan de centeno. El bluetooth de mi dentadura detectó un meteorito inminente y sólo quise salvar sus patrimonios.',
    'El carrito de compras respondía a un principio básico de la termodinámica. Mi abuela me enseñó que el yogur absorbe el rayo del pararrayos mejor que la policía.'
  ]
};

const STAMP_OPTIONS: Array<PlayerEvaluation['stamp']> = [
  'ABSUELTO_POR_GENIO',
  'CULPABLE_REINCIDENTE',
  'INDULTO_POR_PENA',
  'DESACATO_TOTAL',
  'LOCURA_TRANSITORIA'
];

const STAMP_TITLES: Record<PlayerEvaluation['stamp'], string> = {
  ABSUELTO_POR_GENIO: 'ABSUELTO POR GENIO RETORCIDO',
  CULPABLE_REINCIDENTE: 'CULPABLE CON AGRAVANTE DE DESCARO',
  INDULTO_POR_PENA: 'INDULTO POR PENA AJENA',
  DESACATO_TOTAL: 'DESACATO AL SENTIDO COMÚN',
  LOCURA_TRANSITORIA: 'LOCURA BUROCRÁTICA TRANSITORIA'
};

const ROAST_TEMPLATES = [
  'Este tribunal ha visto excusas mediocres, pero la suya califica como monumento al descaro. La redacción huele a desesperación y café recalentado.',
  'Un intento poético de justificar lo injustificable. Si las leyes de la física tuvieran abogados, usted ya estaría condenado a 30 años de trabajo forzado.',
  'El argumento es tan absurdo que incluso el archivo muerto del ministerio se negó a clasificarlo por vergüenza administrativa.',
  'Brillante uso de la cara dura. Este tribunal admira la falta de pudor ético cuando viene acompañada de vocabulario pretencioso.',
  'Una defensa digna de un paciente fugado de un congreso de oratoria barata. Se le concede el beneficio de la duda exclusivamente por compasión médica.'
];

export function generateMockEvaluation(
  caseData: CaseData,
  pleas: Array<{ playerId: string; playerName: string; text: string; attachment?: string }>
): VerdictData {
  let highestScore = -1;
  let winnerId = pleas[0]?.playerId || '';
  let winnerName = pleas[0]?.playerName || '';

  const evaluations: PlayerEvaluation[] = pleas.map((p, idx) => {
    const textLower = p.text.toLowerCase();
    const usedWords = caseData.requiredWords.filter(w => textLower.includes(w.toLowerCase()));
    const missingWords = caseData.requiredWords.length - usedWords.length;

    // Word compliance penalty (halved if amnesia attachment is used)
    const isAmnesia = p.attachment?.toLowerCase().includes('amnesia');
    const penaltyMultiplier = isAmnesia ? 7 : 15;
    const penalty = missingWords * penaltyMultiplier;

    // Bribery bonus
    const hasBribe = p.attachment?.toLowerCase().includes('soborno');
    const bribeBonus = hasBribe ? 12 : 0;

    const baseLengthBonus = Math.min(30, Math.floor(p.text.length / 5));
    const creativity = Math.max(10, Math.min(50, 20 + baseLengthBonus + Math.floor(Math.random() * 15)));
    const audacity = Math.max(10, Math.min(50, 15 + (usedWords.length * 10) + bribeBonus + Math.floor(Math.random() * 10)));
    const total = Math.max(5, creativity + audacity - penalty);

    if (total > highestScore) {
      highestScore = total;
      winnerId = p.playerId;
      winnerName = p.playerName;
    }

    const stamp = STAMP_OPTIONS[idx % STAMP_OPTIONS.length];
    let customRoast = ROAST_TEMPLATES[idx % ROAST_TEMPLATES.length];
    if (p.attachment) {
      customRoast += ` [Anexo evaluado: ${p.attachment}. El Tribunal acepta el trámite con reservas éticas].`;
    }

    return {
      playerId: p.playerId,
      playerName: p.playerName,
      pleaText: p.text,
      attachment: p.attachment,
      creativityScore: creativity,
      audacityScore: audacity,
      requiredWordsUsed: usedWords,
      penalty,
      totalRoundScore: total,
      stamp,
      stampTitle: STAMP_TITLES[stamp],
      roast: customRoast
    };
  });

  return {
    evaluations: evaluations,
    roundWinnerId: winnerId,
    roundWinnerName: winnerName,
    magistrateCommentary: `Tras revisar los autos y con tres tazas de té amargo, el Tribunal resuelve: "${winnerName}" ha demostrado una audacia que desafía toda lógica civil. El expediente queda archivado bajo reserva.`
  };
}
