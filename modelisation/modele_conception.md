# Modèle de Conception — Gestion des Stages & Mémoires

---

## 1. Architecture Générale

L'application suit une architecture **3-tiers** avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────┐
│                 COUCHE PRÉSENTATION                  │
│  frontend-student (:5173)  frontend-staff (:5174)   │
│  frontend-admin (:5175)                             │
│  React 18 + Vite + React Router + TailwindCSS-like  │
└─────────────────────┬───────────────────────────────┘
                      │  HTTP / REST / JSON
                      │  multipart/form-data (upload)
┌─────────────────────▼───────────────────────────────┐
│                 COUCHE MÉTIER (API)                  │
│  Node.js + Express 5                                │
│  Middlewares : CORS, JWT, Multer, RBAC              │
│  Controllers : Auth, Admin, Ecole, Structure,       │
│                Profil, Encadrant, Assignation,      │
│                Stage, Message                       │
└─────────────────────┬───────────────────────────────┘
                      │  Sequelize ORM
┌─────────────────────▼───────────────────────────────┐
│              COUCHE DONNÉES                         │
│  MySQL 8 — Base : gestion_stages_memoires           │
│  Tables : users, ecoles, departements, filieres,    │
│           assignations, stages, memoires, messages  │
│  Fichiers : backend/uploads/memoires/               │
└─────────────────────────────────────────────────────┘
```

---

## 2. Patterns de Conception Utilisés

### 2.1 MVC (Model-View-Controller)

| Couche | Technologie | Rôle |
|---|---|---|
| **Model** | Sequelize + MySQL | Définition des entités et relations |
| **View** | React JSX | Rendu des interfaces utilisateur |
| **Controller** | Express Controllers | Logique métier et traitement des requêtes |

### 2.2 Middleware Chain (Express)

```
Requête HTTP
    ↓
CORS middleware
    ↓
express.json / urlencoded
    ↓
verifierToken (JWT)          ← auth.middleware.js
    ↓
autoriserRoles(role)         ← RBAC
    ↓
upload.single('fichier')     ← multer (upload)
    ↓
Controller.methode()
    ↓
Réponse JSON
```

### 2.3 Repository Pattern (via Sequelize)

Les modèles Sequelize encapsulent toutes les opérations BDD. Les controllers appellent des méthodes de haut niveau (`findAll`, `create`, `save`, `destroy`) sans écrire de SQL brut.

### 2.4 Context Pattern (React)

Chaque portail utilise un `AuthContext` qui centralise :
- L'état d'authentification (`user`, `loading`)
- Les fonctions d'action (`connexion`, `inscription`, `deconnexion`, `mettreAJourProfil`)
- La persistance locale (`localStorage`)

### 2.5 Protected Route Pattern

```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

Le composant `ProtectedRoute` vérifie l'état du contexte avant de rendre la page. Si l'utilisateur n'est pas authentifié ou n'a pas le bon rôle, il est redirigé vers `/connexion`.

---

## 3. Modèle de Données (MCD simplifié)

```
ECOLE ──< DEPARTEMENT ──< FILIERE

ECOLE ──< USER
DEPARTEMENT ──< USER
FILIERE ──< USER

USER (etudiant) ──< ASSIGNATION >── USER (encadrant)
USER (rp)       ──< ASSIGNATION

USER (etudiant) ──< STAGE
USER (etudiant) ──< MEMOIRE

USER ──< MESSAGE (expediteur)
USER ──< MESSAGE (destinataire)
```

---

## 4. Modèle Physique de Données

### Table `users`
```sql
id, nom, prenom, email (UNIQUE), mot_de_passe,
role ENUM(etudiant|encadrant|responsable_pedagogique|admin),
ecole_id FK→ecoles, departement_id FK→departements,
filiere_id FK→filieres, numero_etudiant (UNIQUE),
niveau, annee_universitaire, grade, specialite,
telephone, profil_complet, is_active,
reset_code, reset_code_expiry,
created_at, updated_at
```

### Table `ecoles`
```sql
id, nom (UNIQUE), sigle, ville, pays, description, is_active
```

### Table `departements`
```sql
id, ecole_id FK→ecoles, nom, code, is_active
```

### Table `filieres`
```sql
id, departement_id FK→departements, nom, code, niveaux JSON, is_active
```

### Table `assignations`
```sql
id, etudiant_id FK→users, encadrant_id FK→users, rp_id FK→users,
annee_universitaire, statut ENUM(active|terminee|annulee), note_rp
```

### Table `stages`
```sql
id, etudiant_id FK→users (UNIQUE),
a_stage, entreprise, secteur, sujet, lieu,
date_debut, date_fin, statut ENUM(en_cours|termine), encadrant_entreprise
```

### Table `memoires`
```sql
id, etudiant_id FK→users (UNIQUE),
titre, fichier_url (1000), type_depot ENUM(fichier|lien),
date_depot, statut ENUM(non_soumis|soumis|valide|rejete),
commentaire_encadrant, aptitude ENUM(en_attente|apte|non_apte),
motif_refus, date_decision
```

### Table `messages`
```sql
id, expediteur_id FK→users, destinataire_id FK→users,
contenu, lu (BOOLEAN)
```

---

## 5. Gestion de la Sécurité

| Mécanisme | Implémentation |
|---|---|
| **Authentification** | JWT signé (secret .env, expiration 7j) |
| **Hachage mdp** | bcrypt salt=12 (hook Sequelize beforeCreate/beforeUpdate) |
| **Autorisation RBAC** | Middleware `autoriserRoles(...roles)` sur chaque route sensible |
| **Séparation portails** | 3 frontends indépendants avec vérification du rôle au login |
| **Réinitialisation mdp** | Code 6 chiffres, TTL 15 min, invalidé après usage |
| **Upload fichiers** | Type MIME validé (PDF/Word), 20 Mo max, nom unique aléatoire |
| **CORS** | Origins explicites (5173, 5174, 5175 uniquement) |
| **SQL Injection** | Requêtes ORM Sequelize (paramétrisées automatiquement) |

---

## 6. Flux de Données — Dépôt de Mémoire

```
Étudiant           Frontend (React)        API (Express)         MySQL + FS
   │                     │                      │                    │
   │──formulaire──────►  │                      │                    │
   │                     │──FormData PATCH──►   │                    │
   │                     │                      │──JWT verify──►     │
   │                     │                      │──multer.save()──►  FS
   │                     │                      │──Memoire.save()──► │
   │                     │                      │◄──{ success }──    │
   │                     │◄──toast ✓────────    │                    │
```

---

## 7. Structure des Dossiers

```
backend/
├── config/          database.js (Sequelize config)
├── controllers/     auth, admin, ecole, encadrant, profil,
│                    structure, assignation, stage, message
├── middlewares/     auth.middleware.js, upload.middleware.js
├── models/          User, Ecole, Departement, Filiere,
│                    Assignation, Stage, Memoire, Message, index.js
├── routes/          (un fichier par domaine)
├── uploads/memoires/ (fichiers PDF/Word uploadés)
└── validators/      auth.validator.js

frontend-{student,staff,admin}/src/
├── api/             axios.js (instance configurée + interceptors)
├── context/         AuthContext.jsx (état global d'authentification)
├── components/      ProtectedRoute.jsx, Sidebar.jsx (admin)
└── pages/           Connexion, Inscription, Dashboard,
                     MotDePasseOublie, [pages admin]
```

---

## 8. Diagramme de Composants (textuel)

```
┌─────────────────────────────────────────────────────────────────┐
│                      frontend-student (:5173)                   │
│  App.jsx → [Connexion | Inscription | MotDePasseOublie |        │
│              ProtectedRoute > Dashboard]                        │
│  Dashboard: [Accueil | Profil | Stage | Mémoire | Messages]     │
│  Context: AuthContext (token='token', key='user')               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST
┌────────────────────────────▼────────────────────────────────────┐
│                      backend (:5000)                            │
│  /api/auth/*  /api/profil  /api/stage  /api/messages            │
│  /api/ecoles  /api/structure  /api/encadrant  /api/assignations │
│  /api/admin   /uploads (static)                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ Sequelize ORM
┌────────────────────────────▼────────────────────────────────────┐
│                      MySQL (:3306)                              │
│  gestion_stages_memoires                                        │
│  users | ecoles | departements | filieres                       │
│  assignations | stages | memoires | messages                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      frontend-staff (:5174)                     │
│  Tabs Encadrant: [Accueil|Profil|Mes étudiants|Mémoires|        │
│                   Trouver étudiants]                            │
│  Tabs RP: [Accueil|Profil|Assignations]                         │
│  Context: AuthContext (token='staff_token')                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      frontend-admin (:5175)                     │
│  Sidebar: [Dashboard|Étudiants|Encadrants|RP|Tous|              │
│            Établissements|Depts & Filières]                     │
│  Context: AuthContext (token='admin_token')                     │
└─────────────────────────────────────────────────────────────────┘
```
