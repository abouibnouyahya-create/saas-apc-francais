import React, { useEffect, useState } from 'react';

// URL dynamique de l'API (Render en production, local en dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [lecons, setLecons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Formulaire avec valeur par défaut 10ème Année et Thème
  const [form, setForm] = useState({
    theme: 'La mendicité',
    titre_texte: '',
    texte_support: '',
    discipline: 'Français',
    niveau: '10ème Année',
  });

  // Fonction sécurisée pour convertir n'importe quel type de donnée en texte (évite les erreurs React)
  const renderTexte = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  // Charger la liste complète des leçons
  const chargerLecons = async () => {
    setErreur(null);
    try {
      const res = await fetch(`${API_URL}/api/lecons`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLecons(data);
        } else {
          setLecons([]);
        }
      } else {
        setErreur(`Erreur serveur (${res.status}) lors du chargement.`);
      }
    } catch (err) {
      console.error('Erreur de connexion à l\'API :', err);
      setErreur('Impossible de se connecter au serveur backend.');
    }
  };

  useEffect(() => {
    chargerLecons();
  }, []);

  // Création d'une nouvelle leçon / thème
  const handleCreerLecon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur(null);

    const titreFinal = form.titre_texte 
      ? `Thème : ${form.theme} - Texte : ${form.titre_texte}` 
      : `Thème : ${form.theme}`;

    const leconPayload = {
      titre: titreFinal,
      discipline: form.discipline,
      niveau: form.niveau,
      competence: `Séquence APC - Thème : ${form.theme}`,
      situation_probleme: form.texte_support || `Exploitation du texte support sur le thème de ${form.theme}`,
    };

    try {
      const res = await fetch(`${API_URL}/api/lecons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leconPayload),
      });

      if (res.ok) {
        setForm({
          theme: 'La mendicité',
          titre_texte: '',
          texte_support: '',
          discipline: 'Français',
          niveau: '10ème Année',
        });
        await chargerLecons();
      } else {
        setErreur("Erreur lors de la création de la leçon.");
      }
    } catch (err) {
      console.error('Erreur lors de la création :', err);
      setErreur("Erreur de connexion lors de l'enregistrement.");
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
            Plateforme Pédagogique <span className="text-indigo-600">APC Mali (Secondaire)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion des Fiches et Séquences Pédagogiques — Phase Pilote : <strong className="text-indigo-600">10ème Année</strong>
          </p>
        </div>
        <button
          onClick={chargerLecons}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 text-xs transition-all flex items-center gap-2"
        >
          🔄 Actualiser la liste
        </button>
      </header>

      {/* MESSAGE D'ERREUR EVENTUEL */}
      {erreur && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          ⚠️ {erreur}
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (2/3) : FORMULAIRE + SÉQUENCES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Formulaire de création */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📖</span>
              Créer un Thème & Séquence d'Apprentissage
            </h2>

            <form onSubmit={handleCreerLecon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Thème d'étude</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: La mendicité, L'environnement..."
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Niveau (Secondaire)</label>
                  <select
                    value={form.niveau}
                    onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white font-bold text-indigo-700"
                  >
                    <option value="10ème Année">10ème Année (Pilote)</option>
                    <option value="11ème Année">11ème Année</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Titre du Texte Support</label>
                <input
                  type="text"
                  placeholder="Ex: 'Les mains tendues'"
                  value={form.titre_texte}
                  onChange={(e) => setForm({ ...form, titre_texte: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Texte Support / Extrait</label>
                <textarea
                  rows={3}
                  placeholder="Collez ici le texte support qui servira de base aux 3 activités..."
                  value={form.texte_support}
                  onChange={(e) => setForm({ ...form, texte_support: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer la Leçon / Thème'}
              </button>
            </form>
          </section>

          {/* LISTE ET CONTENU COMPLET DES LEÇONS */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📚</span>
              Vos Leçons ({lecons.length})
            </h2>

            {lecons.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                Aucune leçon disponible actuellement. Saisissez-en une ci-dessus !
              </div>
            ) : (
              <div className="space-y-6">
                {lecons.map((lecon, index) => (
                  <div key={lecon.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                    
                    {/* En-tête de la Leçon */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {renderTexte(lecon.discipline) || 'Discipline non spécifiée'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg mt-1">
                          {renderTexte(lecon.titre) || 'Sans titre'}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 font-bold text-xs rounded-lg border border-indigo-100">
                        {renderTexte(lecon.niveau) || '10ème Année'}
                      </span>
                    </div>

                    {/* Affichage complet de la Compétence */}
                    {lecon.competence && (
                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-800 font-bold block mb-1">🎯 Compétence visée :</strong>
                        <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {renderTexte(lecon.competence)}
                        </p>
                      </div>
                    )}

                    {/* Affichage du Texte Support ou Situation Problème */}
                    {lecon.situation_probleme && (
                      <div className="text-xs text-slate-600">
                        <strong className="text-slate-800 font-bold block mb-1">📄 Texte Support / Situation Problème :</strong>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed text-slate-700">
                          {renderTexte(lecon.situation_probleme)}
                        </div>
                      </div>
                    )}

                    {/* Découpage des 3 Activités APC */}
                    <div className="pt-2">
                      <strong className="text-xs font-bold text-slate-800 block mb-2">📌 Découpage APC (Séquence) :</strong>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                          <strong className="text-indigo-900 text-[11px] block mb-1">Activité 1 : Compréhension</strong>
                          <p className="text-[11px] text-indigo-950">Questions guidées pour analyser le thème et comprendre le texte.</p>
                        </div>
                        <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                          <strong className="text-indigo-900 text-[11px] block mb-1">Activité 2 : Structure</strong>
                          <p className="text-[11px] text-indigo-950">Analyse du plan, de la progression et des connecteurs logiques.</p>
                        </div>
                        <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                          <strong className="text-indigo-900 text-[11px] block mb-1">Activité 3 : Typologie</strong>
                          <p className="text-[11px] text-indigo-950">Étude du type de texte (argumentatif, etc.) et des faits de langue.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* COLONNE DROITE (1/3) : PANNEAU D'INFORMATION */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Statistiques</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 block">Total Leçons</span>
              <span className="text-3xl font-black text-indigo-600">{lecons.length}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h4 className="font-bold text-sm mb-2">10ème Année - APC</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toutes les données sauvegardées sont conservées et structurées par séquences d'apprentissage.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}