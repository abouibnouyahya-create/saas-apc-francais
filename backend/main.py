from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./apc_pedagogie.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FicheLeconModel(Base):
    __tablename__ = "lecons"

    id = Column(String, primary_key=True, index=True)
    discipline = Column(String, index=True)
    niveau = Column(String)
    titre = Column(String)
    pre_evaluation = Column(JSON)
    situation_probleme = Column(JSON)
    activites = Column(JSON)
    synthese_generale = Column(JSON)
    evaluation = Column(JSON)
    remediation = Column(JSON)
    enrichissement = Column(JSON)

Base.metadata.create_all(bind=engine)

class ActiviteAPC(BaseModel):
    titre: str
    consignes: List[str]
    synthese_partielle: str

class SectionEval(BaseModel):
    consigne: str
    questions: List[str]

class SituationProbleme(BaseModel):
    texte: str
    consigne: str

class FicheLeconSchema(BaseModel):
    id: str
    discipline: str
    niveau: str
    titre: str
    pre_evaluation: List[str]
    situation_probleme: SituationProbleme
    activites: List[ActiviteAPC]
    synthese_generale: List[str]
    evaluation: SectionEval
    remediation: SectionEval
    enrichissement: SectionEval

    class Config:
        orm_mode = True

app = FastAPI(title="SaaS APC Français 10e - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Base de données enrichie avec plusieurs leçons par discipline
LECONS_INITIALES = [
    # --- GRAMMAIRE ---
    {
        "id": "gram-01",
        "discipline": "Grammaire",
        "niveau": "10e Année",
        "titre": "Les propositions subordonnées relatives",
        "pre_evaluation": [
            "Qu'est-ce qu'une proposition indépendante ?",
            "Identifier le pronom relatif dans la phrase : 'L'élève qui étudie réussit.'"
        ],
        "situation_probleme": {
            "texte": "Au cours d'un devoir d'expression écrite, un élève écrit : 'J'ai rencontré un artisan. Cet artisan fabrique des masques en bois. Les masques sont vendus au marché.' Son camarade lui dit que son texte est lourd à cause des répétitions.",
            "consigne": "Proposez une seule phrase fluide combinant ces idées à l'aide de pronoms relatifs et expliquez leur fonction."
        },
        "activites": [
            {
                "titre": "Activité 1 : Découverte et repérage de l'antécédent",
                "consignes": [
                    "Lisez le corpus de phrases au tableau.",
                    "Soulignez les mots répétés et entourez les pronoms qui les remplacent.",
                    "Précisez la nature et le rôle du mot remplacé (l'antécédent)."
                ],
                "synthese_partielle": "Le pronom relatif remplace un nom ou groupe nominal appelé antécédent placé juste avant lui."
            }
        ],
        "synthese_generale": [
            "La proposition subordonnée relative complète un nom (l'antécédent) et fait partie du groupe nominal.",
            "Elle est introduite par un pronom relatif simple (qui, que, quoi, dont, où) ou composé (lequel...)."
        ],
        "evaluation": {
            "consigne": "Reliez les deux phrases par un pronom relatif :",
            "questions": ["J'ai acheté un roman. Ce roman raconte l'histoire du Mali."]
        },
        "remediation": {
            "consigne": "Complétez par qui ou que :",
            "questions": ["Le livre ___ je lis est passionnant."]
        },
        "enrichissement": {
            "consigne": "Rédigez 3 phrases avec dont et où.",
            "questions": []
        }
    },
    {
        "id": "gram-02",
        "discipline": "Grammaire",
        "niveau": "10e Année",
        "titre": "Les propositions subordonnées circonstancielles de cause et de conséquence",
        "pre_evaluation": [
            "Quelle est la différence entre une cause et une conséquence ?",
            "Citez deux conjonctions de subordination."
        ],
        "situation_probleme": {
            "texte": "Un agriculteur explique : 'La pluie n'est pas tombée. La récolte est mauvaise.' Son fils veut exprimer cette relation en une seule phrase pour montrer le lien logique direct.",
            "consigne": "Formulez deux phrases : l'une exprimant la cause et l'autre la conséquence."
        },
        "activites": [
            {
                "titre": "Activité 1 : Expression de la cause (parce que, puisque, comme)",
                "consignes": [
                    "Repérez le fait qui explique le résultat.",
                    "Introduisez la subordonnée par 'parce que' ou 'puisque'."
                ],
                "synthese_partielle": "La cause indique la raison d'un fait. Elle répond à la question 'Pourquoi ?'."
            }
        ],
        "synthese_generale": [
            "La subordonnée de cause indique la raison (parce que, car, puisque).",
            "La subordonnée de conséquence indique le résultat d'une action (si bien que, tellement... que)."
        ],
        "evaluation": {
            "consigne": "Exprimez la cause puis la conséquence entre ces idées :",
            "questions": ["Il a bien révisé. Il a réussi son examen."]
        },
        "remediation": {
            "consigne": "Complétez par 'parce que' ou 'donc' :",
            "questions": ["Il pleut, ___ je prends mon parapluie."]
        },
        "enrichissement": {
            "consigne": "Écrivez un court paragraphe logique sur l'environnement.",
            "questions": []
        }
    },

    # --- ORTHOGRAPHE ---
    {
        "id": "ortho-01",
        "discipline": "Orthographe",
        "niveau": "10e Année",
        "titre": "L'accord du participe passé avec l'auxiliaire avoir",
        "pre_evaluation": [
            "Quels sont les deux auxiliaires des temps composés ?",
            "Quelle est la règle générale avec l'auxiliaire être ?"
        ],
        "situation_probleme": {
            "texte": "Awa écrit : 'Les lettres que j'ai reçu m'ont fait plaisir.' Moussa la corrige : 'Les lettres que j'ai reçues...'. Awa cherche à comprendre la règle.",
            "consigne": "Aidez Awa en analysant la position du Complément d'Objet Direct (COD)."
        },
        "activites": [
            {
                "titre": "Activité 1 : Repérage de la position du COD",
                "consignes": [
                    "Trouvez le COD dans chaque phrase.",
                    "Observez s'il se trouve avant ou après le verbe."
                ],
                "synthese_partielle": "Avec avoir, le participe passé s'accorde avec le COD si celui-ci est placé AVANT le verbe."
            }
        ],
        "synthese_generale": [
            "Le participe passé employé avec 'avoir' s'accorde en genre et en nombre avec le COD s'il est placé avant le verbe.",
            "Il reste invariable si le COD est après ou s'il n'y a pas de COD."
        ],
        "evaluation": {
            "consigne": "Accordez correctement les participes passés :",
            "questions": ["Les fleurs qu'il a (cueillir) sont très fraîches."]
        },
        "remediation": {
            "consigne": "Soulignez le COD placé avant :",
            "questions": ["La chanson qu'elle a chantée."]
        },
        "enrichissement": {
            "consigne": "Incitez 3 exemples complexes au passé composé.",
            "questions": []
        }
    },
    {
        "id": "ortho-02",
        "discipline": "Orthographe",
        "niveau": "10e Année",
        "titre": "L'accord des adjectifs de couleur",
        "pre_evaluation": [
            "Qu'est-ce qu'un adjectif qualificatif ?",
            "Comment s'accorde un adjectif qualificatif simple ?"
        ],
        "situation_probleme": {
            "texte": "Un élève décrit un tableau : 'J'ai vu des robes bleues et des chaussures marron.' Il se demande pourquoi 'bleues' prend un 's' mais pas 'marron'.",
            "consigne": "Expliquez la règle particulière des adjectifs de couleur issus de noms."
        },
        "activites": [
            {
                "titre": "Activité 1 : Adjectifs simples vs Adjectifs dérivés de noms",
                "consignes": [
                    "Classez les couleurs : rouge, vert, marron, orange, bleu.",
                    "Identifiez celles qui désignent aussi un objet/fruit réel."
                ],
                "synthese_partielle": "Les adjectifs dérivés de noms (marron, orange) restent en général invariables."
            }
        ],
        "synthese_generale": [
            "Les adjectifs de couleur simples s'accordent (des vestes vertes).",
            "Les noms utilisés comme adjectifs de couleur restent invariables (des chemises orange), sauf exceptions (rose, mauve, fauve...)."
        ],
        "evaluation": {
            "consigne": "Accordez si nécessaire :",
            "questions": ["Des yeux (bleu)", "Des sacs (marron)", "Des fleurs (rose)"]
        },
        "remediation": {
            "consigne": "Indiquez si l'adjectif varie ou non :",
            "questions": ["vert", "orange"]
        },
        "enrichissement": {
            "consigne": "Rédigez un texte descriptif de mode avec 4 couleurs.",
            "questions": []
        }
    },

    # --- EXPRESSION ÉCRITE ---
    {
        "id": "expr-01",
        "discipline": "Expression Écrite",
        "niveau": "10e Année",
        "titre": "La structure du texte argumentatif",
        "pre_evaluation": [
            "Qu'est-ce qu'une thèse ?",
            "Citez deux connecteurs logiques d'addition."
        ],
        "situation_probleme": {
            "texte": "Au lycée, certains veulent autoriser le téléphone en classe, d'autres s'y opposent.",
            "consigne": "Rédigez un paragraphe argumentatif structuré pour défendre l'un des points de vue."
        },
        "activites": [
            {
                "titre": "Activité 1 : Thèse, Argument et Exemple",
                "consignes": ["Distinguez la thèse, les arguments et les exemples dans le texte modèle."],
                "synthese_partielle": "Chaque paragraphe développe un argument appuyé par un exemple concret."
            }
        ],
        "synthese_generale": [
            "Introduction : Amorce + Sujet + Thèse + Plan.",
            "Développement : Arguments reliés par des connecteurs + Exemples.",
            "Conclusion : Bilan résumé + Ouverture."
        ],
        "evaluation": {
            "consigne": "Trouvez un argument et un exemple pour : 'Le sport est bon pour la santé.'",
            "questions": []
        },
        "remediation": {
            "consigne": "Remettez dans l'ordre : Thèse, Exemple, Argument.",
            "questions": []
        },
        "enrichissement": {
            "consigne": "Rédigez une introduction complète sur la lecture.",
            "questions": []
        }
    },
    {
        "id": "expr-02",
        "discipline": "Expression Écrite",
        "niveau": "10e Année",
        "titre": "L'insertion du dialogue dans un récit",
        "pre_evaluation": [
            "Quels sont les signes de ponctuation du dialogue ?",
            "Citez 3 verbes de parole."
        ],
        "situation_probleme": {
            "texte": "Dans une rédaction, un élève écrit le dialogue d'un seul bloc sans guillemets ni tirets, rendant l'histoire confuse.",
            "consigne": "Récrivez la scène en appliquant les règles de ponctuation et de mise en page du dialogue."
        },
        "activites": [
            {
                "titre": "Activité 1 : La ponctuation et les verbes de parole",
                "consignes": [
                    "Identifiez les deux-points, guillemets et tirets.",
                    "Variez les verbes (déclarer, répliquer, s'exclamer)."
                ],
                "synthese_partielle": "Le dialogue utilise une ponctuation spécifique et des verbes d'élocution variés."
            }
        ],
        "synthese_generale": [
            "Chaque réplique commence par un tiret et un retour à la ligne.",
            "Les paroles directes sont encadrées par des guillemets.",
            "Les verbes de parole apportent des précisions sur le ton et l'attitude."
        ],
        "evaluation": {
            "consigne": "Punctuez correctement le passage dialogué distribué.",
            "questions": []
        },
        "remediation": {
            "consigne": "Remplacez 'dire' par un verbe plus précis.",
            "questions": []
        },
        "enrichissement": {
            "consigne": "Écrivez une scène de dispute théâtrale de 6 répliques.",
            "questions": []
        }
    },

    # --- LEXIQUE ---
    {
        "id": "lex-01",
        "discipline": "Lexique",
        "niveau": "10e Année",
        "titre": "Le champ lexical et le champ sémantique",
        "pre_evaluation": [
            "Qu'est-ce que la polysémie ?",
            "Donnez deux mots en rapport avec la 'justice'."
        ],
        "situation_probleme": {
            "texte": "Un élève pense que 'juge', 'tribunal' et 'loi' forment une famille de mots.",
            "consigne": "Corrigez son erreur en distinguant famille de mots et champ lexical."
        },
        "activites": [
            {
                "titre": "Activité 1 : Constitution du champ lexical",
                "consignes": ["Relevez les mots liés au thème de la mer."],
                "synthese_partielle": "Le champ lexical regroupe des mots variés autour d'un même thème."
            }
        ],
        "synthese_generale": [
            "Le champ lexical rassemble des vocables (noms, adjectifs, verbes) autour d'une notion.",
            "Le champ sémantique regroupe les sens d'un seul mot polysémique."
        ],
        "evaluation": {
            "consigne": "Trouvez 4 mots du champ lexical du 'voyage'.",
            "questions": []
        },
        "remediation": {
            "consigne": "Chassez l'intrus du champ lexical.",
            "questions": []
        },
        "enrichissement": {
            "consigne": "Rédigez un court poème axé sur le champ lexical de la nuit.",
            "questions": []
        }
    },
    {
        "id": "lex-02",
        "discipline": "Lexique",
        "niveau": "10e Année",
        "titre": "La formation des mots : Préfixation et Suffixation",
        "pre_evaluation": [
            "Qu'est-ce qu'un radical ?",
            "Trouvez le mot d'origine dans 'impossible'."
        ],
        "situation_probleme": {
            "texte": "Un élève confond le sens de 'imbuvable' et 'buvables'. Il ne comprend pas le rôle de 'im-' et de '-able'.",
            "consigne": "Décomposez ces mots en radical, préfixe et suffixe pour expliquer leur sens."
        },
        "activites": [
            {
                "titre": "Activité 1 : Analyse des préfixes et suffixes",
                "consignes": [
                    "Isolez le radical.",
                    "Indiquez le sens apporté par le préfixe (négation, répétition...) et le suffixe (possibilité, métier...)."
                ],
                "synthese_partielle": "Le préfixe se place avant le radical et en modifie le sens. Le suffixe se place après et peut changer la classe grammaticale."
            }
        ],
        "synthese_generale": [
            "Mots dérivés = Préfixe + Radical + Suffixe.",
            "Les préfixes expriment l'opposition (in-, im-), le retour (re-), etc.",
            "Les suffixes forment des adjectifs (-able), des noms (-tion) ou des verbes."
        ],
        "evaluation": {
            "consigne": "Formez un mot dérivé avec un préfixe privatif :",
            "questions": ["possible", "honnête", "lisible"]
        },
        "remediation": {
            "consigne": "Entourez le radical dans la liste de mots.",
            "questions": []
        },
        "enrichissement": {
            "consigne": "Créez 3 mots dérivés rares et donnez leur définition.",
            "questions": []
        }
    }
]

def reinitialiser_base():
    db = SessionLocal()
    db.query(FicheLeconModel).delete()
    for item in LECONS_INITIALES:
        db_item = FicheLeconModel(**item)
        db.add(db_item)
    db.commit()
    db.close()

# Forcer la réinitialisation au chargement pour insérer toutes les leçons
reinitialiser_base()

@app.get("/api/lecons", response_model=List[FicheLeconSchema])
def get_all_lecons(discipline: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FicheLeconModel)
    if discipline and discipline != "Toutes":
        query = query.filter(FicheLeconModel.discipline == discipline)
    return query.all()

@app.get("/api/lecons/{lecon_id}", response_model=FicheLeconSchema)
def get_lecon(lecon_id: str, db: Session = Depends(get_db)):
    lecon = db.query(FicheLeconModel).filter(FicheLeconModel.id == lecon_id).first()
    if not lecon:
        raise HTTPException(status_code=404, detail="Leçon non trouvée")
    return lecon

@app.post("/api/lecons", response_model=FicheLeconSchema)
def create_lecon(lecon: FicheLeconSchema, db: Session = Depends(get_db)):
    db_lecon = FicheLeconModel(**lecon.dict())
    db.add(db_lecon)
    db.commit()
    db.refresh(db_lecon)
    return db_lecon

@app.delete("/api/lecons/{lecon_id}")
def delete_lecon(lecon_id: str, db: Session = Depends(get_db)):
    lecon = db.query(FicheLeconModel).filter(FicheLeconModel.id == lecon_id).first()
    if not lecon:
        raise HTTPException(status_code=404, detail="Leçon non trouvée")
    db.delete(lecon)
    db.commit()
    return {"message": "Leçon supprimée avec succès"}