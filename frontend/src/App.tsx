import React, { useEffect, useState } from 'react';

// URL dynamique de l'API (Render en production, local en dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface Activite {
  titre: string;
  consigne: string;
}

interface SéquenceSequence {
  id?: number;
  theme: string;
  titre_texte: string;
  texte_support?: string;
  niveau: string;
  discipline: string;
  activite_comprehension?: Activite;
  activite_structure?: Activite;
  activite_typologie?: Activite;
}

export default function App() {
  const [sequences, setSequences] = useState<any[]>([]);

  // Formulaire axé sur le Thème et le Texte Support
  const [form, setForm] = useState({
    theme: 'La mendicité',
    titre_texte: '',
    texte_support: '',
    discipline: 'Littérature / Lecture',
    niveau: '10ème Année',
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Charger les séquences existantes
  const chargerSequences = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lecons`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSequences(data);
        } else {
          setSequences([]);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des séquences :', err);
    }
  };

  useEffect(() => {
    chargerSequences();
  }, []);

  // Enregistrement d'un thème et de sa séquence pédagogique
  const handleCreerSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Structure APC complète générée à partir du Thème et du Texte
    const sequencePayload = {
      titre: `Thème : ${form.theme} - Texte : ${form.titre_texte}`,
      discipline: form.discipline,
      niveau: form.niveau,
      competence: `Développer la compréhension critique, l'analyse structurale et la maîtrise des types de textes autour du thème : ${form.theme}`,
      situation_probleme: `Exploitation du texte support "${form.titre_texte}" relatif au thème de ${form.theme}.`,
      details_apc: {
        theme: form.theme,
        titre_texte: form.titre_texte,
        texte_support: form.texte_support,
        activite_1: {
          nom: "Activité 1 : Compréhension du texte",
          consigne: "Répondre aux questions de compréhension globale et détaillée pour dégager l'idée générale et les enjeux du texte."
        },
        activite_2: {
          nom: "Activité 2 : Structure du texte",
          consigne: "Analyser l'organisation interne du texte, dégager le plan (situation initiale, déroulement, chute) et repérer les connecteurs logiques."
        },
        activite_3: {
          nom: "Activité 3 : Typologie et faits de langue",
          consigne: "Identifier le type de texte (ex: argumentatif, narratif) et analyser les outils linguistiques caractéristiques employés par l'auteur."
        }
      }
    };

    try {
      const res = await fetch(`${API_URL}/api/lecons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sequencePayload),
      });

      if (res.ok) {
        setForm({
          theme: 'La mendicité',
          titre_texte: '',
          texte_support: '',
          discipline: 'Littérature / Lecture',
          niveau: '10ème Année',
        });
        await chargerSequences();
      }
    } catch (err) {
      console.error('Erreur lors de la création de la séquence :', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTexte = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Plateforme APC <span className="text-indigo-600">Séquences par Thèmes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enseignement Secondaire (Phase Pilote : <strong className="text-indigo-600">10ème Année</strong>) — Conduite d'activités par compétence.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-indigo-900">Modules APC Actifs</span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE & CENTRE : FORMULAIRE ET SÉQUENCES (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* FORMULAIRE CRÉATION DE THÈME ET TEXTE SUPPORT */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">📖</span>
              Créer un Thème & Séquence d'Apprentissage
            </h2>

            <form onSubmit={handleCreerSequence} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Thème d'étude</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: La mendicité, L'environnement, La citoyenneté..."
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Niveau</label>
                  <select
                    value={form.niveau}
                    onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white font-semibold text-indigo-700"
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
                  required
                  placeholder="Ex: 'Les mains tendues' ou extrait d'œuvre"
                  value={form.titre_texte}
                  onChange={(e) => setForm({ ...form, titre_texte: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contenu / Extrait du Texte Support (Optionnel)</label>
                <textarea
                  rows={4}
                  placeholder="Collez ici le texte support sur lequel porteront les activités 1, 2 et 3..."
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
                {loading ? 'Génération du module...' : 'Générer la Séquence APC (3 Activités)'}
              </button>
            </form>
          </section>

          {/* LISTE DES SÉQUENCES PÉDAGOGIQUES */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm">🗂️</span>
              Séquences & Thèmes Enregistrés ({sequences.length})
            </h2>

            {sequences.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                Aucun thème ou séquence enregistré pour le moment.
              </div>
            ) : (
              <div className="space-y-6">
                {sequences.map((item, index) => (
                  <div key={item.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-indigo-200 transition-all space-y-4">
                    
                    {/* Header de la séquence */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Thème & Séquence
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{renderTexte(item.titre)}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                        {renderTexte(item.niveau)}
                      </span>
                    </div>

                    {/* Découpage APC en 3 Activités */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Activité 1 */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">
                          Activité 1 : Compréhension
                        </span>
                        <p className="text-xs text-slate-600">
                          Questions guidées sur le texte pour amener les élèves à saisir le sens global et expliciter le thème.
                        </p>
                      </div>

                      {/* Activité 2 */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">
                          Activité 2 : Structure
                        </span>
                        <p className="text-xs text-slate-600">
                          Consignes portant sur l'organisation globale du texte, la progression et les connecteurs.
                        </p>
                      </div>

                      {/* Activité 3 */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">
                          Activité 3 : Typologie
                        </span>
                        <p className="text-xs text-slate-600">
                          Étude du genre/type de texte et repérage des caractéristiques grammaticales et linguistiques.
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* COLONNE DROITE : CADRE MÉTHODOLOGIQUE */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">📊</span>
              Architecture APC
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">1. Le Thème</strong>
                Ancrage social et culturel (ex: La mendicité).
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">2. Le Texte Support</strong>
                Support concret d'observation et de travail.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">3. Les 3 Activités</strong>
                Compréhension → Structure → Typologie.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h4 className="font-bold text-white text-sm mb-2">Pédagogie de la 10ème Année</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              L'objectif final est de développer l'autonomie de l'apprenant face à n'importe quel texte en lui donnant des clés d'analyse réutilisables.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}