import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Configuration de la base de données SQLite
DATABASE_URL = "sqlite:///./apc_database.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ------------------------------------------------------------------------------
# Modèle de données SQLAlchemy (Table "lecons")
# ------------------------------------------------------------------------------
class LeconDB(Base):
    __tablename__ = "lecons"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, index=True)
    discipline = Column(String)
    niveau = Column(String)
    competence = Column(Text, nullable=True)
    situation_probleme = Column(Text, nullable=True)

# Création automatique des tables
Base.metadata.create_all(bind=engine)

# ------------------------------------------------------------------------------
# Schémas Pydantic (Validation des données API)
# ------------------------------------------------------------------------------
class LeconCreate(BaseModel):
    titre: str
    discipline: str
    niveau: str
    competence: Optional[str] = None
    situation_probleme: Optional[str] = None

class LeconResponse(BaseModel):
    id: int
    titre: str
    discipline: str
    niveau: str
    competence: Optional[str] = None
    situation_probleme: Optional[str] = None

    class Config:
        from_attributes = True

# ------------------------------------------------------------------------------
# Initialisation de FastAPI
# ------------------------------------------------------------------------------
app = FastAPI(
    title="Plateforme Pédagogique APC Mali API",
    version="1.0.0"
)

# Configuration CORS pour autoriser le Frontend (React / Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gestion de la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------------------------------------------------------
# Script de peuplement initial au démarrage
# ------------------------------------------------------------------------------
def startup_db_populate():
    db = SessionLocal()
    try:
        count = db.query(LeconDB).count()
        if count == 0:
            lecon_initiale = LeconDB(
                titre="Les propositions subordonnées relatives",
                discipline="Grammaire",
                niveau="10e Année",
                competence="Communiquer de manière claire et structurée en appliquant les règles de grammaire.",
                situation_probleme=json.dumps({
                    "prerequis": "Rappel des notions fondamentales sur la proposition indépendante et le nom/pronom.",
                    "texte": "L'élève qui travaille régulièrement réussit ses examens. La maison que nous voyons est récente.",
                    "consigne": "Relevez les propositions subordonnées et identifiez les pronoms relatifs qui les introduisent.",
                    "analyse": "Observation des pronoms 'qui' et 'que'. Mise en évidence du rôle du pronom relatif reliant la subordonnée à son antécédent.",
                    "resume": "La proposition subordonnée relative complète un nom ou un pronom appelé antécédent. Elle est introduite par un pronom relatif (qui, que, quoi, dont, où...).",
                    "exercices": "1. Soulignez la proposition subordonnée relative dans les phrases proposées.\n2. Rédigez deux phrases contenant chacune une proposition subordonnée relative."
                })
            )
            db.add(lecon_initiale)
            db.commit()
    except Exception as e:
        print(f"Erreur lors du peuplement initial de la base : {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    startup_db_populate()

# ------------------------------------------------------------------------------
# Endpoints de l'API REST
# ------------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API de la Plateforme Pédagogique APC Mali"}

@app.get("/api/lecons", response_model=List[LeconResponse])
def get_lecons(db: Session = Depends(get_db)):
    lecons = db.query(LeconDB).all()
    return lecons

@app.get("/api/lecons/{lecon_id}", response_model=LeconResponse)
def get_lecon(lecon_id: int, db: Session = Depends(get_db)):
    lecon = db.query(LeconDB).filter(LeconDB.id == lecon_id).first()
    if not lecon:
        raise HTTPException(status_code=404, detail="Leçon non trouvée")
    return lecon

@app.post("/api/lecons", response_model=LeconResponse)
def create_lecon(lecon: LeconCreate, db: Session = Depends(get_db)):
    db_lecon = LeconDB(
        titre=lecon.titre,
        discipline=lecon.discipline,
        niveau=lecon.niveau,
        competence=lecon.competence,
        situation_probleme=lecon.situation_probleme
    )
    db.add(db_lecon)
    db.commit()
    db.refresh(db_lecon)
    return db_lecon

@app.delete("/api/lecons/{lecon_id}")
def delete_lecon(lecon_id: int, db: Session = Depends(get_db)):
    lecon = db.query(LeconDB).filter(LeconDB.id == lecon_id).first()
    if not lecon:
        raise HTTPException(status_code=404, detail="Leçon non trouvée")
    db.delete(lecon)
    db.commit()
    return {"message": "Leçon supprimée avec succès"}