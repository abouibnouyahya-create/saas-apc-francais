import React, { useEffect, useState } from 'react';

interface EnteteAdministratif {
  academie: string;
  cap: string;
  etablissement: string;
  enseignant: string;
  anneeScolaire: string;
  effectif: string;
}

interface ActiviteAPC {
  titre: string;
  consignes: string[];
  synthese_partielle: string;
}

interface SectionEval {
  consigne: string;
  questions: string[];
}

interface FicheLeconAPC {
  id: string;
  discipline: string;
  niveau: string;
  titre: string;
  pre_evaluation: string[];
  situation_probleme: { texte: string; consigne: string };
  activites: ActiviteAPC[];
  synthese_generale: string[];
  evaluation: SectionEval;
  remediation: SectionEval;
  enrichissement: SectionEval;
}

const DISCIPLINES = ['Toutes', 'Grammaire', 'Orthographe', 'Expression Écrite', 'Lexique', 'Lecture Méthodique'];

export default function App() {
  const [lecons, setLecons] = useState<FicheLeconAPC[]>([]);
  const [disciplineFiltre, setDisciplineFiltre] = useState<string>('Toutes');
  const [leconSelectionnee, setLeconSelectionnee] = useState<FicheLeconAPC | null>(null);
  const [afficherConfigEntete, setAfficherConfigEntete] = useState(false);
  const [afficherFormulaireAjout, setAfficherFormulaireAjout] = useState(false);

  // Formulaire de création de fiche
  const [nouvelleLecon, setNouvelleLecon] = useState({
    discipline: 'Grammaire',
    niveau: '10e Année',
    titre: '',
    texteSituation: '',
    consigneSituation: '',
    syntheseGenerale: ''
  });

  // En-tête administratif
  const [entete, setEntete] = useState<EnteteAdministratif>(() => {
    const localData = localStorage.getItem('apc_entete_enseignant');
    if (localData) {
      try { return JSON.parse(localData); } catch (e) {}
    }
    return {
      academie: "Rive Gauche - Bamako",
      cap: "Bamako Coura",
      etablissement: "Lycée Progrès",
      enseignant: "M. Traoré",
      anneeScolaire: "2025-2026",
      effectif: "45 élèves"
    };
  });

  const handleEnteteChange = (champ: keyof EnteteAdministratif, valeur: string) => {
    const nouvelEntete = { ...entete, [champ]: valeur };
    setEntete(nouvelEntete);
    localStorage.setItem('apc_entete_enseignant', JSON.stringify(nouvelEntete));
  };

  const chargerLecons = () => {
    fetch('http://127.0.0.1:8000/api/lecons')
      .then((res) => res.json())
      .then((data: FicheLeconAPC[]) => {
        setLecons(data);
        if (data.length > 0 && !leconSelectionnee) {
          setLeconSelectionnee(data[0]);
        }
      })
      .catch((err) => console.error("Erreur Backend :", err));
  };

  useEffect(() => {
    chargerLecons();
  }, []);

  const handleCreerLecon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: FicheLeconAPC = {
      id: `fiche-${Date.now()}`,
      discipline: nouvelleLecon.discipline,
      niveau: nouvelleLecon.niveau,
      titre: nouvelleLecon.titre,
      pre_evaluation: ["Rappel de la leçon précédente."],
      situation_probleme: {
        texte: nouvelleLecon.texteSituation,
        consigne: nouvelleLecon.consigneSituation
      },
      activites: [
        {
          titre: "Activité 1 : Observation et découverte",
          consignes: ["Lisez attentivement le texte.", "Identifiez les notions clés."],
          synthese_partielle: "Analyse initiale du concept."
        }
      ],
      synthese_generale: nouvelleLecon.syntheseGenerale.split('\n').filter(l => l.trim() !== ''),
      evaluation: {
        consigne: "Évaluation des acquis :",
        questions: ["Exercice d'application globale."]
      },
      remediation: {
        consigne: "Exercice de soutien :",
        questions: ["Exercice simplifié pour consolider les bases."]
      },
      enrichissement: {
        consigne: "Exercice d'approfondissement :",
        questions: ["Production personnelle complexe."]
      }
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/lecons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAfficherFormulaireAjout(false);
        setNouvelleLecon({
          discipline: 'Grammaire', niveau: '10e Année', titre: '',
          texteSituation: '', consigneSituation: '', syntheseGenerale: ''
        });
        chargerLecons();
      }
    } catch (err) {
      console.error("Erreur de création :", err);
    }
  };

  const leconsFiltrees = lecons.filter(
    (l) => disciplineFiltre === 'Toutes' || l.discipline === disciplineFiltre
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* BARRE LATÉRALE */}
      <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 min-h-screen">
        <div className="mb-6 cursor-pointer" onClick={() => setLeconSelectionnee(null)}>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            SaaS ÉdTech APC
          </span>
          <h1 className="text-xl font-black text-slate-800 mt-2">Français 10e Année</h1>
        </div>

        {/* FILTRE DISCIPLINE */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Discipline
          </label>
          <select
            value={disciplineFiltre}
            onChange={(e) => setDisciplineFiltre(e.target.value)}
            className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* LISTE DES LEÇONS */}
        <nav className="space-y-1 overflow-y-auto mb-4 flex-1">
          {leconsFiltrees.map((item) => {
            const isSelected = leconSelectionnee?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setLeconSelectionnee(item)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                }`}
              >
                <div className="text-[10px] opacity-75 font-normal">{item.discipline}</div>
                <div>{item.titre}</div>
              </button>
            );
          })}
        </nav>

        {/* BOUTONS ACTIONS */}
        <div className="pt-4 border-t border-slate-200 mt-auto space-y-2">
          <button
            onClick={() => setAfficherFormulaireAjout(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm"
          >
            <span>➕ Créer une Fiche</span>
          </button>

          <button
            onClick={() => setAfficherConfigEntete(!afficherConfigEntete)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <span>⚙️ Configurer En-tête</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* MODAL / FORMULAIRE DE CRÉATION DE FICHE */}
        {afficherFormulaireAjout && (
          <div className="mb-6 bg-white p-6 rounded-2xl border border-emerald-300 shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">➕ Créer une Nouvelle Fiche de Leçon APC</h3>
              <button onClick={() => setAfficherFormulaireAjout(false)} className="text-xs text-slate-400 font-bold">✕ Fermer</button>
            </div>
            <form onSubmit={handleCreerLecon} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Discipline</label>
                  <select
                    value={nouvelleLecon.discipline}
                    onChange={(e) => setNouvelleLecon({ ...nouvelleLecon, discipline: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1"
                  >
                    {DISCIPLINES.filter(d => d !== 'Toutes').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Titre de la leçon</label>
                  <input
                    type="text"
                    required
                    value={nouvelleLecon.titre}
                    onChange={(e) => setNouvelleLecon({ ...nouvelleLecon, titre: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Texte de la Situation-Problème</label>
                <textarea
                  required
                  rows={2}
                  value={nouvelleLecon.texteSituation}
                  onChange={(e) => setNouvelleLecon({ ...nouvelleLecon, texteSituation: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Consigne de la Situation-Problème</label>
                <input
                  type="text"
                  required
                  value={nouvelleLecon.consigneSituation}
                  onChange={(e) => setNouvelleLecon({ ...nouvelleLecon, consigneSituation: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Synthèse Générale (une règle par ligne)</label>
                <textarea
                  required
                  rows={3}
                  value={nouvelleLecon.syntheseGenerale}
                  onChange={(e) => setNouvelleLecon({ ...nouvelleLecon, syntheseGenerale: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700">
                Enregistrer la fiche dans la BDD
              </button>
            </form>
          </div>
        )}

        {/* AFFICHAGE CONFIGURATION EN-TÊTE */}
        {afficherConfigEntete && (
          <div className="mb-6 bg-white p-6 rounded-2xl border border-emerald-300 shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">✏️ Personnaliser mes Informations Administratives</h3>
              <button onClick={() => setAfficherConfigEntete(false)} className="text-xs text-slate-400 font-bold">✕ Fermer</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Académie d'Enseignement</label>
                <input type="text" value={entete.academie} onChange={(e) => handleEnteteChange('academie', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">CAP</label>
                <input type="text" value={entete.cap} onChange={(e) => handleEnteteChange('cap', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Établissement</label>
                <input type="text" value={entete.etablissement} onChange={(e) => handleEnteteChange('etablissement', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nom de l'Enseignant</label>
                <input type="text" value={entete.enseignant} onChange={(e) => handleEnteteChange('enseignant', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Année Scolaire</label>
                <input type="text" value={entete.anneeScolaire} onChange={(e) => handleEnteteChange('anneeScolaire', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Effectif / Classe</label>
                <input type="text" value={entete.effectif} onChange={(e) => handleEnteteChange('effectif', e.target.value)} className="w-full text-xs p-2 rounded-lg border border-slate-200 mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* AFFICHAGE DE LA LEÇON SÉLECTIONNÉE */}
        {leconSelectionnee ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* EN-TÊTE ADMINISTRATIF */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <p className="font-extrabold text-slate-800 uppercase">République du Mali</p>
                  <p className="text-[10px] text-slate-500 italic">Un Peuple - Un But - Une Foi</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-800">AE : {entete.academie}</p>
                  <p className="text-slate-600">CAP : {entete.cap}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-slate-700">
                <div><span className="font-bold">Établissement :</span> {entete.etablissement}</div>
                <div><span className="font-bold">Professeur :</span> {entete.enseignant}</div>
                <div><span className="font-bold">Année :</span> {entete.anneeScolaire}</div>
                <div><span className="font-bold">Effectif :</span> {entete.effectif}</div>
              </div>
            </div>

            {/* CONTENU DE LA FICHE PÉDAGOGIQUE APC */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  {leconSelectionnee.discipline}
                </span>
                <h1 className="text-2xl font-black text-slate-800 mt-1">
                  Fiche de Leçon : {leconSelectionnee.titre}
                </h1>
              </div>

              {/* I. Pré-évaluation */}
              {leconSelectionnee.pre_evaluation && leconSelectionnee.pre_evaluation.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-xs mb-2 uppercase">I. Pré-évaluation / Rappels</h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {leconSelectionnee.pre_evaluation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* II. Situation-Problème */}
              {leconSelectionnee.situation_probleme && (
                <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-900 text-xs mb-2 uppercase">II. Situation-Problème</h3>
                  <p className="text-xs italic text-amber-950 mb-2">
                    "{leconSelectionnee.situation_probleme.texte}"
                  </p>
                  <p className="text-xs font-semibold text-amber-900">
                    Consigne : {leconSelectionnee.situation_probleme.consigne}
                  </p>
                </div>
              )}

              {/* III. Déroulement des Activités */}
              {leconSelectionnee.activites && leconSelectionnee.activites.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase">III. Déroulement des Activités</h3>
                  {leconSelectionnee.activites.map((act, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                      <h4 className="font-semibold text-emerald-700 text-xs">{act.titre}</h4>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        {act.consignes.map((c, cIdx) => (
                          <li key={cIdx}>{c}</li>
                        ))}
                      </ul>
                      <div className="bg-emerald-50 p-2 rounded text-[11px] text-emerald-800 border border-emerald-100">
                        <strong>Synthèse partielle :</strong> {act.synthese_partielle}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* IV. Synthèse générale */}
              {leconSelectionnee.synthese_generale && leconSelectionnee.synthese_generale.length > 0 && (
                <div className="bg-emerald-50/40 p-4 rounded-lg border border-emerald-200">
                  <h3 className="font-bold text-emerald-900 text-xs mb-2 uppercase">IV. Synthèse Générale</h3>
                  <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1">
                    {leconSelectionnee.synthese_generale.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* V. Évaluation */}
              {leconSelectionnee.evaluation && (
                <div className="border border-blue-200 bg-blue-50/30 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 text-xs mb-2 uppercase">V. Évaluation</h3>
                  <p className="text-xs text-blue-950 font-medium mb-2">{leconSelectionnee.evaluation.consigne}</p>
                  <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                    {leconSelectionnee.evaluation.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* VI & VII. Remédiation & Enrichissement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leconSelectionnee.remediation && (
                  <div className="border border-orange-200 bg-orange-50/30 p-4 rounded-lg">
                    <h3 className="font-bold text-orange-900 text-xs mb-1 uppercase">VI. Remédiation</h3>
                    <p className="text-[11px] text-orange-950 font-medium mb-2">{leconSelectionnee.remediation.consigne}</p>
                    <ul className="list-disc list-inside text-[11px] text-orange-900 space-y-1">
                      {leconSelectionnee.remediation.questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {leconSelectionnee.enrichissement && (
                  <div className="border border-purple-200 bg-purple-50/30 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-900 text-xs mb-1 uppercase">VII. Enrichissement</h3>
                    <p className="text-[11px] text-purple-950 font-medium mb-2">{leconSelectionnee.enrichissement.consigne}</p>
                    <ul className="list-disc list-inside text-[11px] text-purple-900 space-y-1">
                      {leconSelectionnee.enrichissement.questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Bienvenue sur votre Espace APC</h2>
            <p className="text-xs">Sélectionnez une leçon dans le menu de gauche ou créez-en une nouvelle avec le bouton ➕.</p>
          </div>
        )}
      </main>
    </div>
  );
}