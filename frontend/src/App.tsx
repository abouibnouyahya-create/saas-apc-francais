import React, { useEffect, useState } from 'react';

// URL dynamique de l'API (Render en production, local en dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface Lecon {
  id?: number;
  titre: string;
  discipline: string;
  niveau: string;
  competence?: string;
  situation_probleme?: any;
}

export default function App() {
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [form, setForm] = useState({
    titre: '',
    discipline: 'Grammaire',
    niveau: '10e Année',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // État pour gérer quelle leçon est actuellement ouverte (cliquée)
  const [leconOuverteId, setLeconOuverteId] = useState<number | null>(null);

  // Fonction pour traiter intelligemment le champ "Situation Problème"
  const parseSituation = (val: any) => {
    if (!val) return null;

    let data = val;

    if (typeof val === 'string') {
      try {
        data = JSON.parse(val);
      } catch (e) {
        return { texte: val, consigne: null };
      }
    }

    if (typeof data === 'object' && data !== null) {
      return {
        texte: data.texte || data.texte_support || data.situation || null,
        consigne: data.consigne || data.consignes || null,
        raw: !data.texte && !data.consigne ? JSON.stringify(data) : null,
      };
    }

    return { texte: String(val), consigne: null };
  };

  // Charger les leçons
  const chargerLecons = async () => {
    setErreur(null);
    try {
      const res = await fetch(`${API_URL}/api/lecons`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLecons(data);
          // Ouvrir la première leçon par défaut si elle existe
          if (data.length > 0 && data[0].id) {
            setLeconOuverteId(data[0].id);
          }
        } else {
          setLecons([]);
        }
      } else {
        setErreur(`Erreur lors du chargement (${res.status})`);
      }
    } catch (err) {
      console.error('Erreur :', err);
      setErreur('Impossible de contacter le serveur backend.');
    }
  };

  useEffect(() => {
    chargerLecons();
  }, []);

  // Inverser l'état ouvert/fermé lors du clic
  const toggleLecon = (id?: number) => {
    if (!id) return;
    setLeconOuverteId(leconOuverteId === id ? null : id);
  };

  // Création d'une nouvelle leçon
  const handleCreerLecon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);

    const leconPayload = {
      titre: form.titre,
      discipline: form.discipline,
      niveau: form.niveau,
      competence: `Développement des compétences en ${form.discipline} - ${form.titre}`,
      situation_probleme: JSON.stringify({
        texte: `Situation d'apprentissage pour la leçon : ${form.titre}`,
        consigne: `Analyser le contenu et effectuer les exercices relatifs à : ${form.titre}`,
      }),
    };

    try {
      const res = await fetch(`${API_URL}/api/lecons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leconPayload),
      });

      if (res.ok) {
        setForm({
          titre: '',
          discipline: 'Grammaire',
          niveau: '10e Année',
        });
        await chargerLecons();
      } else {
        setErreur('Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      console.error('Erreur :', err);
      setErreur('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Plateforme Pédagogique <span className="text-indigo-600">APC Mali</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Banque de fiches et leçons du Secondaire — Phase pilote : <strong className="text-indigo-600">10e Année</strong>.
          </p>
        </div>
        <button
          onClick={chargerLecons}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 text-xs transition-all flex items-center gap-2"
        >
          🔄 Actualiser les leçons
        </button>
      </header>

      {erreur && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          ⚠️ {erreur}
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Formulaire de création */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">✍️</span>
              Ajouter un Titre de Leçon
            </h2>

            <form onSubmit={handleCreerLecon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Titre de la leçon</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Les propositions subordonnées relatives"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Discipline</label>
                  <select
                    value={form.discipline}
                    onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                  >
                    <option value="Grammaire">Grammaire</option>
                    <option value="Orthographe">Orthographe</option>
                    <option value="Conjugaison">Conjugaison</option>
                    <option value="Vocabulaire">Vocabulaire</option>
                    <option value="Expression Écrite">Expression Écrite</option>
                    <option value="Lecture / Littérature">Lecture / Littérature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Niveau</label>
                  <select
                    value={form.niveau}
                    onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white font-bold text-indigo-700"
                  >
                    <option value="10e Année">10e Année (Pilote)</option>
                    <option value="11e Année">11e Année</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer la Leçon'}
              </button>
            </form>
          </section>

          {/* LISTE DES LEÇONS CLIQUABLES */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📚</span>
                Leçons Enregistrées ({lecons.length})
              </span>
              <span className="text-xs text-slate-400 font-normal">Cliquez sur une leçon pour l'ouvrir</span>
            </h2>

            {lecons.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                Aucune leçon enregistrée.
              </div>
            ) : (
              <div className="space-y-4">
                {lecons.map((item, index) => {
                  const itemKey = item.id || index;
                  const isOuvert = leconOuverteId === itemKey;
                  const situationParsed = parseSituation(item.situation_probleme);

                  return (
                    <div 
                      key={itemKey} 
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        isOuvert ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200/80 hover:border-indigo-300 shadow-sm'
                      }`}
                    >
                      {/* EN-TÊTE CLIQUABLE */}
                      <button
                        type="button"
                        onClick={() => toggleLecon(item.id || index)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                              {item.discipline}
                            </span>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-bold border border-indigo-100">
                              {item.niveau}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base md:text-lg">
                            {item.titre}
                          </h3>
                        </div>

                        {/* BOUTON D'ÉTAT (Ouvrir / Fermer) */}
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs shrink-0 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                          <span>{isOuvert ? 'Masquer' : 'Afficher'}</span>
                          <span className={`transform transition-transform ${isOuvert ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </button>

                      {/* CONTENU DÉPLIABLE DE LA LEÇON */}
                      {isOuvert && (
                        <div className="p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50">
                          
                          {/* Compétence */}
                          {item.competence && (
                            <div className="pt-4">
                              <strong className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                                🎯 Compétence :
                              </strong>
                              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                                {item.competence}
                              </p>
                            </div>
                          )}

                          {/* Situation Problème / Texte & Consigne */}
                          {situationParsed && (
                            <div className="space-y-3">
                              {situationParsed.texte && (
                                <div>
                                  <strong className="text-xs font-bold text-indigo-900 uppercase tracking-wide block mb-1">
                                    📄 Situation / Texte Support :
                                  </strong>
                                  <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
                                    {situationParsed.texte}
                                  </p>
                                </div>
                              )}

                              {situationParsed.consigne && (
                                <div>
                                  <strong className="text-xs font-bold text-emerald-900 uppercase tracking-wide block mb-1">
                                    ✍️ Consigne :
                                  </strong>
                                  <p className="text-sm font-medium text-emerald-950 bg-emerald-50/80 p-4 rounded-xl border border-emerald-100">
                                    {situationParsed.consigne}
                                  </p>
                                </div>
                              )}

                              {situationParsed.raw && (
                                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                                  {situationParsed.raw}
                                </p>
                              )}
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* COLONNE DROITE (1/3) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Statistiques</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 block">Total Leçons</span>
              <span className="text-3xl font-black text-indigo-600">{lecons.length}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h4 className="font-bold text-sm mb-2">Navigation fluide</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cliquez sur n'importe quel titre de leçon pour afficher ou masquer immédiatement sa situation-problème et sa consigne.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}