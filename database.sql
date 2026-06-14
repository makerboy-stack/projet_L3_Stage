-- ============================================================
--  GESTION DES STAGES & MÉMOIRES — Base de données complète
--  
--  INSTRUCTIONS :
--  1. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
--  2. Cliquer sur "Importer" dans la barre du haut
--  3. Sélectionner ce fichier et cliquer "Exécuter"
--
--  OU en ligne de commande :
--  mysql -u root --host=127.0.0.1 < database.sql
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
--  ENCODAGE UTF-8 — OBLIGATOIRE (corrige les caractères spéciaux)
-- ============================================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_client = utf8mb4;

-- Supprimer et recréer la base proprement
DROP DATABASE IF EXISTS gestion_stages_memoires;
CREATE DATABASE gestion_stages_memoires
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_stages_memoires;

-- ──────────────────────────────────────────────────────────────
--  TABLE : ecoles
-- ──────────────────────────────────────────────────────────────
CREATE TABLE ecoles (
  id          INT          NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(200) NOT NULL,
  sigle       VARCHAR(20)  DEFAULT NULL,
  ville       VARCHAR(100) DEFAULT NULL,
  pays        VARCHAR(100) DEFAULT 'Sénégal',
  description TEXT         DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ecoles_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : departements
-- ──────────────────────────────────────────────────────────────
CREATE TABLE departements (
  id          INT          NOT NULL AUTO_INCREMENT,
  ecole_id    INT          NOT NULL,
  nom         VARCHAR(150) NOT NULL,
  code        VARCHAR(20)  DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_dept_ecole FOREIGN KEY (ecole_id) REFERENCES ecoles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : filieres
-- ──────────────────────────────────────────────────────────────
CREATE TABLE filieres (
  id              INT          NOT NULL AUTO_INCREMENT,
  departement_id  INT          NOT NULL,
  nom             VARCHAR(150) NOT NULL,
  code            VARCHAR(20)  DEFAULT NULL,
  niveaux         TEXT         DEFAULT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_fil_dept FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : users
-- ──────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                   INT          NOT NULL AUTO_INCREMENT,
  nom                  VARCHAR(100) NOT NULL,
  prenom               VARCHAR(100) NOT NULL,
  email                VARCHAR(150) NOT NULL,
  mot_de_passe         VARCHAR(255) NOT NULL,
  role                 ENUM('etudiant','encadrant','responsable_pedagogique','admin') NOT NULL,
  ecole_id             INT          DEFAULT NULL,
  departement_id       INT          DEFAULT NULL,
  filiere_id           INT          DEFAULT NULL,
  numero_etudiant      VARCHAR(20)  DEFAULT NULL,
  niveau               VARCHAR(10)  DEFAULT NULL,
  annee_universitaire  VARCHAR(20)  DEFAULT NULL,
  grade                VARCHAR(100) DEFAULT NULL,
  specialite           VARCHAR(150) DEFAULT NULL,
  telephone            VARCHAR(20)  DEFAULT NULL,
  profil_complet       TINYINT(1)   NOT NULL DEFAULT 0,
  is_active            TINYINT(1)   NOT NULL DEFAULT 1,
  reset_code           VARCHAR(6)   DEFAULT NULL,
  reset_code_expiry    DATETIME     DEFAULT NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_num_etudiant (numero_etudiant),
  CONSTRAINT fk_users_ecole FOREIGN KEY (ecole_id) REFERENCES ecoles(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_users_dept  FOREIGN KEY (departement_id) REFERENCES departements(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_users_fil   FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : assignations
-- ──────────────────────────────────────────────────────────────
CREATE TABLE assignations (
  id                   INT          NOT NULL AUTO_INCREMENT,
  etudiant_id          INT          NOT NULL,
  encadrant_id         INT          NOT NULL,
  rp_id                INT          DEFAULT NULL,
  annee_universitaire  VARCHAR(20)  DEFAULT NULL,
  statut               ENUM('active','terminee','annulee') NOT NULL DEFAULT 'active',
  note_rp              TEXT         DEFAULT NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_assign_etu FOREIGN KEY (etudiant_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_enc FOREIGN KEY (encadrant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_rp  FOREIGN KEY (rp_id)        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : stages
-- ──────────────────────────────────────────────────────────────
CREATE TABLE stages (
  id                    INT          NOT NULL AUTO_INCREMENT,
  etudiant_id           INT          NOT NULL,
  a_stage               TINYINT(1)   NOT NULL DEFAULT 0,
  entreprise            VARCHAR(200) DEFAULT NULL,
  secteur               VARCHAR(100) DEFAULT NULL,
  sujet                 TEXT         DEFAULT NULL,
  lieu                  VARCHAR(200) DEFAULT NULL,
  date_debut            DATE         DEFAULT NULL,
  date_fin              DATE         DEFAULT NULL,
  statut                ENUM('en_cours','termine') NOT NULL DEFAULT 'en_cours',
  encadrant_entreprise  VARCHAR(150) DEFAULT NULL,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_stage_etudiant (etudiant_id),
  CONSTRAINT fk_stage_etu FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : memoires
-- ──────────────────────────────────────────────────────────────
CREATE TABLE memoires (
  id                     INT           NOT NULL AUTO_INCREMENT,
  etudiant_id            INT           NOT NULL,
  titre                  VARCHAR(300)  DEFAULT NULL,
  fichier_url            VARCHAR(1000) DEFAULT NULL,
  type_depot             ENUM('fichier','lien') DEFAULT NULL,
  date_depot             DATETIME      DEFAULT NULL,
  statut                 ENUM('non_soumis','soumis','valide','rejete') NOT NULL DEFAULT 'non_soumis',
  commentaire_encadrant  TEXT          DEFAULT NULL,
  aptitude               ENUM('en_attente','apte','non_apte') NOT NULL DEFAULT 'en_attente',
  motif_refus            TEXT          DEFAULT NULL,
  date_decision          DATETIME      DEFAULT NULL,
  created_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_memoire_etudiant (etudiant_id),
  CONSTRAINT fk_memoire_etu FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : messages
-- ──────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id               INT    NOT NULL AUTO_INCREMENT,
  expediteur_id    INT    NOT NULL,
  destinataire_id  INT    NOT NULL,
  contenu          TEXT   NOT NULL,
  lu               TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conv (expediteur_id, destinataire_id),
  CONSTRAINT fk_msg_exp  FOREIGN KEY (expediteur_id)   REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_dest FOREIGN KEY (destinataire_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ──────────────────────────────────────────────────────────────
--  DONNÉES : Établissements (14 écoles)
-- ──────────────────────────────────────────────────────────────
INSERT INTO ecoles (nom, sigle, ville, pays, description) VALUES
('École Supérieure Polytechnique', 'ESP', 'Dakar', 'Sénégal', 'Grande école d\'ingénieurs de l\'UCAD'),
('UCAD – Faculté des Sciences et Techniques', 'FST', 'Dakar', 'Sénégal', NULL),
('UCAD – Faculté des Sciences Juridiques et Politiques', 'FSJP', 'Dakar', 'Sénégal', NULL),
('UCAD – Faculté des Lettres et Sciences Humaines', 'FLSH', 'Dakar', 'Sénégal', NULL),
('UCAD – Faculté de Médecine, Pharmacie et Odontologie', 'FMPOS', 'Dakar', 'Sénégal', NULL),
('École Polytechnique de Thiès', 'EPT', 'Thiès', 'Sénégal', NULL),
('École Nationale Supérieure Universitaire de Technologie', 'ENSUT', 'Dakar', 'Sénégal', NULL),
('Institut Supérieur d\'Enseignement Professionnel Dakar', 'ISEP Dakar', 'Dakar', 'Sénégal', NULL),
('Institut Supérieur d\'Enseignement Professionnel Thiès', 'ISEP Thiès', 'Thiès', 'Sénégal', NULL),
('Institut Supérieur d\'Enseignement Professionnel Ziguinchor', 'ISEP Ziguinchor', 'Ziguinchor', 'Sénégal', NULL),
('Institut Africain de Management', 'IAM', 'Dakar', 'Sénégal', NULL),
('Institut Supérieur de Management', 'ISM', 'Dakar', 'Sénégal', NULL),
('Sup de Co Dakar (Dakar Business School)', 'Sup de Co', 'Dakar', 'Sénégal', NULL),
('Institut de Banque et Économie', 'IBE', 'Dakar', 'Sénégal', NULL);

-- ──────────────────────────────────────────────────────────────
--  DONNÉES : Départements ESP (ecole_id = 1)
-- ──────────────────────────────────────────────────────────────
INSERT INTO departements (ecole_id, nom, code) VALUES
(1, 'Génie Informatique',  'GI'),
(1, 'Génie Électrique',    'GE'),
(1, 'Génie Mécanique',     'GM'),
(1, 'Génie Civil',         'GC');

-- ──────────────────────────────────────────────────────────────
--  DONNÉES : Filières Génie Informatique (departement_id = 1)
-- ──────────────────────────────────────────────────────────────
INSERT INTO filieres (departement_id, nom, code, niveaux) VALUES
(1, 'Génie Logiciel',                          'GL',   '["L1","L2","L3","M1","M2"]'),
(1, 'IABD (Intelligence Artificielle & Big Data)', 'IABD', '["L3","M1","M2"]'),
(1, 'Systèmes et Réseaux Télécoms',             'SRT',  '["L3","M1","M2"]'),
(1, 'Sécurité des Systèmes d\'Information',    'SSI',  '["M1","M2"]'),
(1, 'Télécoms et Réseaux',                      'TR',   '["L1","L2","L3","M1","M2"]');

-- ──────────────────────────────────────────────────────────────
--  COMPTE ADMIN par défaut
--  Email    : admin@universite.fr
--  Password : Admin1234!
-- ──────────────────────────────────────────────────────────────
INSERT INTO users (nom, prenom, email, mot_de_passe, role, profil_complet, is_active) VALUES
('Admin', 'Super', 'admin@universite.fr',
 '$2b$12$.xXE.8s8Rgdv8dXEtCx/ye3MIcrwDQA4iDqZFmsXOUggAkOj8OJOW',
 'admin', 1, 1);

-- ──────────────────────────────────────────────────────────────
--  VÉRIFICATION
-- ──────────────────────────────────────────────────────────────
SELECT CONCAT('✅ Base créée avec succès — ', COUNT(*), ' tables') AS resultat
FROM information_schema.tables
WHERE table_schema = 'gestion_stages_memoires';