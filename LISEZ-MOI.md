# Atlas des sites industriels

Carte interactive de vos sites d'intervention, autonome : aucun serveur, aucune clé API, aucun compte.

## Ouvrir

Double-cliquez sur **index.html** : la page de profil s'ouvre dans votre navigateur (Chrome, Edge, Firefox, Safari).
La carte est dans **atlas.html**, accessible depuis le profil (et inversement via le lien « ← Profil »).

## Ajouter vos sites

Pour la carte, tout se passe dans **un seul fichier : `mes-sites.js`**.

1. Ouvrez-le avec un éditeur de texte (VS Code conseillé, ou Bloc-notes / TextEdit en mode texte brut).
2. En haut, renseignez votre nom, votre fonction, le thème (`'clair'` ou `'nuit'`) et la couleur d'accent.
3. Remplacez les 6 sites d'exemple par les vôtres : copiez un bloc `{ … },` par site.
4. Enregistrez, puis rechargez la page (F5).

Champs d'un site : seuls `name`, `lat` et `lon` sont obligatoires. **Un champ absent, vide (`''`) ou fait d'espaces n'est jamais affiché** — ni son intitulé, ni son cadre. Vous pouvez donc simplement supprimer la ligne ou la laisser vide.

| Champ | Contenu |
|---|---|
| `name` | Nom du site |
| `operator` | Exploitant / client |
| `sector` | Secteur (crée automatiquement un filtre) |
| `city`, `country` | Ville, pays |
| `lat`, `lon` | Coordonnées GPS (voir ci-dessous) |
| `gmaps` | Lien Google Maps du site (bouton « Voir sur Google Maps ») ; à défaut, le bouton pointe sur les coordonnées |
| `start`, `end` | Années de début et de fin |
| `role` | Type d'intervention (Formation, Workshop, Installation, SAV…), affiché « Intervention » |
| `description` | Ce qui a été fait, en une ou deux phrases (puces : `• `, retour à la ligne : `
`) |
| `video` | Lien vers une vidéo de l'intervention (bouton « Voir la vidéo ») |
| `notes` | Champ libre |
| `extras` | Champs supplémentaires libres : `[{ label: 'Client', value: '…' }, …]` |

**Lexique** : en fin de `mes-sites.js`, `window.LEXIQUE` explique une fois pour toutes les termes du métier (AGV, shoot latéral, mongata…). Dans les descriptions, ces termes sont soulignés en pointillés, et la fiche du site affiche leur définition, avec un lien vidéo facultatif. Un terme sans définition n'est pas souligné.

**Coordonnées** : dans Google Maps, clic droit sur le site, puis clic sur les chiffres en haut du menu (ex. `51.0343, 2.3768`) : ils sont copiés. Le premier va dans `lat`, le second dans `lon`, avec un **point** décimal.

**Pièges fréquents** : une virgule oubliée entre deux blocs `}, {`, ou une apostrophe dans un texte entre `'…'` (écrivez `’` ou `\'`).
Si la carte s'affiche sans épingles ni liste, c'est presque toujours ça : appuyez sur F12 → onglet « Console » pour voir la ligne fautive.

## Page de profil

Tout le contenu de la page d'accueil est dans **`mon-profil.js`**, rangé par section : accueil, À propos, Karakuri Kaizen, Productions, Ailleurs (voyages), Contact.
Chaque section est une page plein écran : on passe à la suivante d'un cran de molette (une fois arrivé en bas de la page), avec les flèches ← →, d'un glissement du doigt, ou par le menu et les boutons en bas à droite. Chaque page a son adresse (`index.html#/karakuri`…), utilisable dans un lien direct.
Les photos servent de décor, pas de galerie : deux demi-fonds dans la page Karakuri (`karakuri.fond`, `karakuri.fondBas`), une couverture par projet (`image`), et pour chaque voyage au plus un fond et une photo (`fond`, `photo`), révélés au survol du pays (en bandeau sur téléphone).
Le nom, la fonction, le thème et la couleur sont repris de `mes-sites.js`. Les chiffres (sites, pays, secteurs) et l'aperçu de la carte se calculent tout seuls à partir de vos sites.

Comme pour les sites, **un champ vide n'est pas affiché** ; la section Contact n'apparaît qu'une fois un e-mail, un LinkedIn ou un téléphone renseigné.
Une section dont tous les champs sont vides disparaît, numéro et lien du menu compris.

**Photos et documents** : la page n'utilise que les dossiers `images/` (copies allégées, sans données GPS) et `documents/` (PDF publiables).
Pour ajouter une photo, réduisez-la (2 000 px pour un fond, 1 100 px pour une vignette) et retirez ses métadonnées (position GPS des téléphones), placez-la dans `images/…` puis indiquez son chemin dans `mon-profil.js`. Gardez l'original dans `medias/`.
Un projet sans image s'affiche en liste ; avec `lien` il propose le PDF, avec `note` il affiche une mention (ex. « Rapport confidentiel »).

Le titre de l'onglet et le résumé affiché quand on partage le lien (LinkedIn, e-mail…) sont écrits en tête de `index.html` (`<title>` et `description`).

## Page « À propos » et programmes rétro

La page « À propos » est découpée en quatre quadrants (Ingénieur, Montagne, Charpente, Code & IA), réglés dans `mon-profil.js` → `apropos`.
Le quadrant Code & IA (`apropos.code`) présente :
- **les projets récents** (`projets`) : la macro SolidWorks s’ouvre dans une fenêtre (`app/projet.js`) avec deux onglets : sa vidéo (`images/code/`) et son code VBA. Ce code est la **version publique caviardée** `macro-mise-en-plan/macro-publique.bas`, recopiée dans `app/sources-vba.js` : si vous la modifiez, recopiez-la (ou demandez une régénération). Le dossier `macro-mise-en-plan/` (vidéo brute, macro de travail) est privé, exclu par `.gitignore`. Un projet peut aussi avoir un `lien` vers une page de démo ;
- **les compétences** (`competences`), sur la ligne « Aujourd'hui » ;
- **les archives** (`programmes`) : d'anciens programmes Python (`medias/dev`) relancés dans des fenêtres rétro. Ce sont des **portages JavaScript fidèles** (`app/retro/retro.js`), car un navigateur ne sait pas exécuter Tkinter ; leur bouton « Source » affiche le code Python d'origine, recopié dans `app/retro/sources.js`. Scores, options et fractales sauvegardées restent dans le navigateur du visiteur.

## Mettre en ligne (portfolio)

⚠ **Le dossier `medias/` est privé** : il contient vos originaux, votre CV, vos lettres, `PROFIL_CANDIDAT.md` et des rapports confidentiels.
**Sortez-le du dossier avant toute mise en ligne** (Netlify Drop publie tout ce que vous glissez). Le fichier `.gitignore` l'exclut déjà d'un dépôt GitHub.

Le dossier entier est un site statique :

- **Netlify Drop** (le plus simple) : glissez le dossier sur https://app.netlify.com/drop → vous obtenez une adresse publique.
- **GitHub Pages** : déposez le dossier dans un dépôt, puis activez Pages dans les réglages.
- Ou copiez le dossier sur votre hébergement actuel.

## Contenu du dossier

```
index.html          page de profil (accueil)
atlas.html          la carte
mes-sites.js        VOS SITES + nom, fonction, couleur
mon-profil.js       VOS TEXTES DE PROFIL (par section)
images/             photos allégées utilisées par le profil
documents/          PDF téléchargeables depuis le profil
medias/             VOS ORIGINAUX — privé, à ne pas publier
app/                code et styles (carte, profil, app/retro : programmes rétro)
carte/              fond de carte vectoriel (pays, régions, départements)
donnees/lieux.js    noms des villes et régions
```

Fond de carte et noms de lieux : Natural Earth (domaine public). Polices : IBM Plex via Google Fonts (une police système prend le relais hors connexion).
