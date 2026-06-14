# Fiches Textuelles — Système de Gestion des Stages & Mémoires

---

## FICHE 1 — Cas d'utilisation : S'inscrire

| Champ | Détail |
|---|---|
| **Identifiant** | UC-01 |
| **Nom** | S'inscrire |
| **Acteur principal** | Étudiant / Personnel (Encadrant, Responsable Pédagogique) |
| **Acteurs secondaires** | Système (API, Base de données) |
| **Déclencheur** | L'utilisateur accède à la page d'inscription |
| **Pré-conditions** | L'utilisateur n'a pas encore de compte. Au moins un établissement doit être créé par l'Administrateur. |
| **Post-conditions (succès)** | Un compte est créé, un token JWT est retourné, l'utilisateur est redirigé vers le dashboard. |
| **Post-conditions (échec)** | Le compte n'est pas créé. Un message d'erreur est affiché. |

### Scénario nominal

1. L'utilisateur accède au portail approprié (étudiant ou personnel).
2. Il clique sur "S'inscrire".
3. Le système charge dynamiquement la liste des établissements depuis l'API.
4. L'utilisateur remplit le formulaire : nom, prénom, email, numéro étudiant (pour étudiant), établissement, mot de passe.
5. Pour le personnel : il sélectionne son rôle (Encadrant ou Responsable Pédagogique).
6. Il soumet le formulaire.
7. Le système valide les données (format email, longueur mot de passe).
8. Le système vérifie l'unicité de l'email (et du numéro étudiant).
9. Le système hache le mot de passe (bcrypt, salt 12).
10. Le système crée le compte en base de données.
11. Le système génère un token JWT.
12. L'utilisateur est redirigé vers son dashboard.

### Scénarios alternatifs

**5a.** Email déjà utilisé :
- Le système retourne une erreur 409.
- Le message "Cet email est déjà utilisé" est affiché.
- L'utilisateur corrige et resoumet.

**5b.** Format email invalide ou mot de passe trop court :
- La validation côté client (Zod) affiche les erreurs sous chaque champ.
- Le formulaire n'est pas soumis.

**5c.** Aucun établissement disponible :
- Un message d'avertissement "Contactez l'administration" est affiché.
- L'étudiant ne peut pas finaliser son inscription.

---

## FICHE 2 — Cas d'utilisation : Soumettre un Mémoire

| Champ | Détail |
|---|---|
| **Identifiant** | UC-05 |
| **Nom** | Soumettre un mémoire |
| **Acteur principal** | Étudiant |
| **Acteurs secondaires** | Système (API, Base de données, Système de fichiers) |
| **Déclencheur** | L'étudiant se rend dans l'onglet "Mémoire" de son dashboard |
| **Pré-conditions** | L'étudiant est connecté. Son aptitude n'a pas encore été décidée (statut "en_attente"). |
| **Post-conditions (succès)** | Le mémoire est enregistré en base. Le fichier est stocké sur le serveur (si mode "fichier") ou le lien est sauvegardé. Le statut passe à "soumis". |
| **Post-conditions (échec)** | Le mémoire n'est pas enregistré. Un message d'erreur est affiché. |

### Scénario nominal

1. L'étudiant navigue vers l'onglet "📄 Mémoire".
2. Le système affiche le formulaire de dépôt.
3. L'étudiant saisit le titre de son mémoire.
4. Il choisit le mode de dépôt :
   - **Mode fichier** : il sélectionne un fichier PDF, DOC ou DOCX (max 20 Mo).
   - **Mode lien** : il colle un lien Google Drive, OneDrive ou autre.
5. Il clique sur "Soumettre le mémoire".
6. Le système valide le titre (non vide) et la présence du fichier ou lien.
7. **Si mode fichier** : multer enregistre le fichier dans `uploads/memoires/` avec un nom unique.
8. Le système vérifie que l'aptitude est encore "en_attente".
9. Le système crée ou met à jour l'entrée Memoire en base avec statut "soumis".
10. L'interface affiche un toast de confirmation et recharge les données.

### Scénarios alternatifs

**4a.** Format fichier non autorisé (ex : .jpg) :
- La validation côté client refuse le fichier.
- Le message "Seuls PDF et Word sont acceptés" est affiché.

**4b.** Fichier trop volumineux (> 20 Mo) :
- Le serveur retourne 413 "Fichier trop volumineux".
- L'utilisateur doit utiliser un lien à la place.

**8a.** Aptitude déjà décidée (apte ou non_apte) :
- Le système retourne 403.
- Le message "Impossible de modifier : l'encadrant a déjà rendu une décision" est affiché.
- Le formulaire est verrouillé (bouton masqué côté client).

**9a.** L'étudiant souhaite modifier son mémoire :
- Il clique sur "Modifier".
- Le formulaire se réouvre pré-rempli.
- S'il uploade un nouveau fichier, l'ancien est supprimé du serveur.

---

## FICHE 3 — Cas d'utilisation : Déclarer l'Aptitude à Soutenir

| Champ | Détail |
|---|---|
| **Identifiant** | UC-09 |
| **Nom** | Déclarer l'aptitude à soutenir |
| **Acteur principal** | Encadrant |
| **Acteurs secondaires** | Étudiant (notifié via dashboard), Système |
| **Déclencheur** | L'encadrant ouvre l'onglet "📄 Mémoires" et clique sur un étudiant |
| **Pré-conditions** | L'encadrant est connecté. L'étudiant lui est assigné. L'étudiant a soumis son mémoire (statut ≠ "non_soumis"). |
| **Post-conditions (succès)** | L'aptitude de l'étudiant est mise à jour (apte / non_apte). La date de décision est enregistrée. L'étudiant peut consulter la décision et le commentaire. |
| **Post-conditions (échec)** | L'aptitude reste "en_attente". |

### Scénario nominal

1. L'encadrant accède à l'onglet "📄 Mémoires" de son dashboard.
2. Il voit la liste de ses étudiants avec le titre de leur mémoire et leur statut actuel.
3. Il clique sur un étudiant pour voir le détail.
4. Il consulte le document soumis (clique sur "Télécharger" ou "Ouvrir le lien").
5. Il clique sur "Rendre ma décision".
6. Le formulaire de décision s'affiche.
7. Il sélectionne "Apte à soutenir" ou "Non apte".
8. S'il choisit "Non apte" : il renseigne le motif du refus.
9. Il ajoute optionnellement un commentaire pour l'étudiant.
10. Il clique sur "Confirmer la décision".
11. Le système enregistre l'aptitude, le commentaire et la date de décision.
12. L'interface affiche un toast de confirmation.
13. L'étudiant peut maintenant voir la décision dans son onglet "Mémoire".

### Scénarios alternatifs

**3a.** L'étudiant n'a pas encore soumis de mémoire :
- Le message "L'étudiant n'a pas encore soumis de mémoire" est affiché.
- Le formulaire de décision est masqué.

**7a.** L'encadrant souhaite modifier une décision déjà rendue :
- Le bouton passe à "Modifier la décision".
- Le formulaire se réouvre avec les valeurs précédentes.
- Une nouvelle décision écrase l'ancienne.

---

## FICHE 4 — Cas d'utilisation : Réinitialiser le Mot de Passe

| Champ | Détail |
|---|---|
| **Identifiant** | UC-02 |
| **Nom** | Réinitialiser le mot de passe |
| **Acteur principal** | Tout utilisateur (Étudiant, Encadrant, RP, Admin) |
| **Acteurs secondaires** | Système |
| **Déclencheur** | L'utilisateur clique sur "Mot de passe oublié ?" sur la page de connexion |
| **Pré-conditions** | L'utilisateur possède un compte enregistré. |
| **Post-conditions (succès)** | Le mot de passe est mis à jour. L'utilisateur peut se connecter avec le nouveau mot de passe. |
| **Post-conditions (échec)** | Le mot de passe reste inchangé. |

### Scénario nominal

1. L'utilisateur clique sur "Mot de passe oublié ?".
2. La page de réinitialisation s'affiche (étape 1).
3. L'utilisateur saisit son adresse email.
4. Il clique sur "Envoyer le code".
5. Le système génère un code à 6 chiffres valable 15 minutes.
6. **En mode développement** : le code est affiché directement dans l'interface.
7. L'interface passe à l'étape 2.
8. L'utilisateur saisit le code reçu, le nouveau mot de passe et sa confirmation.
9. Il clique sur "Réinitialiser".
10. Le système vérifie le code et son expiration.
11. Le nouveau mot de passe est haché et enregistré.
12. Les champs `reset_code` et `reset_code_expiry` sont effacés.
13. Un message de succès est affiché. L'utilisateur est invité à se connecter.

### Scénarios alternatifs

**3a.** Email inconnu dans la base :
- Le système répond "Si cet email existe, un code a été généré" (sécurité anti-enumération).
- L'interface passe quand même à l'étape 2.

**8a.** Code incorrect :
- Erreur "Code incorrect."
- L'utilisateur peut réessayer.

**8b.** Code expiré (> 15 min) :
- Erreur "Le code a expiré. Faites une nouvelle demande."
- L'utilisateur retourne à l'étape 1.

**8c.** Mots de passe ne correspondent pas :
- La validation côté client affiche l'erreur avant envoi.

---

## FICHE 5 — Cas d'utilisation : Assigner un Encadrant (Responsable Pédagogique)

| Champ | Détail |
|---|---|
| **Identifiant** | UC-11 |
| **Nom** | Assigner un encadrant à un étudiant |
| **Acteur principal** | Responsable Pédagogique |
| **Acteurs secondaires** | Système, Encadrant (assigné), Étudiant (assigné) |
| **Déclencheur** | Le RP ouvre l'onglet "🔗 Assignations" et voit des étudiants sans encadrant |
| **Pré-conditions** | Le RP est connecté. Il existe au moins un étudiant sans encadrant et au moins un encadrant actif. |
| **Post-conditions (succès)** | Une assignation est créée avec statut "active". L'étudiant peut voir son encadrant dans son dashboard. |
| **Post-conditions (échec)** | L'assignation n'est pas créée. |

### Scénario nominal

1. Le RP accède à l'onglet "Assignations".
2. La vue "Sans encadrant" est affichée par défaut avec la liste des étudiants non assignés.
3. Il clique sur "Assigner" pour un étudiant.
4. Une modale s'ouvre avec la liste des encadrants disponibles (avec leur charge actuelle).
5. Il sélectionne un encadrant.
6. Il renseigne optionnellement l'année universitaire.
7. Il clique sur "Assigner".
8. Le système vérifie que l'étudiant n'a pas déjà une assignation active.
9. Le système crée l'assignation avec `rp_id = RP.id`.
10. La liste se met à jour automatiquement.
11. L'étudiant concerné peut désormais voir son encadrant dans son dashboard.

### Scénarios alternatifs

**8a.** L'étudiant a déjà un encadrant actif :
- Erreur 409 "Cet étudiant a déjà un encadrant actif."
- La modale reste ouverte pour corriger.

---

## FICHE 6 — Cas d'utilisation : Gérer la Structure Académique (Admin)

| Champ | Détail |
|---|---|
| **Identifiant** | UC-13 |
| **Nom** | Gérer les établissements, départements et filières |
| **Acteur principal** | Administrateur |
| **Acteurs secondaires** | Système, Étudiants et Encadrants (utilisent les données lors de l'inscription) |
| **Déclencheur** | L'Admin accède à "Depts & Filières" dans la sidebar |
| **Pré-conditions** | L'Admin est connecté. Au moins un établissement existe. |
| **Post-conditions** | La structure académique est mise à jour. Les sélects d'inscription et de profil reflètent immédiatement les changements. |

### Scénario nominal — Ajout d'un département et ses filières

1. L'Admin accède à la page "Structure académique".
2. Il voit la liste des établissements en accordéon.
3. Il ouvre un établissement en cliquant dessus.
4. Il clique sur "Ajouter un département".
5. Il saisit le nom et le code du département.
6. Il clique "Ajouter".
7. Le département apparaît dans la liste.
8. Il clique sur le département pour l'ouvrir.
9. Il clique sur "Ajouter une filière".
10. Il saisit le nom, le code et coche les niveaux disponibles (L1 à M2).
11. Il clique "Ajouter la filière".
12. La filière est créée et visible.
13. Immédiatement, lors de la complétion de profil, les étudiants et encadrants de cet établissement voient ce département et cette filière dans leurs sélects.
