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
      photos: ['images/a-propos/poudreuse.jpg', 'images/a-propos/saut.jpg', 'images/voyages/bresil-escalade.jpg'],
      // petites fiches posées sur la photo (une par sport)
      fiches: [
        { sport: 'Escalade', niveau: '6b+ en tête · 6c en bloc', phrase: 'Pas d’bras, pas d’6a. Pas d’pieds, pas d’6b !' },
        { sport: 'Snowboard', niveau: 'Tout terrain', phrase: 'Cette année, c’est le backflip !' }
      ]
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
      aujourdhui: 'Aujourd’hui : JavaScript, agents IA, automatisation.'
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
     note : remplace le lien, ex. pour un rapport confidentiel.
     resume : résumé / abstract, déroulé au clic sur la ligne (vide = pas de résumé).
              Nouveau paragraphe : \n\n */
  productions: [
    {
      titre: 'Mezzanine pour les ateliers couvreurs',
      contexte: 'Innovista · Toulouse · 2024 – 2025',
      texte: 'Chef de projet d’un ouvrage en charpente traditionnelle : cahier des charges, planification des travaux et répartition des équipes, modélisation 3D, calcul des charges, taille des bois, levage et pose.',
      lien: 'documents/mezzanine-couvreurs.pdf', lienTexte: 'Dossier technique (PDF)',
      resume: 'La mezzanine, destinée à augmenter la surface des ateliers des apprentis couvreurs, a été conçue et réalisée selon un cahier des charges précis, prenant en compte les contraintes de l’existant, les attentes du client. L’objectif principal était d’obtenir une structure à la fois robuste et fonctionnelle. En tant que chef de projet, cette expérience m’a permis de mobiliser les compétences techniques et humaines acquises au cours de ma formation.'
    },
    {
      titre: 'Protection cathodique par courant imposé',
      contexte: 'Dalhousie University · Halifax, Canada · 2018',
      texte: 'Stage de recherche : revue bibliographique, élaboration du protocole expérimental, préparation des revêtements d’anode et mesures de résistivité pour évaluer l’efficacité de la protection cathodique et analyser les résultats.',
      lien: 'documents/protection-cathodique.pdf', lienTexte: 'Article (PDF, anglais)',
      resume: 'Dans le but de mieux comprendre le comportement des systèmes de protection cathodique par courant imposé utilisant un revêtement anodique, des échantillons de métal à protéger ont été préparés et exposés à un milieu corrosif. Différentes mixtures de revêtement anodique ont été testés afin d’obtenir le meilleur compromis entre les propriétés mécaniques et électriques. La résistivité de ces revêtements a été mesurée à l’aide de différentes méthodes. Par la suite, une méthode expérimentale a été mise au point afin de mesurer l’efficacité de la protection cathodique et de déterminer les meilleurs paramètres électriques. Les avantages de cette méthode de protection ont été soulignés et son application dans l’industrie évaluée.'
    },
    {
      titre: 'Capteurs de gaz à base de V₂O₅',
      contexte: 'Institut de Physique de São Carlos · Brésil · 2016',
      texte: 'Stage de recherche : étude de l’influence des conditions de synthèse sur les propriétés de détection de gaz toxiques de films nanostructurés, par mesure de leur résistivité selon la température et l’atmosphère.',
      note: 'Rapport confidentiel',
      resume: 'Dans le but de caractériser le comportement électrique de films nanostructurés de pentoxyde de vanadium (V₂O₅·nH₂O) destinés à la détection de gaz, différentes analyses ont été réalisées afin d’étudier leur composition et leur morphologie. La résistance électrique des échantillons a ensuite été mesurée en fonction de la température et des conditions atmosphériques. Les résultats obtenus ont permis de constituer une base de données destinée à améliorer la compréhension des propriétés du matériau et à contribuer à la modélisation de son comportement en vue de son application dans des capteurs de gaz.'
    },
    {
      titre: 'Transfert d’un atelier d’essais de composants aéronautiques',
      contexte: 'Équip’Aéro Services · alternance · 2018',
      texte: 'Étude d’avant-projet : enveloppe budgétaire, planning, analyse des risques et cahiers des charges pour réimplanter une activité d’essais hydrauliques.',
      note: 'Rapport confidentiel',
      resume: 'Dans le cadre du transfert de l’activité Skydrol d’EQUIP’AERO SERVICES, une étude d’avant-projet a été menée afin d’évaluer la faisabilité de la réimplantation des moyens d’essais dans de nouveaux locaux. L’objectif était d’améliorer l’ergonomie, la sécurité et la performance de l’atelier, tout en centralisant les moyens d’essais et en réduisant les déplacements des équipes. Cette étude a porté sur la définition des besoins, l’élaboration des cahiers des charges, l’estimation budgétaire, la planification prévisionnelle et l’identification des risques, afin de fournir aux décisionnaires les éléments nécessaires à la prise de décision.'
    }
  ],

  // Figure en fond de la page Productions : estompée, elle s'affiche en entier au clic
  // (de préférence une image détourée sur fond blanc)
  productionsFigure: {
    image: 'images/projets/drone.jpg',
    titre: 'Drone quadrirotor · 2015',
    legende: 'Conçu et fabriqué sur mon temps libre.\nAltimètre : N/A\nGyroscope : N/A\nGPS : N/A\nCaméra : Optionnelle\nFormation du pilote : 0h\nEssais en vol : 6 réussis\nCrash : vol n°7\nStatut : bon pour destruction'
  },

  /* ---------------- 04 · Ailleurs ----------------
     Au plus : un fond (grande image assombrie derrière la liste) et une photo
     (vignette à droite) par voyage. Au survol d'un pays, son fond et sa photo
     apparaissent ; sur téléphone, seul le fond est affiché, en bandeau.
     resume : texte déroulé au clic sur le pays (vide = rien ne se déroule).
              Nouveau paragraphe : \n\n */
  ailleursIntro: 'Trois stages à l’étranger, une année au Japon et quelques voyages : apprendre à travailler et à vivre dans une autre culture.',
  voyages: [
    { pays: 'Angleterre', periode: '2015', texte: 'Stage chez Zodiac Interconnect, Slough.',
      fond: 'images/voyages/england-bridge.jpg', photo: 'images/voyages/england-guard.jpg',
      resume: 'Mon premier voyage à l’étranger, à 20 ans. Pendant trois mois, j’ai vécu dans une ville pavillonnaire entre Londres et Windsor. J’étais parti avec un objectif en tête : apprendre l’anglais pour pouvoir, un jour, aller plus loin, partir plus longtemps et découvrir le monde par moi-même.' },
    { pays: 'Brésil', periode: '2016', texte: 'Stage de recherche à l’Institut de Physique de São Carlos.',
      fond: 'images/voyages/bresil-forest.jpg', photo: 'images/voyages/bresil-escalade.jpg',
      resume: 'Mon premier voyage hors du continent européen : le grand saut, seul. Il a fallu trouver mes repères dans une nouvelle ville, me débrouiller dans une autre langue et apprivoiser un quotidien dont les codes m’étaient étrangers. Entre la découverte du Brésil, les rencontres en tout genre et l’exploration d’une autre culture, cette expérience m’a appris à sortir de mes habitudes et à me sentir à l’aise dans l’inconnu. J’en suis revenu plus autonome, plus confiant et animé d’une curiosité grandissante pour les autres, leurs façons de penser et les différentes manières d’appréhender le monde.' },
    { pays: 'Canada', periode: '2018', texte: 'Stage de recherche à Dalhousie University, Halifax.',
      fond: 'images/voyages/canada-plage.jpg', photo: 'images/voyages/canada-baie.jpg',
      resume: 'Six mois qui ont marqué l’aboutissement de mes études, mais surtout une forme de consécration personnelle. J’y ai découvert un monde sans frontières à mes yeux, où je pouvais trouver ma place bien au-delà de la France. Entre la sérénité des paysages, la douceur du quotidien et les longues conversations avec des personnes venues des quatre coins du monde, j’ai découvert la richesse des liens qui se tissent lorsqu’on prend le temps de se connaître. Certaines de ces amitiés m’ont profondément marqué, m’apprenant à écouter, à partager et à m’ouvrir davantage aux autres. Je suis reparti avec la conviction que le monde m’était accessible, et que je pouvais déployer mes ailes bien plus loin que je ne l’avais imaginé.' },
    { pays: 'Japon', periode: '2018 – 2019', texte: 'Un an de vie et de travail.',
      fond: 'images/voyages/japon-cote.jpg', photo: 'images/voyages/japon-auto-stop.jpg',
      resume: 'Presque un an au Japon, initialement parti pour suivre quelqu’un, finalement resté pour moi-même. Ce qui devait être un séjour à deux s’est transformé en une aventure faite de détours, de rencontres et de changements de cap. Serveur dans une station de ski à Niseko, ouvrier dans une ferme de coquilles Saint-Jacques, employé dans une auberge de jeunesse à Kyoto… J’ai traversé le pays au gré des opportunités, parfois à vélo, sans toujours savoir quelle serait la prochaine étape. Entre deux emplois, j’ai aussi pris le temps d’explorer la Thaïlande, puis de découvrir le Japon au fil des régions et des rencontres. Je suis venu avec une idée en tête, mais c’est tout ce que je n’avais pas prévu qui a fait la richesse de ce voyage.' },
    { pays: 'Thaïlande', periode: '2019', texte: 'Voyage.',
      fond: 'images/voyages/thailand-island.jpg', photo: 'images/voyages/thailand-white-statue.jpg',
      resume: 'Une exploration du pays entre amis venus des quatre coins du monde.' },
    { pays: 'Grèce', periode: '2020', texte: 'Voyage.',
      fond: 'images/voyages/grece-paint.jpg', photo: 'images/voyages/grece-thinker.jpg',
      resume: 'Un voyage improvisé, sans itinéraire ni contraintes, au gré du vent.' }
  ],

  /* ---------------- 05 · Contact ---------------- */

  // Coordonnées : seules celles renseignées apparaissent
  email: 'valentin.thiers@gmail.com',
  linkedin: 'https://www.linkedin.com/in/valentin-thiers-3a17b9a3',
  telephone: '+33 7 68 63 18 63',
  localisation: '',        // ex. 'Toulouse · mobile en France et en Europe'

  // Titre de la section contact
  contactTitre: 'Un poste, une mission ?\nParlons-en.',

  // Bouton « Demander mon CV » : ouvre un e-mail prérempli (objet et message ci-dessous)
  cvSurDemande: true,
  cvObjet: 'Demande de CV',
  cvMessage: 'Bonjour Valentin,\n\nPourriez-vous m’envoyer votre CV ?\n\nCordialement,'
};
