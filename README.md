# Projet L3 — Gestion des Stages & Mémoires

Application de gestion des stages et mémoires universitaires avec 3 portails distincts.

---

## Structure du projet

```
projetL3/
├── backend/              API REST Node.js + Express + Sequelize (MySQL)
├── frontend-student/     Portail Étudiant           → http://localhost:5173
├── frontend-staff/       Portail Personnel           → http://localhost:5174
└── frontend-admin/       Portail Administrateur      → http://localhost:5175
```

---

## Démarrage rapide

### 1. Base de données
```bash
mysql -u root -p < database.sql
```
Crée la base `gestion_stages_memoires` avec toutes les tables + données initiales (14 écoles + structure ESP + compte admin).

### 2. Backend
```bash
cd backend
# Configurer .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
npm install
npm run dev   # → http://localhost:5000
```

### 3. Frontends (3 terminaux séparés)
```bash
cd frontend-student && npm run dev   # → http://localhost:5173
cd frontend-staff   && npm run dev   # → http://localhost:5174
cd frontend-admin   && npm run dev   # → http://localhost:5175
```

---

## Compte admin par défaut
- **Email** : `admin@universite.fr`
- **Mot de passe** : `Admin1234!`

---

## Portails

| Portail | URL | Rôles |
|---|---|---|
| Étudiant | :5173 | `etudiant` |
| Personnel | :5174 | `encadrant`, `responsable_pedagogique` |
| Admin | :5175 | `admin` |

---

## Fonctionnalités par rôle

### 🎓 Étudiant
- Inscription avec choix d'établissement
- Complétion du profil : département, filière (liste créée par l'admin), niveau, année universitaire
- Déclaration de stage (entreprise, sujet, dates…)
- Dépôt de mémoire par lien (Google Drive, OneDrive…) ou URL
- Modification / suppression du mémoire (bloqué si décision rendue)
- Consultation de l'aptitude à soutenir + commentaire de l'encadrant
- Messagerie directe avec l'encadrant assigné
- Suivi de progression (timeline)

### 👨‍🏫 Encadrant
- Complétion du profil : département, grade, spécialité
- Consultation de la liste de tous les étudiants avec leur titre de mémoire
- Auto-assignation à un étudiant (et se désassigner)
- Consultation du document/lien du mémoire
- Décision d'aptitude (apte / non apte) avec commentaire
- Messagerie directe avec chaque étudiant supervisé

### 📋 Responsable Pédagogique
- Vue globale : stats étudiants avec/sans encadrant
- Gestion des assignations : assigner un encadrant à un étudiant, supprimer une assignation
- Complétion du profil département

### 🛡️ Admin
- CRUD établissements avec barre de recherche
- Gestion de la structure académique : départements et filières par école (avec niveaux)
- Gestion des comptes : activer/désactiver/supprimer par rôle
- Statistiques globales

---

## Routes API

```
POST   /api/auth/inscription/etudiant
POST   /api/auth/inscription/personnel
POST   /api/auth/connexion
GET    /api/auth/profil                         (JWT)

GET    /api/profil/moi                          (JWT)
PATCH  /api/profil/moi                          (JWT)

GET    /api/ecoles                              (public)
GET    /api/ecoles/admin/liste                  (admin)
POST   /api/ecoles                              (admin)
PATCH  /api/ecoles/:id                          (admin)
DELETE /api/ecoles/:id                          (admin)

GET    /api/structure/departements              (public)
GET    /api/structure/filieres                  (public)
GET    /api/structure/ecoles-structure          (admin)
POST   /api/structure/departements              (admin)
PATCH  /api/structure/departements/:id          (admin)
DELETE /api/structure/departements/:id          (admin)
POST   /api/structure/filieres                  (admin)
PATCH  /api/structure/filieres/:id              (admin)
DELETE /api/structure/filieres/:id              (admin)

GET    /api/stage/mon-stage                     (etudiant)
POST   /api/stage/declarer                      (etudiant)
GET    /api/stage/mon-memoire                   (etudiant)
PATCH  /api/stage/mon-memoire                   (etudiant)
DELETE /api/stage/mon-memoire                   (etudiant)

GET    /api/encadrant/stats                     (encadrant)
GET    /api/encadrant/mes-etudiants             (encadrant)
GET    /api/encadrant/tous-etudiants            (encadrant)
POST   /api/encadrant/s-assigner/:id            (encadrant)
DELETE /api/encadrant/s-desassigner/:id         (encadrant)
PATCH  /api/encadrant/memoires/:id/aptitude     (encadrant)

GET    /api/assignations                        (responsable_pedagogique)
GET    /api/assignations/stats                  (responsable_pedagogique)
GET    /api/assignations/etudiants-sans-encadrant
GET    /api/assignations/encadrants-disponibles
POST   /api/assignations                        (responsable_pedagogique)
PATCH  /api/assignations/:id                    (responsable_pedagogique)
DELETE /api/assignations/:id                    (responsable_pedagogique)

GET    /api/messages/non-lus                    (JWT)
GET    /api/messages/:interlocuteur_id          (JWT)
POST   /api/messages/:destinataire_id           (JWT)

GET    /api/admin/stats                         (admin)
GET    /api/admin/utilisateurs                  (admin)
PATCH  /api/admin/utilisateurs/:id/statut       (admin)
DELETE /api/admin/utilisateurs/:id              (admin)
```
