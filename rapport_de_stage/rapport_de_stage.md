# UNIVERSITÉ CHEIKH ANTA DIOP DE DAKAR
## ÉCOLE SUPÉRIEURE POLYTECHNIQUE
### DÉPARTEMENT GÉNIE INFORMATIQUE

---

**RAPPORT DE STAGE DE FIN DE CYCLE**

Pour l'obtention de la :
**LICENCE EN GÉNIE INFORMATIQUE — OPTION : GÉNIE LOGICIEL**

---

**SUJET :**

*Conception et développement d'une plateforme web multi-établissements  
de gestion des stages et mémoires universitaires*

---

**PÉRIODE ET LIEU DU STAGE :** Janvier – Juin 2024 — SenDigitale Pulse, Dakar

**Présenté et soutenu par :** [Prénom NOM DU CANDIDAT]

**PROMOTION :** Licence 3 — 2023/2024

| Rôle | Nom & Prénom | Grade / Titre |
|---|---|---|
| DIRECTEUR | [Nom Directeur] | Professeur, ESP/UCAD |
| ENCADRANT | [Nom Encadrant] | Maître de Conférences, ESP/UCAD |
| MAÎTRE DE STAGE | [Nom Maître de Stage] | Ingénieur Senior, SenDigitale Pulse |

**Année universitaire : 2023 – 2024**

---

## RÉSUMÉ

La gestion des stages et mémoires dans les établissements d'enseignement supérieur constitue un processus complexe impliquant de nombreux acteurs : étudiants, encadrants, responsables pédagogiques et administrations. Dans la plupart des universités et écoles supérieures, ce processus repose encore sur des procédures manuelles et des outils fragmentés, entraînant des inefficacités, des pertes d'information et un suivi difficile.

Dans le cadre de notre stage effectué à **SenDigitale Pulse**, nous avons conçu et développé une **plateforme web multi-établissements de gestion des stages et mémoires universitaires**. Cette solution générique est conçue pour répondre aux besoins de toute institution académique confrontée à cette problématique, quelle que soit sa taille ou son organisation.

La plateforme propose quatre espaces distincts et sécurisés : un portail étudiant, un portail encadrant, un portail responsable pédagogique et un portail administrateur. Elle couvre l'ensemble du cycle de vie académique : de l'inscription et la complétion du profil, à la déclaration de stage, au dépôt de mémoire, à la messagerie interne et au suivi de progression.

Sur le plan technique, la solution repose sur une architecture three-tiers : **Node.js / Express** pour le backend, **React.js / Vite** pour les interfaces utilisateurs, et **MySQL / Sequelize** pour la persistance des données.

**Mots-clés :** plateforme web, gestion académique multi-établissements, stages, mémoires, React.js, Node.js, MySQL, encadrement, API REST.

---

**ABSTRACT**

The management of internships and dissertations in higher education institutions is a complex process involving many stakeholders. In most universities and colleges, this process still relies on manual procedures and fragmented tools. Within our internship at SenDigitale Pulse, we designed and developed a **multi-institution web platform for managing academic internships and dissertations**, covering the entire academic supervision lifecycle.

**Keywords:** web platform, multi-institution academic management, internships, dissertations, React.js, Node.js, MySQL, REST API.

---

## TABLE DES MATIÈRES

- Introduction Générale
- Chapitre 1 : Présentations Générales
- Chapitre 2 : Spécifications Fonctionnelles et Analyse des Besoins
- Chapitre 3 : Mise en Œuvre et Conception
- Conclusion Générale
- Références Bibliographiques
- Annexes

---

## INTRODUCTION GÉNÉRALE

La transformation numérique des institutions académiques est devenue une nécessité incontournable dans un monde où la digitalisation s'impose dans tous les secteurs d'activité. Les universités et écoles supérieures, notamment celles des pays en développement, font face à des défis majeurs dans la gestion de leurs processus pédagogiques et administratifs.

Parmi ces défis, la gestion des stages et des mémoires de fin d'études occupe une place centrale. Ce processus, qui engage simultanément des étudiants, des encadrants académiques, des responsables pédagogiques et des administrations, est souvent caractérisé par une multiplicité d'outils disparates, une communication difficile entre les acteurs, et un suivi lacunaire de l'avancement des travaux. Des établissements tels que l'École Supérieure Polytechnique (ESP) de Dakar, l'Institut Supérieur de Management (ISM), ou encore l'École Polytechnique de Thiès (EPT) partagent cette réalité commune.

C'est dans ce contexte que s'inscrit notre stage réalisé au sein de **SenDigitale Pulse**, entreprise spécialisée dans le développement de solutions numériques innovantes pour les organisations africaines. Notre mission a consisté à concevoir et à développer une **plateforme web générique, multi-établissements, de gestion des stages et mémoires universitaires** — une solution centralisée, évolutive et adaptable à tout type d'institution académique.

La problématique centrale à laquelle répond ce projet est la suivante :

> **Comment concevoir une solution numérique centralisée permettant à toute institution académique de gérer efficacement l'ensemble du cycle de vie des stages et mémoires de ses étudiants, tout en favorisant la collaboration entre les différents acteurs impliqués ?**

Pour répondre à cette question, nous avons adopté une démarche méthodologique structurée. Le présent rapport en rend compte selon l'organisation suivante :

- Le **Chapitre 1** présente la structure d'accueil, le contexte général du projet, la problématique détaillée et les objectifs visés.
- Le **Chapitre 2** expose les spécifications fonctionnelles et l'analyse des besoins, en identifiant les acteurs, leurs rôles et leurs attentes.
- Le **Chapitre 3** décrit la mise en œuvre technique : choix des outils, architecture de la solution, conception de la base de données et résultats obtenus.

---

---

# CHAPITRE 1 : PRÉSENTATIONS GÉNÉRALES

## I. Introduction

Ce premier chapitre présente le cadre général dans lequel s'inscrit notre travail. Il expose la structure d'accueil du stage, le contexte problématique qui a motivé le projet, ainsi que les objectifs poursuivis et la démarche méthodologique adoptée.

---

## II. Présentation de la Structure d'Accueil

### II.1. SenDigitale Pulse

**SenDigitale Pulse** est une entreprise technologique sénégalaise fondée à Dakar, spécialisée dans le développement de solutions numériques à destination des organisations publiques et privées africaines. Elle intervient principalement dans les domaines suivants :

- Développement d'applications web et mobiles sur mesure
- Conseil en transformation numérique
- Intégration de systèmes d'information
- Formation aux technologies du numérique

L'entreprise s'inscrit dans la dynamique de l'écosystème numérique sénégalais en plein essor, contribuant à la digitalisation des processus dans des secteurs variés : éducation, santé, administration publique et secteur privé.

### II.2. Contexte du Stage

Dans le cadre de sa mission d'accompagnement de la transformation numérique du secteur éducatif, SenDigitale Pulse a identifié un besoin récurrent chez plusieurs de ses clients institutionnels : la gestion manuelle et inefficiente des stages et mémoires universitaires. Notre stage s'inscrit dans un projet de développement d'une solution générique répondant à ce besoin.

---

## III. Contexte et Problématique

### III.1. Contexte Général

Dans l'enseignement supérieur sénégalais et africain en général, les processus de gestion des stages et mémoires sont souvent caractérisés par :

- Des **procédures entièrement manuelles** : dépôt physique de documents, listes d'émargement, formulaires papier
- Une **communication fragmentée** entre étudiants, encadrants et administrations (emails, appels téléphoniques)
- Un **suivi difficile** de l'avancement des mémoires et des stages
- Des **délais non respectés** faute de mécanismes d'alerte
- Une **absence de traçabilité** des échanges et des décisions prises
- Une **surcharge administrative** pour les responsables pédagogiques
- Des **pertes de documents** et des doublons dans les assignations

Ces problèmes concernent indistinctement des établissements tels que l'ESP/UCAD, l'ISM, l'EPT, l'ENSUT, et bien d'autres institutions académiques à travers le continent.

### III.2. Problématique

La problématique centrale peut se formuler ainsi :

> *Comment concevoir et développer une plateforme numérique centralisée, sécurisée et multi-établissements, permettant de digitaliser et d'optimiser l'ensemble du processus de gestion des stages et mémoires universitaires, en facilitant la collaboration entre tous les acteurs impliqués ?*

### III.3. Objectifs du Projet

**Objectif général :**
Développer une plateforme web multi-établissements de gestion des stages et mémoires, adaptable à toute institution académique.

**Objectifs spécifiques :**

1. Permettre aux étudiants de déclarer leur stage, déposer leur mémoire et suivre leur progression
2. Permettre aux encadrants de gérer leurs étudiants et de rendre leur décision d'aptitude
3. Permettre aux responsables pédagogiques de gérer les assignations encadrant-étudiant
4. Permettre aux administrateurs de configurer la structure académique (établissements, départements, filières)
5. Assurer une communication directe entre encadrant et étudiant via la messagerie intégrée
6. Garantir la sécurité et la confidentialité des données via une authentification par rôles

---

## IV. Démarche Méthodologique

Pour mener à bien ce projet, nous avons adopté une démarche itérative et incrémentale inspirée des méthodes agiles :

1. **Phase d'analyse** : recueil des besoins auprès des utilisateurs potentiels, étude de l'existant
2. **Phase de conception** : modélisation UML (cas d'utilisation, classes, séquences), conception de la base de données
3. **Phase de développement** : implémentation itérative par fonctionnalités
4. **Phase de test** : tests unitaires et fonctionnels à chaque itération
5. **Phase de déploiement** : mise en service et documentation

---

## V. Conclusion

Ce chapitre a présenté le contexte dans lequel s'inscrit notre projet. Il a mis en lumière les insuffisances des processus actuels de gestion des stages et mémoires dans les établissements d'enseignement supérieur, justifiant ainsi la nécessité d'une solution numérique adaptée. Le chapitre suivant présente l'analyse détaillée des besoins et les spécifications fonctionnelles de la plateforme.

---

---

# CHAPITRE 2 : SPÉCIFICATIONS FONCTIONNELLES ET ANALYSE DES BESOINS

## I. Introduction

Ce chapitre présente l'analyse des besoins de la plateforme. Après identification des acteurs du système et de leurs rôles respectifs, nous exposons les besoins fonctionnels et non fonctionnels, ainsi que la modélisation des cas d'utilisation.

---

## II. Identification des Acteurs

La plateforme implique quatre catégories d'acteurs principaux :

| Acteur | Description |
|---|---|
| **Étudiant** | Inscrit dans un établissement, il déclare son stage, soumet son mémoire et suit sa progression |
| **Encadrant** | Enseignant qui supervise un ou plusieurs étudiants, évalue leurs mémoires et déclare leur aptitude |
| **Responsable Pédagogique (RP)** | Coordonne les assignations encadrant-étudiant et surveille l'état global des encadrements |
| **Administrateur** | Configure la structure académique (établissements, départements, filières) et gère les comptes |

---

## III. Besoins Fonctionnels

### III.1. Besoins communs à tous les acteurs

- **S'inscrire** sur le portail approprié en renseignant ses informations personnelles et son établissement
- **Se connecter** avec son email et mot de passe
- **Réinitialiser son mot de passe** via un code de vérification
- **Compléter son profil** avec les informations académiques (département, filière, niveau, grade, spécialité)
- **Basculer entre mode clair et mode sombre**

### III.2. Besoins spécifiques à l'Étudiant

- Déclarer sa situation de stage (avec ou sans stage) en renseignant l'entreprise, le sujet, les dates
- Soumettre son mémoire avec un titre, une description et un document (fichier PDF/Word ou lien externe)
- Modifier ou supprimer son mémoire tant qu'aucune décision d'aptitude n'a été rendue
- Consulter la décision d'aptitude et le commentaire de son encadrant
- Envoyer des messages à son encadrant et partager des documents dans le chat
- Suivre sa progression académique via une timeline (inscription → profil → stage → encadrant → mémoire → aptitude)

### III.3. Besoins spécifiques à l'Encadrant

- Consulter la liste des étudiants et leur titre/description de mémoire
- S'assigner comme encadrant d'un étudiant ou se désassigner
- Consulter et télécharger le document de mémoire d'un étudiant
- Déclarer l'aptitude à soutenir (apte/non apte) avec motif et commentaire
- Envoyer des messages et partager des documents avec ses étudiants
- Compléter son profil (département, grade, spécialité)

### III.4. Besoins spécifiques au Responsable Pédagogique

- Consulter les statistiques globales (étudiants avec/sans encadrant)
- Assigner manuellement un encadrant à un étudiant
- Modifier ou supprimer une assignation
- Voir la liste des étudiants sans encadrant
- Consulter la liste des encadrants disponibles et leur charge

### III.5. Besoins spécifiques à l'Administrateur

- Créer, modifier, activer/masquer et supprimer des établissements
- Gérer la structure académique : départements par établissement, filières par département avec niveaux
- Gérer les comptes utilisateurs : lister, filtrer, activer/désactiver, supprimer
- Consulter les statistiques globales de la plateforme
- Rechercher un établissement ou un utilisateur

---

## IV. Besoins Non Fonctionnels

| Catégorie | Exigence |
|---|---|
| **Sécurité** | Authentification JWT, hachage bcrypt (salt=12), contrôle d'accès RBAC par rôle |
| **Performance** | Temps de réponse API < 500ms pour les opérations courantes |
| **Disponibilité** | Plateforme accessible 24h/24, 7j/7 |
| **Ergonomie** | Interface responsive (mobile et desktop), mode sombre/clair |
| **Scalabilité** | Architecture multi-établissements, configuration dynamique |
| **Maintenabilité** | Code modulaire, séparation backend/frontend, documentation |
| **Compatibilité** | Navigateurs modernes : Chrome, Firefox, Edge, Safari |

---

## V. Modélisation des Cas d'Utilisation

### V.1. Diagramme global

La plateforme couvre quatre grands domaines fonctionnels :

```
┌─────────────────────────────────────────────────────┐
│              SYSTÈME DE GESTION                      │
│                                                      │
│  [Étudiant] ──── Gérer son parcours académique      │
│  [Encadrant] ─── Superviser et évaluer              │
│  [RP] ─────────── Coordonner les assignations       │
│  [Admin] ──────── Configurer la plateforme          │
└─────────────────────────────────────────────────────┘
```

Les diagrammes de cas d'utilisation détaillés par acteur sont disponibles dans le dossier `modelisation/` du projet :
- `uc_etudiant.drawio`
- `uc_encadrant.drawio`
- `uc_responsable_pedagogique.drawio`
- `uc_administrateur.drawio`

### V.2. Cas d'utilisation prioritaires

Les cas d'utilisation les plus critiques identifiés sont :

1. **S'inscrire** — point d'entrée de tous les utilisateurs
2. **Soumettre un mémoire** — fonctionnalité centrale pour l'étudiant
3. **Déclarer l'aptitude** — décision clé de l'encadrant
4. **Assigner un encadrant** — coordination du RP
5. **Gérer la structure académique** — configuration par l'admin

---

## VI. Modèle Conceptuel de Données

Les principales entités identifiées sont :

| Entité | Description |
|---|---|
| **User** | Représente tout utilisateur (étudiant, encadrant, RP, admin) |
| **Ecole** | Établissement académique (ESP, ISM, EPT, etc.) |
| **Departement** | Département rattaché à une école |
| **Filiere** | Filière rattachée à un département avec ses niveaux |
| **Assignation** | Lien encadrant-étudiant créé par le RP ou l'encadrant |
| **Stage** | Informations de stage déclarées par l'étudiant |
| **Memoire** | Document/lien déposé par l'étudiant avec titre et description |
| **Message** | Échange entre étudiant et encadrant (texte ou fichier) |

**Relations principales :**
- Un utilisateur appartient à une école, un département, une filière
- Un étudiant a une assignation (vers un encadrant), un stage, un mémoire
- Un encadrant peut avoir plusieurs assignations actives
- Les messages relient un expéditeur à un destinataire

---

## VII. Conclusion

L'analyse des besoins a permis de dresser un portrait précis des fonctionnalités attendues par chaque acteur de la plateforme. La modélisation des cas d'utilisation et du modèle de données constitue le socle sur lequel repose la conception technique présentée dans le chapitre suivant.

---

---

# CHAPITRE 3 : MISE EN ŒUVRE ET CONCEPTION

## I. Introduction

Ce chapitre décrit les choix technologiques effectués, l'architecture de la solution développée, la conception de la base de données, ainsi que les principaux résultats obtenus. Il constitue le cœur technique du rapport et reflète l'ensemble du travail réalisé durant le stage.

---

## II. Choix des Outils et Technologies

Le choix des technologies a été guidé par plusieurs critères : maturité des outils, popularité dans l'écosystème actuel, performance, facilité de maintenance et adéquation avec les besoins du projet.

### II.1. Architecture Générale

La plateforme repose sur une architecture **three-tiers** (trois couches) :

```
┌──────────────────────────────────────────────────────────┐
│                 COUCHE PRÉSENTATION                       │
│  React 19 + Vite  ·  3 portails distincts               │
│  (Étudiant :5173  Personnel :5174  Admin :5175)          │
└─────────────────────┬────────────────────────────────────┘
                      │  HTTP / REST / JSON
                      │  multipart/form-data (upload)
┌─────────────────────▼────────────────────────────────────┐
│                 COUCHE MÉTIER — API REST                  │
│  Node.js 24 + Express 5                                  │
│  Middlewares : CORS · JWT · Multer · RBAC                │
└─────────────────────┬────────────────────────────────────┘
                      │  Sequelize ORM
┌─────────────────────▼────────────────────────────────────┐
│                 COUCHE DONNÉES                            │
│  MySQL 8 / MariaDB 10.4                                  │
│  8 tables · Fichiers uploadés (uploads/)                 │
└──────────────────────────────────────────────────────────┘
```

### II.2. Technologies Frontend

**React.js (v19)**
React est une bibliothèque JavaScript développée par Meta, dédiée à la construction d'interfaces utilisateur à base de composants réutilisables. Nous avons opté pour React en raison de sa popularité, de son écosystème riche et de sa capacité à gérer des interfaces complexes avec un rendu performant grâce au DOM virtuel.

**Vite (v8)**
Vite est un outil de build nouvelle génération qui offre un démarrage de serveur quasi-instantané et un rechargement à chaud (HMR) ultra-rapide. Il remplace avantageusement des outils plus anciens comme Webpack, réduisant significativement les temps de développement.

**React Router DOM (v7)**
Bibliothèque de routage côté client permettant la navigation entre les pages sans rechargement complet. Utilisée pour gérer les routes des trois portails (connexion, inscription, dashboard, mot de passe oublié).

**React Hook Form + Zod**
Combinaison utilisée pour la gestion et la validation des formulaires. React Hook Form offre des performances optimales en minimisant les re-rendus. Zod assure la validation des schémas de données côté client avec un typage fort.

**Axios**
Client HTTP utilisé pour effectuer les appels vers l'API REST. Des intercepteurs sont configurés pour injecter automatiquement le token JWT et gérer les erreurs d'authentification (redirection sur 401).

**Lucide React**
Bibliothèque d'icônes SVG légères et personnalisables, utilisée pour enrichir visuellement les interfaces.

**React Hot Toast**
Bibliothèque de notifications toast légère, utilisée pour afficher les messages de succès, d'erreur et d'information en temps réel.

**CSS Custom Properties (Variables CSS)**
L'ensemble du design est réalisé en CSS pur avec des variables CSS (`:root`), sans dépendance à un framework CSS externe. Cela garantit des performances optimales et une totale maîtrise du rendu visuel, avec support du mode sombre via `[data-theme="dark"]`.

| Technologie | Version | Usage |
|---|---|---|
| React.js | 19.2 | Construction des interfaces utilisateur |
| Vite | 8.0 | Bundler et serveur de développement |
| React Router DOM | 7.16 | Routage côté client |
| React Hook Form | 7.77 | Gestion des formulaires |
| Zod | 4.4 | Validation des données frontend |
| Axios | 1.17 | Client HTTP / appels API |
| Lucide React | 1.17 | Icônes SVG |
| React Hot Toast | 2.6 | Notifications utilisateur |
| CSS Variables | — | Design system / mode sombre |

### II.3. Technologies Backend

**Node.js (v24)**
Environnement d'exécution JavaScript côté serveur basé sur le moteur V8 de Chrome. Son modèle d'I/O non bloquant le rend particulièrement adapté aux applications web avec de nombreuses connexions simultanées. Node.js permet d'utiliser le même langage (JavaScript) côté client et serveur, favorisant la cohérence du code.

**Express.js (v5)**
Framework web minimaliste et flexible pour Node.js. Il fournit un système de routage puissant et une architecture middleware permettant de chaîner les traitements de façon modulaire (authentification, validation, upload, gestion d'erreurs).

**Sequelize (v6)**
ORM (Object-Relational Mapping) pour Node.js supportant MySQL, PostgreSQL et d'autres bases de données relationnelles. Il permet de manipuler la base de données en JavaScript, en définissant des modèles et des associations sans écrire de SQL brut. Les requêtes sont automatiquement paramétrisées, prévenant les injections SQL.

**JSON Web Token — JWT (jsonwebtoken v9)**
Standard ouvert (RFC 7519) permettant l'échange sécurisé d'informations entre parties sous forme de tokens signés. Utilisé pour l'authentification stateless : à chaque requête, le client envoie son token dans l'en-tête `Authorization: Bearer <token>`. Le token est vérifié par le middleware `verifierToken` avant chaque route protégée.

**bcryptjs (v3)**
Bibliothèque de hachage de mots de passe utilisant l'algorithme Bcrypt avec un facteur de coût (salt) de 12. Les mots de passe ne sont jamais stockés en clair. Le hachage est appliqué automatiquement via les hooks Sequelize `beforeCreate` et `beforeUpdate`.

**Multer (v2)**
Middleware Node.js pour la gestion des uploads de fichiers (multipart/form-data). Utilisé pour le dépôt des mémoires (PDF/Word, max 20 Mo) et des pièces jointes dans la messagerie. Les fichiers sont stockés localement avec un nom unique horodaté.

**Express-validator (v7)**
Bibliothèque de validation des données côté serveur, utilisée pour valider les entrées des formulaires d'inscription et de connexion avant leur traitement par les contrôleurs.

**CORS (v2)**
Middleware permettant de contrôler les origines autorisées à accéder à l'API. Configuré pour n'accepter que les requêtes provenant des trois portails frontend (ports 5173, 5174, 5175).

**Nodemon (v3)**
Outil de développement qui relance automatiquement le serveur Node.js à chaque modification de fichier, améliorant significativement la productivité en phase de développement.

**dotenv (v17)**
Bibliothèque permettant de charger les variables d'environnement depuis un fichier `.env`. Utilisée pour sécuriser les informations sensibles (credentials base de données, secret JWT, configuration email).

| Technologie | Version | Usage |
|---|---|---|
| Node.js | 24.x | Environnement d'exécution serveur |
| Express.js | 5.2 | Framework HTTP / API REST |
| Sequelize | 6.37 | ORM base de données |
| jsonwebtoken | 9.0 | Authentification JWT |
| bcryptjs | 3.0 | Hachage des mots de passe |
| Multer | 2.1 | Upload de fichiers |
| express-validator | 7.3 | Validation des données serveur |
| cors | 2.8 | Gestion des origines autorisées |
| mysql2 | 3.22 | Driver MySQL pour Node.js |
| dotenv | 17.4 | Variables d'environnement |
| nodemon | 3.1 | Rechargement automatique (dev) |

### II.4. Base de Données

**MySQL 8 / MariaDB 10.4**
Système de gestion de base de données relationnelle open source. MySQL/MariaDB offre fiabilité, performances élevées et un bon support des transactions ACID. Il est compatible avec Sequelize via le driver `mysql2`. La base de données est structurée en 8 tables avec des contraintes d'intégrité référentielle (clés étrangères avec `ON DELETE CASCADE`).

### II.5. Outils de Développement

| Outil | Usage |
|---|---|
| Visual Studio Code | Éditeur de code principal |
| Kiro (IA) | Assistant au développement et à la génération de code |
| Git / GitHub | Gestion de versions |
| Postman | Test des endpoints API REST |
| phpMyAdmin | Administration de la base de données |
| draw.io | Conception des diagrammes UML |
| XAMPP | Serveur local MySQL/MariaDB |

---

---

## III. Architecture Détaillée de la Solution

### III.1. Organisation des Portails

La plateforme est organisée en **trois applications frontend indépendantes**, chacune dédiée à un groupe d'utilisateurs :

| Portail | Port | Rôles concernés | Couleur dominante |
|---|---|---|---|
| Portail Étudiant | 5173 | Étudiant | Bleu nuit (#0f172a → #1e3a8a) |
| Portail Personnel | 5174 | Encadrant, RP | Violet (#4c1d95 → #7c3aed) |
| Portail Admin | 5175 | Administrateur | Bleu nuit (#0f172a → #1e40af) |

Cette séparation garantit une isolation des accès et une expérience utilisateur adaptée à chaque profil.

### III.2. Structure du Backend

Le backend suit le pattern **MVC (Model-View-Controller)** avec une séparation claire des responsabilités :

```
backend/
├── config/          Connexion Sequelize (MySQL)
├── controllers/     Logique métier par domaine
│   ├── auth.controller.js       Inscription, connexion, JWT
│   ├── admin.controller.js      Gestion des comptes
│   ├── ecole.controller.js      CRUD établissements
│   ├── structure.controller.js  Départements et filières
│   ├── encadrant.controller.js  Supervision étudiants
│   ├── assignation.controller.js Gestion RP
│   ├── stage.controller.js      Stage et mémoire
│   ├── profil.controller.js     Mise à jour profil
│   └── message.controller.js    Messagerie
├── middlewares/
│   ├── auth.middleware.js       JWT + RBAC
│   └── upload.middleware.js     Multer (PDF/Word)
├── models/          Entités Sequelize
├── routes/          Définition des endpoints REST
├── validators/      Validation express-validator
└── uploads/         Fichiers déposés par les utilisateurs
```

### III.3. Sécurité Implémentée

La sécurité de la plateforme repose sur plusieurs niveaux :

**Authentification :** Chaque utilisateur reçoit un token JWT signé (secret configurable, expiration 7 jours) à la connexion. Ce token est transmis dans l'en-tête `Authorization: Bearer <token>` à chaque requête.

**Autorisation (RBAC) :** Le middleware `autoriserRoles(...roles)` vérifie que le rôle de l'utilisateur connecté correspond aux rôles autorisés pour chaque route. Par exemple, seul un `responsable_pedagogique` peut accéder aux routes d'assignation.

**Hachage des mots de passe :** Bcrypt avec salt=12 appliqué automatiquement via les hooks Sequelize. Les mots de passe ne sont jamais stockés ni retournés en clair.

**Réinitialisation de mot de passe :** Génération d'un code à 6 chiffres avec TTL de 15 minutes. En production, ce code serait envoyé par email via Nodemailer.

**Validation des entrées :** Double validation — côté client (Zod) et côté serveur (express-validator) — pour prévenir les injections et les données malformées.

**Upload sécurisé :** Seuls les formats PDF, DOC et DOCX sont acceptés (vérification du MIME type). Les fichiers sont renommés avec un identifiant unique horodaté pour éviter les collisions et les attaques par traversée de chemin.

---

## IV. Conception de la Base de Données

### IV.1. Modèle Physique des Données

La base de données `gestion_stages_memoires` comprend 8 tables :

**Table `ecoles`** — Établissements académiques
```sql
id, nom (UNIQUE), sigle, ville, pays, description, is_active
```

**Table `departements`** — Départements d'un établissement
```sql
id, ecole_id (FK→ecoles CASCADE), nom, code, is_active
```

**Table `filieres`** — Filières d'un département
```sql
id, departement_id (FK→departements CASCADE), nom, code,
niveaux (TEXT/JSON), is_active
```

**Table `users`** — Tous les utilisateurs
```sql
id, nom, prenom, email (UNIQUE), mot_de_passe (HASH),
role ENUM(etudiant|encadrant|responsable_pedagogique|admin),
ecole_id (FK), departement_id (FK), filiere_id (FK),
numero_etudiant (UNIQUE), niveau, annee_universitaire,
grade, specialite, telephone,
profil_complet, is_active,
reset_code, reset_code_expiry
```

**Table `assignations`** — Lien encadrant-étudiant
```sql
id, etudiant_id (FK→users CASCADE),
encadrant_id (FK→users CASCADE),
rp_id (FK→users SET NULL),
annee_universitaire, statut ENUM(active|terminee|annulee),
note_rp
```

**Table `stages`** — Informations de stage
```sql
id, etudiant_id (FK UNIQUE), a_stage, entreprise, secteur,
sujet, lieu, date_debut, date_fin, statut, encadrant_entreprise
```

**Table `memoires`** — Mémoires soumis
```sql
id, etudiant_id (FK UNIQUE), titre, description,
fichier_url (1000), type_depot ENUM(fichier|lien),
date_depot, statut ENUM(non_soumis|soumis|valide|rejete),
commentaire_encadrant, aptitude ENUM(en_attente|apte|non_apte),
motif_refus, date_decision
```

**Table `messages`** — Messagerie interne
```sql
id, expediteur_id (FK→users CASCADE),
destinataire_id (FK→users CASCADE),
contenu, fichier_url, fichier_nom, lu
```

### IV.2. Règles d'Intégrité

- **ON DELETE CASCADE** : la suppression d'un utilisateur supprime automatiquement ses stages, mémoires, messages et assignations
- **ON DELETE SET NULL** : la suppression d'un RP ou encadrant ne supprime pas les assignations mais annule la référence
- **UNIQUE** sur `email` et `numero_etudiant` : pas de doublons
- **ENUM** pour les statuts : garantit la cohérence des valeurs

---

## V. Présentation des Fonctionnalités Implémentées

### V.1. Portail Étudiant

Le portail étudiant propose cinq onglets principaux :

**Accueil** — Vue synthétique avec :
- Quatre cartes de statut cliquables (profil, stage, mémoire, aptitude)
- Timeline de progression (7 étapes : Inscrit → Profil → Stage → Encadrant → Mémoire → Apte → Soutenu)
- Rappel des informations de l'encadrant assigné

**Mon Profil** — Complétion du profil académique :
- Sélection dynamique du département (selon l'école choisie à l'inscription)
- Sélection de la filière et du niveau (selon le département)
- Indicateur visuel profil complet/incomplet

**Stage** — Déclaration de la situation de stage :
- Choix oui/non
- Si oui : saisie de l'entreprise, secteur, sujet, lieu, dates, encadrant entreprise

**Mémoire** — Dépôt et suivi du mémoire :
- Saisie du titre et de la description du sujet
- Choix du mode de dépôt : upload fichier (PDF/Word, 20 Mo max) ou lien externe (Google Drive, OneDrive...)
- Affichage du statut, de la décision d'aptitude et du commentaire de l'encadrant
- Blocage de modification si décision rendue

**Messages** — Messagerie directe avec l'encadrant :
- Affichage chronologique des échanges
- Envoi de messages texte
- Partage de fichiers (PDF, Word, images)

### V.2. Portail Personnel (Encadrant / RP)

**Dashboard Encadrant — 4 onglets :**

- *Accueil* : statistiques (étudiants supervisés, aptes, non aptes, mémoires déposés)
- *Mon profil* : complétion avec département, grade, spécialité
- *Mes étudiants* : liste avec statuts, accès au document de mémoire, décision d'aptitude, messagerie
- *Mémoires* : vue détaillée par étudiant avec consultation du document et formulaire de décision
- *Trouver des étudiants* : liste de tous les étudiants avec auto-assignation

**Dashboard Responsable Pédagogique — 3 onglets :**

- *Accueil* : statistiques globales et alertes (étudiants sans encadrant)
- *Mon profil* : complétion
- *Assignations* : vue "sans encadrant" avec assignation via modal, vue "toutes les assignations" avec suppression

### V.3. Portail Administrateur

**Sidebar de navigation avec 7 sections :**

1. *Tableau de bord* : statistiques temps réel (étudiants, encadrants, RP, actifs, inactifs)
2. *Étudiants* : liste filtrée, activation/désactivation, suppression
3. *Encadrants* : même gestion
4. *Resp. Pédagogiques* : même gestion
5. *Tous les comptes* : vue globale avec recherche et filtres
6. *Établissements* : CRUD avec barre de recherche, activation/masquage
7. *Depts & Filières* : gestion en arbre accordéon École → Département → Filières avec niveaux configurables

---

## VI. Résultats et Discussion

### VI.1. Résultats Obtenus

À l'issue du développement, la plateforme est pleinement fonctionnelle et déployable. Les résultats sont les suivants :

**Fonctionnalités réalisées :**

| Fonctionnalité | Statut |
|---|---|
| Authentification JWT multi-rôles | ✅ Implémenté |
| Réinitialisation mot de passe | ✅ Implémenté |
| Gestion multi-établissements (CRUD) | ✅ Implémenté |
| Structure académique dynamique | ✅ Implémenté |
| Inscription et profil étudiant | ✅ Implémenté |
| Déclaration de stage | ✅ Implémenté |
| Dépôt de mémoire (fichier/lien) | ✅ Implémenté |
| Décision d'aptitude encadrant | ✅ Implémenté |
| Auto-assignation encadrant | ✅ Implémenté |
| Assignation par RP | ✅ Implémenté |
| Messagerie interne avec pièces jointes | ✅ Implémenté |
| Timeline de progression | ✅ Implémenté |
| Mode sombre / mode clair | ✅ Implémenté |
| Interface responsive | ✅ Implémenté |
| Gestion des comptes (admin) | ✅ Implémenté |

**Architecture :**
- 3 applications frontend indépendantes (total ~1 900 modules transformés)
- 1 API REST avec 45+ endpoints documentés
- Base de données MySQL avec 8 tables, contraintes d'intégrité et données initiales
- Système de fichiers organisé (`uploads/memoires/`, `uploads/messages/`)

### VI.2. Difficultés Rencontrées

**Gestion des index MySQL :** L'utilisation de `sequelize.sync({ alter: true })` en développement a entraîné une accumulation d'index dupliqués sur la table `users`, provoquant l'erreur "Too many keys". Solution : passage à `sync({ alter: false })` et gestion manuelle des migrations SQL.

**Corruption de la base de données :** Suite à un arrêt inopiné de MariaDB, les fichiers `.ibd` de la table `users` se sont corrompus. Résolution par suppression manuelle des fichiers orphelins et réimportation du script SQL.

**Compatibilité versions React Router :** La migration vers React Router v7 a introduit des avertissements de dépréciation. Solution : ajout des flags `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` sur `<BrowserRouter>`.

**Champ JSON dans MariaDB :** Le type `DataTypes.JSON` de Sequelize retourne parfois les données comme une chaîne en MariaDB. Solution : ajout d'un getter/setter dans le modèle `Filiere` pour parser automatiquement le champ `niveaux`.

### VI.3. Limites et Perspectives

**Limites actuelles :**
- Pas d'envoi d'emails réel pour la réinitialisation du mot de passe (affiché en console en mode développement)
- Pas de notifications en temps réel (WebSocket non implémenté)
- Pas de système de gestion des quotas de fichiers par utilisateur

**Perspectives d'évolution :**
- Intégration d'un système d'envoi d'emails (Nodemailer + SMTP configuré)
- Ajout de notifications temps réel via Socket.io
- Développement d'une application mobile (React Native)
- Gestion des soutenances (date, heure, salle, jury)
- Export PDF des récapitulatifs de parcours étudiant
- Internationalisation (support multilingue français/anglais/wolof)

---

## VII. Conclusion

Ce chapitre a présenté l'ensemble des choix techniques effectués et les résultats obtenus. La stack technologique adoptée — React.js, Node.js/Express, MySQL/Sequelize — constitue un ensemble cohérent, performant et largement utilisé dans l'industrie. La plateforme développée répond aux exigences fonctionnelles et non fonctionnelles identifiées dans le chapitre précédent.

---

---

## CONCLUSION GÉNÉRALE

Ce stage de fin de cycle, réalisé au sein de **SenDigitale Pulse** de janvier à juin 2024, nous a permis de concevoir et de développer une **plateforme web multi-établissements de gestion des stages et mémoires universitaires** — une solution numérique répondant à une problématique réelle et commune à de nombreux établissements d'enseignement supérieur.

La plateforme développée propose une réponse structurée aux insuffisances des processus manuels encore largement répandus : processus de suivi fragmenté, communication difficile entre acteurs, manque de traçabilité et surcharge administrative. En proposant des espaces dédiés à chaque acteur (étudiant, encadrant, responsable pédagogique, administrateur), interconnectés et sécurisés, elle offre une vision centralisée et temps réel de l'ensemble du processus d'encadrement.

Sur le plan technique, ce projet nous a permis d'approfondir notre maîtrise de technologies modernes du développement web : **React.js** pour la construction d'interfaces dynamiques, **Node.js/Express** pour la création d'une API REST robuste, **Sequelize/MySQL** pour la persistance des données, et **JWT/Bcrypt** pour la sécurisation des accès. Il nous a également confrontés à des problématiques concrètes du développement logiciel : gestion des migrations de base de données, compatibilité des bibliothèques, upload et stockage de fichiers, gestion des rôles et permissions.

Au-delà des aspects techniques, ce stage nous a appris à analyser un besoin utilisateur, à modéliser une solution avant de l'implémenter, et à travailler de façon méthodique en respectant les normes du génie logiciel. Il a également renforcé notre conviction que la transformation numérique des institutions académiques africaines est non seulement possible, mais nécessaire et urgente.

À terme, cette plateforme pourrait être enrichie par un système de notifications en temps réel, la gestion des soutenances, l'export de récapitulatifs et le développement d'une application mobile, pour former un écosystème complet de gestion académique.

---

## RÉFÉRENCES BIBLIOGRAPHIQUES

[1] W.-K. Chen, *Linear Networks and Systems*, Belmont, CA: Wadsworth, 1993.

[2] Meta Platforms, "React — La bibliothèque pour des interfaces utilisateur web et native", https://fr.react.dev, [Consulté le 10/05/2024].

[3] OpenJS Foundation, "Node.js — Documentation officielle", https://nodejs.org/fr/docs, [Consulté le 10/05/2024].

[4] Sequelize, "Sequelize ORM — Documentation", https://sequelize.org/docs/v6/, [Consulté le 15/05/2024].

[5] Auth0, "Introduction to JSON Web Tokens", https://jwt.io/introduction, [Consulté le 12/05/2024].

[6] Vite, "Vite — Next Generation Frontend Tooling", https://vite.dev, [Consulté le 08/05/2024].

[7] MySQL, "MySQL 8.0 Reference Manual", https://dev.mysql.com/doc/refman/8.0/en/, [Consulté le 20/05/2024].

[8] Lucidchart, "Qu'est-ce que le langage UML ?", https://www.lucidchart.com/pages/fr/langage-uml, [Consulté le 24/04/2024].

[9] Département Génie Informatique ESP, "Guide de Rédaction de Mémoire et Rapport de Stage — DGI 2023/2024", ESP/UCAD, Dakar, adopté le 24 avril 2024.

[10] React Hook Form, "React Hook Form — Documentation", https://react-hook-form.com, [Consulté le 14/05/2024].

[11] Zod, "Zod — TypeScript-first schema validation", https://zod.dev, [Consulté le 14/05/2024].

---

## ANNEXES

### Annexe A — Architecture des dossiers du projet

```
projetL3/
├── backend/                  API REST (Node.js + Express)
│   ├── controllers/          Logique métier (9 controllers)
│   ├── models/               Modèles Sequelize (8 entités)
│   ├── routes/               Endpoints REST (9 routeurs)
│   ├── middlewares/          JWT, RBAC, Multer
│   ├── validators/           Validation express-validator
│   └── uploads/              Fichiers déposés
│
├── frontend-student/         Portail Étudiant (port 5173)
│   └── src/
│       ├── pages/            Connexion, Inscription, Dashboard, MotDePasseOublie
│       ├── components/       ProtectedRoute, ThemeToggle
│       ├── context/          AuthContext (gestion session)
│       └── api/              Instance Axios configurée
│
├── frontend-staff/           Portail Personnel (port 5174)
│   └── src/                  (même structure)
│
├── frontend-admin/           Portail Administrateur (port 5175)
│   └── src/
│       ├── pages/            Dashboard, DashboardStats, GestionEcoles,
│       │                     GestionUtilisateurs, GestionStructure
│       └── components/       Sidebar, ProtectedRoute, ThemeToggle
│
├── database.sql              Script de création de la base de données
└── modelisation/             Diagrammes UML (draw.io + markdown)
```

### Annexe B — Commandes de démarrage

```bash
# 1. Importer la base de données
mysql -u root -p < database.sql

# 2. Démarrer le backend
cd backend && npm run dev          # → http://localhost:5000

# 3. Démarrer les portails (terminaux séparés)
cd frontend-student && npm run dev  # → http://localhost:5173
cd frontend-staff   && npm run dev  # → http://localhost:5174
cd frontend-admin   && npm run dev  # → http://localhost:5175
```

**Compte administrateur par défaut :**
- Email : `admin@universite.fr`
- Mot de passe : `Admin1234!`

### Annexe C — Récapitulatif des technologies utilisées

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Frontend | React.js | 19.2 | UI components |
| Frontend | Vite | 8.0 | Build tool |
| Frontend | React Router DOM | 7.x | Routage |
| Frontend | React Hook Form | 7.77 | Formulaires |
| Frontend | Zod | 4.4 | Validation client |
| Frontend | Axios | 1.17 | Client HTTP |
| Frontend | Lucide React | 1.17 | Icônes |
| Frontend | CSS Variables | — | Design system |
| Backend | Node.js | 24.x | Runtime serveur |
| Backend | Express.js | 5.2 | Framework HTTP |
| Backend | Sequelize | 6.37 | ORM |
| Backend | jsonwebtoken | 9.0 | Auth JWT |
| Backend | bcryptjs | 3.0 | Hachage mdp |
| Backend | Multer | 2.1 | Upload fichiers |
| Backend | express-validator | 7.3 | Validation serveur |
| Backend | cors | 2.8 | Sécurité CORS |
| Backend | dotenv | 17.4 | Config env |
| BDD | MySQL / MariaDB | 8.0 / 10.4 | Base de données |
| BDD | mysql2 | 3.22 | Driver Node.js |
| Outils | Git | — | Versioning |
| Outils | Postman | — | Test API |
| Outils | draw.io | — | Diagrammes UML |
| Outils | XAMPP | — | Serveur local |

---

*Fin du rapport de stage*
