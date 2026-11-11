import { config } from '../config.js';
import { CaseData, PlayerEvaluation, VerdictData } from '../types.js';
import { MOCK_CASES, MOCK_RIVAL_PLEAS, generateMockEvaluation } from './mockCases.js';

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT_CASE = `Eres el Magistrado Supremo del "Tribunal de lo Inconcebible y Burocracia Absurda" (inspirado en el universo de Franz Kafka pero en clave cómica).
Tu labor es redactar un EXPEDIENTE JUDICIAL ABSURDO para un juego donde los acusados deben justificarse con una excusa delirante.
Debes responder ÚNICAMENTE con un JSON válido (sin backticks de markdown ni texto extra).

Estructura del JSON:
{
  "caseNumber": "EXP-###-X/Letra",
  "title": "Título corto y cómico de la acusación",
  "plaintiff": "Quién acusa (nombre extravagante y cargo absurdo)",
  "description": "Descripción formal de los hechos insólitos (2 a 3 líneas con vocabulario jurídico formal y grotesco)",
  "requiredWords": ["palabra1", "palabra2", "palabra3"]
}`;

const SYSTEM_PROMPT_RIVAL = `Eres el Dr. Barnabás K., un sospechoso autómata y abogado de oficio atrapado en un laberinto burocrático kafkiano.
Se te acusa de un crimen ridículo. Escribe un alegato de defensa desesperado, hilarante y tramposo (en 2-3 oraciones).
DEBES OBLIGATORIAMENTE incluir las 3 palabras clave exigidas en el caso.
Responde únicamente con el texto del alegato en español, sin comillas ni preámbulos.`;

const SYSTEM_PROMPT_EVALUATOR = `Eres el Juez Supremo del Tribunal del Absurdo, un magistrado burocrático sarcástico, cansado de la vida, amante de los sellos oficiales y despiadado con las excusas aburridas.
Tu tarea es juzgar los alegatos presentados por los sospechosos para el caso dado.

Debes calificar cada alegato en:
1. creatividad (10 a 50 puntos): originalidad de la excusa.
2. descaro (10 a 50 puntos): audacia y falta de vergüenza para sostener el disparate.
3. verificar si usó las palabras obligatorias (penaliza 15 puntos por cada palabra faltante).
4. Considerar el "anexo_soborno" adjuntado: si el sospechoso adjuntó un anexo (como soborno de café, certificado de amnesia o firma falsificada), menciónalo con mordacidad en el roast y dale un pequeño bonus o reprimenda burocrática.
5. Asignar uno de estos sellos oficiales:
   - "ABSUELTO_POR_GENIO" (la mejor excusa)
   - "CULPABLE_REINCIDENTE" (pésima excusa o aburrida)
   - "INDULTO_POR_PENA" (excusa tan patética que da lástima)
   - "DESACATO_TOTAL" (ignoró las reglas o palabras)
   - "LOCURA_TRANSITORIA" (delirio puro pero entretenido)
6. Escribir un "roast": una crítica mordaz, humorística y demoledora (1 a 2 oraciones en tono kafkiano).

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "evaluaciones": [
    {
      "playerId": "id_del_jugador",
      "creativityScore": 45,
      "audacityScore": 40,
      "requiredWordsUsed": ["palabra1", "palabra2"],
      "penalty": 0,
      "totalRoundScore": 85,
      "stamp": "ABSUELTO_POR_GENIO",
      "stampTitle": "ABSUELTO POR GENIO RETORCIDO",
      "roast": "Texto del roast cómico..."
    }
  ],
  "roundWinnerId": "id_del_jugador_con_mas_puntos",
  "magistrateCommentary": "Veredicto final solemne del magistrado sobre la sesión..."
}`;

async function callMiniMax(messages: MiniMaxMessage[], temperature = 0.7, maxTokens = 1000): Promise<string> {
  const url = `${config.minimax.baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.minimax.apiKey}`,
    },
    body: JSON.stringify({
      model: config.minimax.model,
      messages,
      temperature,
      thinking: {
        type: 'adaptive',
      },
      reasoning_effort: 'low',
      max_completion_tokens: maxTokens,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax response missing message content');
  }

  return cleanJsonMarkdown(content);
}

function cleanJsonMarkdown(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function generateCase(roundNumber: number): Promise<CaseData> {
  if (!config.minimax.apiKey) {
    console.log(`[MiniMax] No API Key set. Serving high-fidelity mock case (Round ${roundNumber}).`);
    const mock = MOCK_CASES[(roundNumber - 1) % MOCK_CASES.length];
    return { ...mock };
  }

  try {
    console.log(`[MiniMax M3.1 Fast] Generating dynamic Kafkaesque Case for round ${roundNumber} [reasoning_effort: low]...`);
    const prompt = `Genera el expediente judicial para la Ronda ${roundNumber} de un tribunal de burocracia absurda. Debe ser cómico, extravagante y con 3 palabras obligatorias difíciles de hilar.`;
    const responseJson = await callMiniMax([
      { role: 'system', content: SYSTEM_PROMPT_CASE },
      { role: 'user', content: prompt }
    ], 0.7, 600);

    const parsed = JSON.parse(responseJson) as CaseData;
    return {
      caseNumber: parsed.caseNumber || `EXP-${100 + roundNumber}-B/Bis`,
      title: parsed.title || 'El Misterio del Formulario Extraviado',
      plaintiff: parsed.plaintiff || 'Comisión Central de Sellos y Tinta',
      description: parsed.description || 'Hechos insólitos presentados a trámite.',
      requiredWords: Array.isArray(parsed.requiredWords) && parsed.requiredWords.length >= 3 
        ? parsed.requiredWords.slice(0, 3) 
        : ['cafetera', 'hipoteca', 'calcetín'],
    };
  } catch (err) {
    console.warn('[MiniMax M3.1] Fallback to mock case due to error:', err);
    return { ...MOCK_CASES[(roundNumber - 1) % MOCK_CASES.length] };
  }
}

export async function generateRivalPlea(caseData: CaseData): Promise<string> {
  if (!config.minimax.apiKey) {
    const list = MOCK_RIVAL_PLEAS.default;
    return list[Math.floor(Math.random() * list.length)];
  }

  try {
    console.log('[MiniMax M3.1 Fast] Generating Solo AI Rival plea [reasoning_effort: low]...');
    const userPrompt = `Caso: "${caseData.title}"\nAcusación: "${caseData.description}"\nPalabras obligatorias: ${caseData.requiredWords.join(', ')}\nEscribe tu alegato de defensa.`;
    const response = await callMiniMax([
      { role: 'system', content: SYSTEM_PROMPT_RIVAL },
      { role: 'user', content: userPrompt }
    ], 0.8, 300);
    return response.trim();
  } catch (err) {
    console.warn('[MiniMax M3.1] Rival plea fallback:', err);
    const list = MOCK_RIVAL_PLEAS.default;
    return list[Math.floor(Math.random() * list.length)];
  }
}

export async function evaluatePleas(
  caseData: CaseData,
  pleas: Array<{ playerId: string; playerName: string; text: string; attachment?: string }>
): Promise<VerdictData> {
  if (!config.minimax.apiKey) {
    console.log('[MiniMax] Evaluating via mock deliberation engine...');
    return generateMockEvaluation(caseData, pleas);
  }

  try {
    console.log(`[MiniMax M3.1 Fast] Evaluating ${pleas.length} pleas for case "${caseData.caseNumber}" [reasoning_effort: low]...`);
    const payload = {
      caso: caseData,
      alegatos_de_sospechosos: pleas.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        alegato: p.text,
        anexo_burocratico: p.attachment || 'Sin anexos'
      }))
    };

    const responseJson = await callMiniMax([
      { role: 'system', content: SYSTEM_PROMPT_EVALUATOR },
      { role: 'user', content: JSON.stringify(payload) }
    ], 0.7, 1200);

    const parsed = JSON.parse(responseJson) as {
      evaluaciones: Array<Partial<PlayerEvaluation>>;
      roundWinnerId?: string;
      magistrateCommentary?: string;
    };

    const STAMP_MAP: Record<string, string> = {
      ABSUELTO_POR_GENIO: 'ABSUELTO POR GENIO RETORCIDO',
      CULPABLE_REINCIDENTE: 'CULPABLE CON AGRAVANTE DE DESCARO',
      INDULTO_POR_PENA: 'INDULTO POR PENA AJENA',
      DESACATO_TOTAL: 'DESACATO AL SENTIDO COMÚN',
      LOCURA_TRANSITORIA: 'LOCURA BUROCRÁTICA TRANSITORIA'
    };

    const evaluations: PlayerEvaluation[] = pleas.map(p => {
      const match = parsed.evaluaciones?.find(e => e.playerId === p.playerId);
      const textLower = p.text.toLowerCase();
      const usedWords = caseData.requiredWords.filter(w => textLower.includes(w.toLowerCase()));
      const penalty = (caseData.requiredWords.length - usedWords.length) * 15;

      const creativity = match?.creativityScore ?? 25;
      const audacity = match?.audacityScore ?? 25;
      const total = match?.totalRoundScore ?? Math.max(5, creativity + audacity - penalty);
      const stamp = (match?.stamp as PlayerEvaluation['stamp']) || 'LOCURA_TRANSITORIA';

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
        stampTitle: match?.stampTitle || STAMP_MAP[stamp] || 'SENTENCIA OFICIAL',
        roast: match?.roast || 'El expediente es tan confuso que el tribunal prefiere no indagar más.'
      };
    });

    // Determine winner
    let winnerId = parsed.roundWinnerId || '';
    if (!evaluations.some(e => e.playerId === winnerId)) {
      winnerId = evaluations.reduce((prev, curr) => curr.totalRoundScore > prev.totalRoundScore ? curr : prev).playerId;
    }
    const winnerName = evaluations.find(e => e.playerId === winnerId)?.playerName || 'El Acusado Desconocido';

    return {
      evaluations: evaluations,
      roundWinnerId: winnerId,
      roundWinnerName: winnerName,
      magistrateCommentary: parsed.magistrateCommentary || 'Habiendo deliberado con dos cafés fríos, el tribunal da por cerrada la causa.'
    };
  } catch (err) {
    console.warn('[MiniMax M3.1] Evaluation fallback due to error:', err);
    return generateMockEvaluation(caseData, pleas);
  }
}
