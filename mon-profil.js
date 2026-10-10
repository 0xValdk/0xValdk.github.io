/* =====================================================================
   MON PROFIL — textes et médias de la page d'accueil (index.html).
   Le nom, la fonction, le thème et la couleur viennent de mes-sites.js
   (ATLAS_CONFIG) : ils sont partagés avec l'atlas.

   Comme pour les sites : un champ vide ('') ou une liste vide ([]) n'est
   jamais affiché ; une section entièrement vide disparaît du menu.
   Apostrophes : écrivez ’ ou \'.  Nouveau paragraphe : \n\n

   Images : utilisez les versions allégées du dossier images/ (jamais
   medias/, qui contient vos originaux, votre CV et vos lettres).
   ===================================================================== */

window.PROFIL = {

  /* ---------------- Accueil ---------------- */

  // Une phrase sous votre nom
  accroche: 'J’interviens sur les sites de production, de l’automobile à l’aéronautique, partout en Europe.',

  // Photo de profil (version recadrée et allégée de medias/pf.jpg)
  photo: 'images/profil.jpg',

  /* ---------------- 01 · À propos : quatre facettes ----------------
     Un quadrant par facette ; un champ vide n'est pas affiché. */
  apropos: {

    // Ingé : un « plan coté » ; la frise est la ligne de cote, le cartouche résume le diplôme
    inge: {
      titre: 'Ingénieur',
      sousTitre: 'Généraliste, formé en alternance, construit sur le terrain.',
      frise: [
        { annee: '2013', label: 'DUT Génie mécanique' },
        { annee: '2015', label: 'ICAM, en alternance chez Équip’Aéro' },
        { annee: '2018', label: 'Diplômé, puis un an au Japon' },
        { annee: '2020', label: 'AIO : conception, mise en service' },
        { annee: '2022', label: 'DEISHII : déploiement, formation' },
        { annee: '2023', label: 'Indépendant' },
        { annee: '2025', label: 'Charpente' }
      ],
      cartouche: [
        ['Titre', 'Ingénieur généraliste'],
        ['École', 'ICAM Toulouse'],
        ['Promo', '2018'],
        ['Échelle', '1:1']
      ]
    },

    // Montagne : photos en fondu enchaîné, sans autre texte que le titre
    montagne: {
      titre: 'Montagne',
      sousTitre: 'Escalade · Snowboard',
      photos: ['images/a-propos/poudreuse.jpg', 'images/a-propos/saut.jpg', 'images/voyages/bresil-escalade.jpg']
    },

    // Charpente : une photo de chantier, des cotes (ce qui se mesure) et les habilitations
    charpente: {
      titre: 'Charpente',
      sousTitre: 'Formé en 2024 – 2025, pratiquée sur chantier.',
      fond: 'images/projets/charpente.jpg',
      cotes: [
        { valeur: '10+', label: 'chantiers de surélévation' },
        { valeur: 'Bois + acier', label: 'charpente traditionnelle et métallique' }
      ],
      habilitations: ['CACES R482', 'SST', 'AIPR', 'Travail en hauteur', 'Échafaudage de pied']
    },

    // Code & IA : un terminal ; chaque programme s'ouvre dans une fenêtre rétro
    code: {
      titre: 'Code & IA',
      sousTitre: 'Pre-AI fun projects',
      programmes: [
        { app: 'snake',  fichier: 'PySnake.py',  description: 'un Snake, ses skins et son top 10' },
        { app: 'shader', fichier: 'PyShader.py', description: 'le nuancier des couleurs Tk' },
        { app: 'fract',  fichier: 'PyFract.py',  description: 'Mandelbrot et Julia' }
      ],
      aujourdhui: 'Aujourd’hui : Python, agents IA, automatisation de la documentation technique.'
    }
  },

  /* ---------------- 02 · Karakuri Kaizen ---------------- */

  karakuri: {
    titre: 'Automatiser sans énergie.',
    intro: 'Le Karakuri Kaizen® est une démarche d’amélioration continue née au Japon : automatiser la manutention avec des mécanismes simples (gravité, ressorts, leviers, contrepoids), le plus souvent sans aucune énergie. Les postes deviennent plus sûrs et moins pénibles, et les équipes peuvent les comprendre, les régler et les faire évoluer elles-mêmes.',

    // Votre façon de travailler, en quelques étapes
    etapes: [
      { titre: 'Observer',    texte: 'Sur la ligne, avec les opérateurs : comprendre les problèmes de poste et de qualité, remonter aux causes racines.' },
      { titre: 'Concevoir',   texte: 'Avec la production, les méthodes et la R&D : layout, mécanismes en CAO (SolidWorks), prototypes.' },
      { titre: 'Installer',   texte: 'Montage, réglage et mise en service sur site, avec des équipes de 2 à 4 techniciens.' },
      { titre: 'Transmettre', texte: 'Formation des opérateurs, modes opératoires et standards, pour que la solution tienne dans le temps.' }
    ],

    chiffres: [
      { valeur: '30 %',  label: 'de temps d’opération en moins, en moyenne' },
      { valeur: 'Zéro',  label: 'port de charge sur les postes traités' },
      { valeur: '~100',  label: 'opérateurs formés' }
    ],

    // Un projet raconté en quelques lignes
    cas: {
      titre: 'Renault Douai · ligne de véhicules électriques',
      texte: 'Salarié d’AIO, détaché à temps plein sur le site : avec un homologue, nous avons équipé en robots passifs une nouvelle ligne d’assemblage en six mois, de la conception à l’installation.',
      points: ['2 boucles logistiques autonomes', '60 servantes de bord de ligne, en 6 modèles', 'Une centaine de chariots de kitting']
    },

    // Photos de terrain en demi-fond, fondues dans la page :
    // fond = en haut à droite, derrière le titre ; fondBas = en bas à gauche, derrière les chiffres
    fond: 'images/karakuri/rouleaux.jpg',
    fondBas: 'images/karakuri/liaison.jpg'
  },

  /* ---------------- 03 · Productions ----------------
     lien : PDF à télécharger (dossier documents/).
     note : remplace le lien, ex. pour un rapport confidentiel. */
  productions: [
    {
      titre: 'Mezzanine pour les ateliers couvreurs',
      contexte: 'Innovista · Toulouse · 2024 – 2025',
      texte: 'Chef de projet d’un ouvrage en charpente traditionnelle : cahier des charges, modèle 3D, calcul des charges, taille des bois, levage et pose.',
      lien: 'documents/mezzanine-couvreurs.pdf', lienTexte: 'Dossier technique (PDF)'
    },
    {
      titre: 'Protection cathodique par courant imposé',
      contexte: 'Dalhousie University · Halifax, Canada · 2018',
      texte: 'Stage de recherche : revêtements d’anode, mesures de résistivité et protocole expérimental pour évaluer l’efficacité de la protection.',
      lien: 'documents/protection-cathodique.pdf', lienTexte: 'Article (PDF, anglais)'
    },
    {
      titre: 'Capteurs de gaz à base de V₂O₅',
      contexte: 'Institut de Physique de São Carlos · Brésil · 2016',
      texte: 'Synthèse de films nanostructurés et mesure de leur résistivité selon la température et l’atmosphère, pour la détection de gaz toxiques.',
      note: 'Rapport confidentiel'
    },
    {
      titre: 'Transfert d’un atelier d’essais aéronautiques',
      contexte: 'Équip’Aéro Services · alternance · 2018',
      texte: 'Étude d’avant-projet : enveloppe budgétaire, planning, analyse des risques et cahiers des charges pour réimplanter une activité d’essais hydrauliques.',
      note: 'Rapport confidentiel'
    }
  ],

  // Figure en fond de la page Productions : estompée, elle s'affiche en entier au clic
  // (de préférence une image détourée sur fond blanc)
  productionsFigure: {
    image: 'images/projets/drone.jpg',
    titre: 'Drone quadrirotor',
    legende: 'Conçu et réalisé sur mon temps libre.'
  },

  /* ---------------- 04 · Ailleurs ----------------
     Au plus : un fond (grande image assombrie derrière la liste) et une photo
     (vignette à droite) par voyage. Au survol d'un pays, son fond et sa photo
     apparaissent ; sur téléphone, seul le fond est affiché, en bandeau. */
  ailleursIntro: 'Trois stages à l’étranger, une année au Japon et quelques voyages : apprendre à travailler, et à vivre, dans une autre langue.',
  voyages: [
    { pays: 'Angleterre', periode: '2015', texte: 'Stage chez Zodiac Interconnect, Slough.',
      fond: 'images/voyages/england-bridge.jpg', photo: 'images/voyages/england-guard.jpg' },
    { pays: 'Brésil', periode: '2016', texte: 'Stage de recherche à l’Institut de Physique de São Carlos.',
      fond: 'images/voyages/bresil-forest.jpg', photo: 'images/voyages/bresil-escalade.jpg' },
    { pays: 'Canada', periode: '2018', texte: 'Stage de recherche à Dalhousie University, Halifax.',
      fond: 'images/voyages/canada-plage.jpg', photo: 'images/voyages/canada-baie.jpg' },
    { pays: 'Japon', periode: '2018 – 2019', texte: 'Un an de vie et de travail.',
      fond: 'images/voyages/japon-cote.jpg', photo: 'images/voyages/japon-auto-stop.jpg' },
    { pays: 'Thaïlande', periode: '2019', texte: 'Voyage.',
      fond: 'images/voyages/thailand-island.jpg', photo: 'images/voyages/thailand-white-statue.jpg' },
    { pays: 'Grèce', periode: '2020', texte: 'Voyage.',
      fond: 'images/voyages/grece-paint.jpg', photo: 'images/voyages/grece-thinker.jpg' }
  ],

  /* ---------------- 05 · Contact ---------------- */

  // Coordonnées : seules celles renseignées apparaissent
  email: 'valentin.thiers@gmail.com',
  linkedin: 'https://www.linkedin.com/in/valentin-thiers-3a17b9a3',
  telephone: '+33 7 68 63 18 63',
  localisation: '',        // ex. 'Toulouse · mobile en France et en Europe'

  // Titre de la section contact
  contactTitre: 'Un poste, une mission ? Parlons-en.',

  // Affiche la mention « CV disponible sur demande »
  cvSurDemande: true
};
