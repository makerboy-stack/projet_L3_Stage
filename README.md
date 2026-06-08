# Gestion des Stages & Mémoires Universitaires

## Structure du projet

```
projetL3/
├── backend/           → API Node.js + Express + MySQL
├── frontend-student/  → Portail Étudiant  (port 5173)
└── frontend-staff/    → Portail Personnel (port 5174)
```

## Prérequis

- Node.js >= 18
- MySQL installé et démarré

## 1. Configurer la base de données

Créer la base de données dans MySQL :
```sql
CREATE DATABASE gestion_stages_memoires CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Configurer le backend

Éditer `backend/.env` :
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=   ← votre mot de passe MySQL
DB_NAME=gestion_stages_memoires
JWT_SECRET=changer_ce_secret
```

## 3. Lancer le backend

```bash
cd backend
npm run dev
# → http://localhost:5000
```

## 4. Lancer le portail étudiant

```bash
cd frontend-student
npm run dev
# → http://localhost:5173
```

## 5. Lancer le portail personnel

```bash
cd frontend-staff
npm run dev
# → http://localhost:5174
```

## Routes API disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/inscription/etudiant | Inscription étudiant |
| POST | /api/auth/inscription/personnel | Inscription encadrant / RP |
| POST | /api/auth/connexion | Connexion (tous rôles) |
| GET  | /api/auth/profil | Profil connecté (JWT requis) |
| POST | /api/auth/deconnexion | Déconnexion |
| GET  | /api/health | Test de l'API |
