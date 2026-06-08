-- ============================================================
--  BASE DE DONNÉES — Gestion des Stages & Mémoires
--  À importer dans MySQL : mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_stages_memoires
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_stages_memoires;

-- ──────────────────────────────────────────────────────────────
--  TABLE : ecoles
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecoles (
  id            INT           NOT NULL AUTO_INCREMENT,
  nom           VARCHAR(200)  NOT NULL,
  sigle         VARCHAR(20)   DEFAULT NULL,
  ville         VARCHAR(100)  DEFAULT NULL,
  pays          VARCHAR(100)  DEFAULT 'Sénégal',
  description   TEXT          DEFAULT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ecoles_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  TABLE : users
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  INT           NOT NULL AUTO_INCREMENT,
  nom                 VARCHAR(100)  NOT NULL,
  prenom              VARCHAR(100)  NOT NULL,
  email               VARCHAR(150)  NOT NULL,
  mot_de_passe        VARCHAR(255)  NOT NULL,
  role                ENUM('etudiant','encadrant','responsable_pedagogique','admin') NOT NULL,
  ecole_id            INT           DEFAULT NULL,
  numero_etudiant     VARCHAR(20)   DEFAULT NULL,
  grade               VARCHAR(100)  DEFAULT NULL,
  specialite          VARCHAR(150)  DEFAULT NULL,
  telephone           VARCHAR(20)   DEFAULT NULL,
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email          (email),
  UNIQUE KEY uq_users_num_etudiant   (numero_etudiant),
  CONSTRAINT fk_users_ecole
    FOREIGN KEY (ecole_id) REFERENCES ecoles (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
--  DONNÉES INITIALES : Établissements
-- ──────────────────────────────────────────────────────────────
INSERT INTO ecoles (nom, sigle, ville, pays, description) VALUES
  ('École Supérieure Polytechnique',                           'ESP',        'Dakar',       'Sénégal', 'Grande école d\'ingénieurs de l\'UCAD'),
  ('UCAD – Faculté des Sciences et Techniques',               'FST',        'Dakar',       'Sénégal', NULL),
  ('UCAD – Faculté des Sciences Juridiques et Politiques',    'FSJP',       'Dakar',       'Sénégal', NULL),
  ('UCAD – Faculté des Lettres et Sciences Humaines',         'FLSH',       'Dakar',       'Sénégal', NULL),
  ('UCAD – Faculté de Médecine, Pharmacie et Odontologie',    'FMPOS',      'Dakar',       'Sénégal', NULL),
  ('École Polytechnique de Thiès',                            'EPT',        'Thiès',       'Sénégal', NULL),
  ('École Nationale Supérieure Universitaire de Technologie', 'ENSUT',      'Dakar',       'Sénégal', NULL),
  ('Institut Supérieur d\'Enseignement Professionnel Dakar',  'ISEP Dakar', 'Dakar',       'Sénégal', NULL),
  ('Institut Supérieur d\'Enseignement Professionnel Thiès',  'ISEP Thiès', 'Thiès',       'Sénégal', NULL),
  ('Institut Supérieur d\'Enseignement Professionnel Ziguinchor', 'ISEP Ziguinchor', 'Ziguinchor', 'Sénégal', NULL),
  ('Institut Africain de Management',                         'IAM',        'Dakar',       'Sénégal', NULL),
  ('Institut Supérieur de Management',                        'ISM',        'Dakar',       'Sénégal', NULL),
  ('Sup de Co Dakar (Dakar Business School)',                 'Sup de Co',  'Dakar',       'Sénégal', NULL),
  ('Institut de Banque et Économie',                          'IBE',        'Dakar',       'Sénégal', NULL);

-- ──────────────────────────────────────────────────────────────
--  COMPTE ADMIN PAR DÉFAUT
--  Mot de passe : Admin1234!
--  Hash bcrypt généré avec salt=12
--  ⚠ Changer le mot de passe après la première connexion !
-- ──────────────────────────────────────────────────────────────
INSERT INTO users (nom, prenom, email, mot_de_passe, role, is_active) VALUES
  (
    'Admin',
    'Super',
    'admin@universite.fr',
    '$2b$12$.xXE.8s8Rgdv8dXEtCx/ye3MIcrwDQA4iDqZFmsXOUggAkOj8OJOW',
    'admin',
    1
  );

-- ──────────────────────────────────────────────────────────────
--  FIN DU SCRIPT
-- ──────────────────────────────────────────────────────────────
