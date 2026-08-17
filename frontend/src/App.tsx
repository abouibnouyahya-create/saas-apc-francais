import React, { useEffect, useState } from 'react';

// URL dynamique (Render en production, localhost en développement)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface Lecon {
  id?: number;
  titre: string;
  discipline: string;
  niveau: string;
  competence: string;
  situation_probleme: string;
}

export default function App() {
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [form, setForm] = useState<Lecon>({
    titre: '',
    discipline: 'Français',
    niveau: '7ème Année',
    competence: '',
    situation_probleme: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Charger les leçons depuis l'API
  const chargerLecons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lecons`);
      if (res.ok) {
        const data = await res.json();
        setLecons(data);
      }
    } catch (err) {
      console.error('Erreur de chargement des leçons :', err);
    }
  };

  useEffect(() => {
    chargerLecons();
  }, []);

  // Soumettre une nouvelle leçon
  const handleCreerLecon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/lecons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          titre: '',
          discipline: 'Français',
          niveau: '7ème Année',
          competence: '',
          situation_probleme: '',
        });
        await chargerLecons();
      }
    } catch (err) {
      console.error('Erreur lors de la création :', err);
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
            Gestion et préparation des fiches de cours selon l'Approche Par Compétences.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-indigo-900">Serveur Actif</span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE & CENTRE : FORMULAIRE ET LISTE (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Formulaire de création */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">✍️</span>
              Créer une Fiche de Leçon
            </h2>

            <form onSubmit={handleCreerLecon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Titre de la leçon</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: La subordination avec 'parce que'"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Discipline</label>
                  <select
                    value={form.discipline}
                    onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                  >
                    <option value="Français">Français</option>
                    <option value="Grammaire">Grammaire</option>
                    <option value="Vocabulaire">Vocabulaire</option>
                    <option value="Conjugaison">Conjugaison</option>
                    <option value="Orthographe">Orthographe</option>
                    <option value="Lecture / Expression">Lecture / Expression</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Niveau</label>
                  <select
                    value={form.niveau}
                    onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                  >
                    <option value="7ème Année">7ème Année</option>
                    <option value="8ème Année">8ème Année</option>
                    <option value="9ème Année">9ème Année</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Compétence visée</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Utiliser correctement les expressions de cause"
                  value={form.competence}
                  onChange={(e) => setForm({ ...form, competence: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Situation Problème</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrivez le contexte de départ et le problème concret à résoudre par l'élève..."
                  value={form.situation_probleme}
                  onChange={(e) => setForm({ ...form, situation_probleme: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
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

          {/* Liste des leçons */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📚</span>
              Leçons Enregistrées ({lecons.length})
            </h2>

            {lecons.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                Aucune leçon enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {lecons.map((l) => (
                  <div key={l.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-indigo-200 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-900 text-base">{l.titre}</h3>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">{l.discipline}</span>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">{l.niveau}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      <strong className="text-slate-700">Compétence :</strong> {l.competence}
                    </p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-700 block mb-1">Situation Problème :</strong>
                      {l.situation_probleme}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* COLONNE DROITE : PANNEAU DE CONTRÔLE AMÉLIORÉ (1/3) */}
        <div className="space-y-6">
          
          {/* Carte 1 : Métriques */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">📊</span>
              Aperçu Global
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leçons</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{lecons.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connexion API</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  OK
                </span>
              </div>
            </div>
          </div>

          {/* Carte 2 : Guide APC Mali */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/20 uppercase tracking-wider">
                Rappel APC Mali
              </span>
            </div>
            <h4 className="font-bold text-white text-sm mb-2">Approche Par Compétences</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Chaque fiche pédagogique doit obligatoirement partir d'une <strong>Situation Problème</strong> concrète, ancrée dans le quotidien des élèves.
            </p>
            <div className="text-[11px] text-indigo-200 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              💡 <em>Assurez-vous que l'évaluation finale vérifie bien la compétence visée.</em>
            </div>
          </div>

          {/* Carte 3 : Actions Rapides */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Actions Rapides
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between border border-transparent hover:border-slate-200"
              >
                <span>➕ Haut de page (Formulaire)</span>
                <span className="text-slate-400">↑</span>
              </button>
              <button 
                onClick={chargerLecons} 
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between border border-transparent hover:border-slate-200"
              >
                <span>🔄 Actualiser les leçons</span>
                <span className="text-slate-400">↻</span>
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}