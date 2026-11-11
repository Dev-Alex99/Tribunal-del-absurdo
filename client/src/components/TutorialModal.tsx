import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Scale, AlertTriangle, Stamp, FileText } from 'lucide-react';
import { sfx } from '../audio/sfx';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    folio: 'FOJA 01-A',
    title: 'Artículo 1: Su Inocencia es un Detalle Menor',
    icon: <Scale size={28} className="text-bureau-stampRed" />,
    badge: 'PRINCIPIO PROCESAL BÁSICO',
    badgeClass: 'stamp-red',
    content: (
      <div className="space-y-3 font-typewriter text-xs sm:text-sm text-bureau-ink leading-relaxed">
        <p>
          Bienvenido al <strong>Tribunal del Absurdo</strong>. Aquí no existe la presunción de inocencia: usted ya ha sido procesado por una acusación insólita dictada por el Magistrado Supremo (impulsado por <strong>MiniMax M3.1 Flash</strong>).
        </p>
        <div className="p-3 bg-bureau-paper border-l-4 border-bureau-stampRed italic">
          «No intente alegar sensatez ni lógica jurídica. Este tribunal premia la audacia retórica, la cara dura y la capacidad de justificar lo injustificable.»
        </div>
        <p>
          Si juega en solitario, el tribunal le asignará de oficio al <strong>Dr. Barnabás K. (Abogado Autómata)</strong> como contrincante directo. Si juega con amigos (hasta 4), competirán por convencer al Juez.
        </p>
      </div>
    ),
  },
  {
    step: 2,
    folio: 'FOJA 02-B',
    title: 'Artículo 2: La Cláusula de las 3 Palabras',
    icon: <AlertTriangle size={28} className="text-bureau-stampRed" />,
    badge: 'OBLIGACIÓN LÉXICA INDISPENSABLE',
    badgeClass: 'stamp-red',
    content: (
      <div className="space-y-3 font-typewriter text-xs sm:text-sm text-bureau-ink leading-relaxed">
        <p>
          En cada causa, el expediente exigirá <strong>3 palabras obligatorias y desconcertantes</strong> (por ejemplo: <em>microondas</em>, <em>reencarnación</em> y <em>mayonesa</em>).
        </p>
        <div className="p-3 bg-bureau-paper border-2 border-bureau-ink shadow-bureau-sm">
          <span className="block font-stamp text-xs uppercase font-bold text-bureau-stampRed mb-1">
            Penalización por Desacato:
          </span>
          Por cada palabra que omita en su alegato, el sistema le descontará <strong>15 puntos automáticos</strong> de su calificación de ronda.
        </div>
        <p className="text-xs text-bureau-inkMuted">
          El redactor cuenta con un detector en vivo: a medida que escriba las palabras en su máquina, las pruebas se marcarán con un sello verde de cumplimiento.
        </p>
      </div>
    ),
  },
  {
    step: 3,
    folio: 'FOJA 03-C',
    title: 'Artículo 3: Coimas, Sobornos y Anexos de Trámite',
    icon: <FileText size={28} className="text-bureau-ink" />,
    badge: 'MECÁNICA AVANZADA DE SUPERVIVENCIA',
    badgeClass: 'stamp-blue',
    content: (
      <div className="space-y-3 font-typewriter text-xs sm:text-sm text-bureau-ink leading-relaxed">
        <p>
          Antes de firmar su alegato, tiene la facultad de adjuntar un <strong>Anexo Burocrático de Emergencia</strong> para torcer el ánimo del tribunal:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2 border border-bureau-ink bg-bureau-paper">
            <strong>🥐 Soborno de Mesa de Entradas:</strong> Ofrece café y medialunas. MiniMax lo menciona en su veredicto y puede premiar el descaro.
          </div>
          <div className="p-2 border border-bureau-ink bg-bureau-paper">
            <strong>📜 Certificado de Amnesia:</strong> Reduce a la mitad la multa si no logró incluir todas las palabras obligatorias.
          </div>
          <div className="p-2 border border-bureau-ink bg-bureau-paper">
            <strong>🕵️ Firma Falsificada:</strong> Un arriesgado sello de 'Visto Bueno'. Puede darle absolución o condena doble.
          </div>
          <div className="p-2 border border-bureau-ink bg-bureau-paper">
            <strong>📄 Pliego Ilegible:</strong> El Juez inventará lo que supuestamente no pudo leer de su defensa.
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    folio: 'FOJA 04-D',
    title: 'Artículo 4: Sentencias, Roasts y Podio Final',
    icon: <Stamp size={28} className="text-bureau-stampGreen" />,
    badge: 'DICTAMEN Y CONDENA DEFINITIVA',
    badgeClass: 'stamp-green',
    content: (
      <div className="space-y-3 font-typewriter text-xs sm:text-sm text-bureau-ink leading-relaxed">
        <p>
          Tras deliberar, MiniMax M3.1 estampará uno de los 5 sellos oficiales sobre su expediente y redactará una <strong>crítica mordaz y despiadada (roast)</strong> sobre su argumento.
        </p>
        <div className="p-3 bg-bureau-paper border-2 border-bureau-ink flex items-center justify-around flex-wrap gap-2 text-center">
          <span className="stamp-badge stamp-green text-xs">ABSUELTO POR GENIO</span>
          <span className="stamp-badge stamp-red text-xs">CULPABLE REINCIDENTE</span>
          <span className="stamp-badge stamp-blue text-xs">INDULTO POR PENA</span>
        </div>
        <p>
          Además, en la pantalla de veredicto podrá <strong>estampar reacciones en vivo</strong> sobre los alegatos de los demás. Quien acumule más puntos en 3 causas ganará el <em>Indulto Máximo</em>.
        </p>
      </div>
    ),
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    sfx.playPageTurn();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    sfx.playPageTurn();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    sfx.playStamp();
    localStorage.setItem('tribunal_tutorial_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bureau-desk/80 backdrop-blur-xs">
      {/* Folder Modal Container */}
      <div className="relative w-full max-w-2xl bg-bureau-folder border-3 border-bureau-ink rounded p-6 sm:p-8 shadow-bureau-lg animate-folder-open">
        {/* Paperclip */}
        <div className="paperclip"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            sfx.playPaperRustle();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 border-2 border-bureau-ink bg-bureau-paper hover:bg-bureau-folder transition-colors shadow-bureau-sm"
          title="Cerrar Circular"
        >
          <X size={16} />
        </button>

        {/* Modal Top Header */}
        <div className="border-b-2 border-bureau-ink pb-3 mb-4 pr-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-bureau-ink text-bureau-paper px-2 py-0.5">
              CIRCULAR JUDICIAL Nº 001/BIS
            </span>
            <span className="text-[10px] font-bold font-stamp uppercase text-bureau-stampRed">
              {current.folio}
            </span>
          </div>
          <h2 className="font-stamp text-xl sm:text-2xl font-bold uppercase text-bureau-ink mt-1">
            Manual de Inducción para el Procesado
          </h2>
        </div>

        {/* Step Header with Icon & Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 border-2 border-bureau-ink bg-bureau-paper shadow-bureau-sm shrink-0">
            {current.icon}
          </div>
          <div>
            <div className={`stamp-badge ${current.badgeClass} text-[10px] py-0.5 px-2 mb-1`}>
              {current.badge}
            </div>
            <h3 className="font-stamp text-base sm:text-lg font-bold text-bureau-ink leading-tight">
              {current.title}
            </h3>
          </div>
        </div>

        {/* Step Body */}
        <div className="min-h-[160px] bg-bureau-paperAged p-4 border-2 border-bureau-ink shadow-bureau-sm mb-6">
          {current.content}
        </div>

        {/* Step Dots & Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-bureau-ink">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  sfx.playPageTurn();
                  setCurrentStep(idx);
                }}
                className={`font-stamp text-xs px-2 py-0.5 border border-bureau-ink transition-colors ${
                  idx === currentStep
                    ? 'bg-bureau-stampRed text-bureau-paper font-bold'
                    : 'bg-bureau-paper text-bureau-ink hover:bg-bureau-folder'
                }`}
              >
                Pág {s.step}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="btn-bureau px-3 py-1.5 text-xs font-stamp uppercase font-bold flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                Anterior
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-bureau btn-bureau-red px-4 py-1.5 text-xs font-stamp uppercase font-bold flex items-center gap-1"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="btn-bureau btn-bureau-red px-5 py-2 text-xs font-stamp uppercase font-bold flex items-center gap-1.5"
              >
                <Check size={15} />
                Firmo en Disconformidad (Comenzar)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
