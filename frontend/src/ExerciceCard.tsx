import React, { useState } from 'react';

export interface Exercice {
  id: number;
  theme: string;
  consigne: string;
  phrase_depart: string;
  options: string[];
  reponse_correcte: string;
  explication: string;
}

interface Props {
  exercice: Exercice;
  onSuivant: () => void;
  estDernier: boolean;
}

export const ExerciceCard: React.FC<Props> = ({ exercice, onSuivant, estDernier }) => {
  const [selection, setSelection] = useState<string | null>(null);
  const [valide, setValide] = useState<boolean | null>(null);

  const verifierReponse = (option: string) => {
    if (selection !== null) return;
    setSelection(option);
    setValide(option === exercice.reponse_correcte);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          10ème Année — {exercice.theme}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2">{exercice.consigne}</h3>

      {exercice.phrase_depart && (
        <div className="p-3 bg-gray-50 border-l-4 border-emerald-500 rounded text-gray-700 font-serif italic mb-4">
          « {exercice.phrase_depart} »
        </div>
      )}

      <div className="space-y-3 mb-6">
        {exercice.options.map((option, idx) => {
          let style = "w-full text-left p-4 rounded-xl border font-medium transition-all duration-200 ";
          
          if (selection === option) {
            style += option === exercice.reponse_correcte
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-rose-600 text-white border-rose-600 shadow-md";
          } else if (selection !== null && option === exercice.reponse_correcte) {
            style += "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
          } else {
            style += "bg-white text-gray-700 hover:bg-emerald-50 border-gray-200 hover:border-emerald-300";
          }

          return (
            <button
              key={idx}
              onClick={() => verifierReponse(option)}
              disabled={selection !== null}
              className={style}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selection && (
        <div className={`p-4 rounded-xl mb-4 text-sm ${valide ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
          <p className="font-bold mb-1">{valide ? "🎉 Excellente réponse !" : "💡 Explication :"}</p>
          <p>{exercice.explication}</p>
        </div>
      )}

      {selection && (
        <button
          onClick={() => {
            setSelection(null);
            setValide(null);
            onSuivant();
          }}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
        >
          {estDernier ? "Recommencer la série" : "Exercice suivant →"}
        </button>
      )}
    </div>
  );
};