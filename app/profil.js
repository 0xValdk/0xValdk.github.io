/* Page profil — remplit index.html à partir de mes-sites.js et mon-profil.js.
   Vos textes sont dans mon-profil.js : inutile de modifier ce fichier. */
(function () {
  'use strict';

  // ---------- Projection Web Mercator (identique à l'atlas) ----------
  var W = 1000, H = 968.4658, K = 818.5111359;
  var MY1 = Math.log(Math.tan(Math.PI / 4 + 71.5 * Math.PI / 360));
  function proj(lon, lat) {
    return { x: (lon + 25) * Math.PI / 180 * K, y: (MY1 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) * K };
  }

  // ---------- Configuration & données ----------
  function clean(o) {
    var r = Object.assign({}, o);
    // un texte vide ou fait d'espaces compte comme absent
    Object.keys(r).forEach(function (k) { if (typeof r[k] === 'string') r[k] = r[k].trim(); });
    return r;
  }
  function list(a) { return Array.isArray(a) ? a.filter(Boolean).map(clean) : []; }
  var CFG = clean(Object.assign({ nom: '', fonction: '', theme: 'clair', accent: '#C2410C' }, window.ATLAS_CONFIG || {}));
  var P = clean(Object.assign({ cvSurDemande: true }, window.PROFIL || {}));
  var KK = clean(P.karakuri || {});
  var dark = /^(nuit|dark|sombre)$/i.test(String(CFG.theme));
  var root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.style.setProperty('--accent', CFG.accent);
  root.classList.add('js');

  var SITES = (window.SITES || []).filter(function (s) {
    return s && typeof s.lat === 'number' && typeof s.lon === 'number';
  }).map(function (s) { var c = clean(s); c.p = proj(s.lon, s.lat); return c; });

  function tally(key) {
    var m = {};
    SITES.forEach(function (s) { if (s[key]) m[s[key]] = (m[s[key]] || 0) + 1; });
    return Object.keys(m).map(function (k) { return { name: k, n: m[k] }; })
      .sort(function (a, b) { return b.n - a.n || a.name.localeCompare(b.name, 'fr'); });
  }
  var SECTORS = tally('sector'), COUNTRIES = tally('country');

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function setText(id, txt) { var el = $(id); el.textContent = txt || ''; el.hidden = !txt; }
  var ARROW = '<span aria-hidden="true">↗</span>';
  var LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  // ---------- Accueil ----------
  if (CFG.nom) document.title = [CFG.nom, CFG.fonction].filter(Boolean).join(' — ');
  setText('nom', CFG.nom);
  setText('brand', CFG.nom);
  setText('fonction', CFG.fonction);
  setText('accroche', P.accroche);
  if (P.photo) { $('photo').src = P.photo; $('photo').alt = CFG.nom; $('photo').hidden = false; }

  $('st-sites').textContent = SITES.length;
  $('st-countries').textContent = COUNTRIES.length;
  $('st-sectors').textContent = SECTORS.length;
  $('st-sectors').parentNode.hidden = !SECTORS.length;

  // ---------- Aperçu de la carte ----------
  var mini = $('mini'), layer = $('mini-layer'), dotsEl = $('mini-dots');
  $('mini-base').src = dark ? 'carte/base-dark.svg' : 'carte/base-light.svg';
  $('mini-tag').textContent = 'Carte interactive des interventions';
  var dots = SITES.map(function (s, i) {
    var el = document.createElement('span');
    el.className = 'mini-dot';
    el.style.setProperty('--d', (0.35 + i * 0.035).toFixed(3) + 's');
    dotsEl.appendChild(el);
    return el;
  });
  function layoutMini() {
    var cw = mini.clientWidth, ch = mini.clientHeight;
    if (!cw || !ch) return;
    var pts = SITES.length ? SITES.map(function (s) { return s.p; }) : [proj(-11, 62), proj(33, 35)];
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    var pad = 48;   // marge en pixels autour des sites
    var s = Math.min((cw - pad * 2) / Math.max(x1 - x0, 1), (ch - pad * 2) / Math.max(y1 - y0, 1), 12);
    s = Math.max(s, cw / W, ch / H);
    var tx = Math.min(0, Math.max(cw - W * s, cw / 2 - (x0 + x1) / 2 * s));
    var ty = Math.min(0, Math.max(ch - H * s, ch / 2 - (y0 + y1) / 2 * s));
    layer.style.cssText = 'left:' + tx + 'px;top:' + ty + 'px;width:' + (W * s) + 'px;height:' + (H * s) + 'px';
    SITES.forEach(function (st, i) {
      dots[i].style.transform = 'translate(' + (tx + st.p.x * s).toFixed(1) + 'px,' + (ty + st.p.y * s).toFixed(1) + 'px)';
    });
  }
  layoutMini();
  if (window.ResizeObserver) new ResizeObserver(layoutMini).observe(mini);
  else window.addEventListener('resize', layoutMini);

  // url() CSS pour un chemin d'image : rendue absolue, car une url() passée par variable CSS
  // serait sinon résolue depuis app/profil.css et non depuis la page
  function cssUrl(src) { return 'url("' + new URL(src, document.baseURI).href.replace(/["\\\n]/g, '') + '")'; }

  // ---------- À propos : quatre quadrants ----------
  var AP = P.apropos || {};
  var QI = clean(AP.inge || {}), QM = clean(AP.montagne || {}), QC = clean(AP.charpente || {}), QD = clean(AP.code || {});
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ingé : frise (ligne de cote) et cartouche
  setText('qi-title', QI.titre); setText('qi-sub', QI.sousTitre);
  var frise = list(QI.frise).filter(function (f) { return f.annee || f.label; });
  $('qi-frise').innerHTML = frise.map(function (f) { return '<li><span class="y mono">' + esc(f.annee) + '</span><span class="t">' + esc(f.label) + '</span></li>'; }).join('');
  $('qi-frise').hidden = !frise.length;
  var cart = (QI.cartouche || []).filter(function (r) { return r && r[1]; });
  $('qi-cart').innerHTML = cart.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
  $('qi-cart').hidden = !cart.length;

  // Montagne : fondu enchaîné entre les photos, seulement quand la page est affichée
  setText('qm-title', QM.titre); setText('qm-sub', QM.sousTitre);
  var fiches = list((P.apropos && P.apropos.montagne || {}).fiches).filter(function (f) { return f.sport; });
  $('qm-fiches').innerHTML = fiches.map(function (f) {
    return '<div class="q-fiche"><span class="q-fiche-sport mono">' + esc(f.sport) + '</span>' +
      (f.niveau ? '<span class="q-fiche-niv"><span class="q-fiche-k">Niveau</span> ' + esc(f.niveau) + '</span>' : '') +
      (f.phrase ? '<span class="q-fiche-phrase">« ' + esc(f.phrase) + ' »</span>' : '') + '</div>';
  }).join('');
  $('qm-fiches').hidden = !fiches.length;
  var mPhotos = (QM.photos || []).filter(Boolean), mImgs = [], mDots = [], mCur = 0, mTimer = null;
  mPhotos.forEach(function (src, k) {
    var im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; im.src = src;
    if (!k) im.className = 'on';
    $('qm-photos').appendChild(im); mImgs.push(im);
  });
  if (mPhotos.length > 1) {
    var mDotsEl = document.createElement('div'); mDotsEl.className = 'q-dots'; mDotsEl.setAttribute('aria-hidden', 'true');
    mPhotos.forEach(function (_, k) { var d = document.createElement('i'); if (!k) d.className = 'on'; mDotsEl.appendChild(d); mDots.push(d); });
    $('q-mont').appendChild(mDotsEl);
  }
  function mShow(n) {
    mCur = (n + mImgs.length) % mImgs.length;
    mImgs.forEach(function (im, k) { im.classList.toggle('on', k === mCur); });
    mDots.forEach(function (d, k) { d.classList.toggle('on', k === mCur); });
  }
  function mPlay(on) {
    clearInterval(mTimer); mTimer = null;
    if (on && mImgs.length > 1 && !reduceMotion) mTimer = setInterval(function () { mShow(mCur + 1); }, 4500);
  }
  $('q-mont').hidden = !(QM.titre || mPhotos.length);

  // Charpente : photo de l'ouvrage et cotes
  setText('qc-title', QC.titre); setText('qc-sub', QC.sousTitre);
  if (QC.fond) $('qc-bg').style.setProperty('--img', cssUrl(QC.fond));
  var cotes = list(QC.cotes).filter(function (c) { return c.valeur; });
  $('qc-cotes').innerHTML = cotes.map(function (c) { return '<li><b>' + esc(c.valeur) + '</b><span>' + esc(c.label) + '</span></li>'; }).join('');
  $('qc-cotes').hidden = !cotes.length;
  var habs = (QC.habilitations || []).map(function (x) { return String(x).trim(); }).filter(Boolean);
  $('qc-habs').innerHTML = habs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  $('qc-habs').hidden = !habs.length;
  $('q-charp').hidden = !(QC.titre || cotes.length);

  // Code & IA : projets récents (vidéo + source dans une fenêtre rétro), compétences, puis archives
  setText('qd-title', QD.titre); setText('qd-sub', QD.sousTitre);
  function retro(fn) { return function () { if (window.Retro) fn(window.Retro); }; }
  var projs = list(QD.projets).filter(function (p) { return p.titre; });
  projs.forEach(function (p) {
    var fen = Object.assign({}, p, { titre: p.titre + (p.techno ? ' (' + p.techno + ')' : '') });
    var el = document.createElement('article');
    el.className = 'q-proj';
    el.innerHTML =
      (p.poster && p.video ? '<button type="button" class="q-proj-img"><img src="' + esc(p.poster) + '" alt="" loading="lazy"><span class="go" aria-hidden="true">▶</span></button>' : '') +
      '<div class="q-proj-txt"><h3 class="q-proj-t">' + esc(p.titre) + (p.techno ? ' <span class="mono">' + esc(p.techno) + '</span>' : '') + '</h3>' +
      (p.texte ? '<p class="q-proj-d">' + esc(p.texte) + '</p>' : '') +
      '<div class="q-proj-act">' +
      (p.video ? '<button type="button" class="q-btn mono" data-act="video"><span aria-hidden="true">▶</span> Vidéo</button>' : '') +
      (p.source ? '<button type="button" class="q-btn mono" data-act="src">Source</button>' : '') +
      (p.lien ? '<a class="q-btn mono" href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + esc(p.lienTexte || 'Voir la démo') + ' ↗</a>' : '') +
      '</div></div>';
    var img = el.querySelector('.q-proj-img');
    if (img) { img.setAttribute('aria-label', 'Voir la vidéo : ' + p.titre); img.addEventListener('click', retro(function (R) { R.projet(fen, false); })); }
    el.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', retro(function (R) { R.projet(fen, b.getAttribute('data-act') === 'src'); }));
    });
    $('qd-projs').appendChild(el);
  });
  var skills = (QD.competences || []).map(function (x) { return String(x).trim(); }).filter(Boolean);
  $('qd-skills').innerHTML = skills.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  $('qd-skills').hidden = !skills.length;
  $('qd-now').hidden = !(projs.length || skills.length);

  var progs = list(QD.programmes).filter(function (g) { return g.fichier; });
  setText('qd-arch-k', QD.archivesTitre);
  progs.forEach(function (g) {
    var el = document.createElement('button');
    el.type = 'button'; el.className = 'q-run';
    el.innerHTML = '<span class="go" aria-hidden="true">▶</span><span class="f">' + esc(g.fichier) + '</span><span class="d">' + esc(g.description || '') + '</span>';
    el.setAttribute('aria-label', 'Lancer ' + g.fichier + (g.description ? ' : ' + g.description : ''));
    if (g.description) el.title = g.description;
    el.addEventListener('click', retro(function (R) { R.open(g.app); }));
    $('qd-progs').appendChild(el);
  });
  $('qd-arch').hidden = !progs.length;
  $('q-code').hidden = !(QD.titre || projs.length || progs.length);

  document.addEventListener('page:show', function (e) { mPlay(e.detail === 'a-propos'); });
  $('a-propos').hidden = !(frise.length || mPhotos.length || cotes.length || projs.length || progs.length);

  // ---------- 02 · Karakuri Kaizen ----------
  setText('kk-title', KK.titre);
  setText('kk-intro', KK.intro);
  var steps = list(KK.etapes).filter(function (e) { return e.titre || e.texte; });
  $('kk-steps').innerHTML = steps.map(function (e, i) {
    return '<li><span class="n mono">' + String(i + 1).padStart(2, '0') + '</span>' + (e.titre ? '<h3>' + esc(e.titre) + '</h3>' : '') + (e.texte ? '<p>' + esc(e.texte) + '</p>' : '') + '</li>';
  }).join('');
  $('kk-steps').hidden = !steps.length;
  var figures = list(KK.chiffres).filter(function (c) { return c.valeur; });
  $('kk-figures').innerHTML = figures.map(function (c) { return '<div><dt>' + esc(c.label) + '</dt><dd>' + esc(c.valeur) + '</dd></div>'; }).join('');
  $('kk-figures').hidden = !figures.length;
  var cas = clean(KK.cas || {}), pts = list((KK.cas || {}).points ? KK.cas.points.map(function (x) { return { t: x }; }) : []).filter(function (x) { return x.t; });
  $('kk-case').innerHTML = (cas.titre || cas.texte) ?
    '<div class="case-main"><p class="k mono">Projet</p>' + (cas.titre ? '<h3>' + esc(cas.titre) + '</h3>' : '') + (cas.texte ? '<p>' + esc(cas.texte) + '</p>' : '') + '</div>' +
    (pts.length ? '<ul>' + pts.map(function (x) { return '<li>' + esc(x.t) + '</li>'; }).join('') + '</ul>' : '') : '';
  $('kk-case').hidden = !$('kk-case').innerHTML;
  if (KK.fond) { $('kk-bg').style.setProperty('--img', cssUrl(KK.fond)); $('kk-bg').hidden = false; }
  if (KK.fondBas) { $('kk-bg2').style.setProperty('--img', cssUrl(KK.fondBas)); $('kk-bg2').hidden = false; }
  $('karakuri').hidden = !(KK.titre || KK.intro || steps.length || figures.length || cas.titre);

  // ---------- Productions ----------
  var productions = list(P.productions).filter(function (p) { return p.titre; });
  function action(p) {
    if (p.lien) return '<a class="go" href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + esc(p.lienTexte || 'Voir le document') + ' ' + ARROW + '</a>';
    if (p.note) return '<span class="lock">' + LOCK + esc(p.note) + '</span>';
    return '';
  }
  $('pj-docs').innerHTML = productions.map(function (p, i) {
    var res = String(p.resume || '').trim().split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    return '<li class="doc' + (res.length ? ' has-res' : '') + '"><p class="ctx mono">' + esc(p.contexte) + '</p><div>' +
      // avec un résumé, le titre est le bouton (accessible au clavier) ; aucun bouton visible en plus
      (res.length ? '<h3><button type="button" class="doc-toggle" aria-expanded="false" aria-controls="pj-res-' + i + '">' + esc(p.titre) + '</button></h3>' : '<h3>' + esc(p.titre) + '</h3>') +
      (p.texte ? '<p class="t">' + esc(p.texte) + '</p>' : '') +
      (res.length ? '<div class="resume" id="pj-res-' + i + '"><div>' + res.map(function (x) { return '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</div></div>' : '') +
      '</div><div class="act">' + action(p) + '</div></li>';
  }).join('');
  // un clic sur la ligne (hors lien et hors texte du résumé) déroule ou replie le résumé
  $('pj-docs').addEventListener('click', function (e) {
    var li = e.target.closest('.doc.has-res');
    if (!li || e.target.closest('a') || e.target.closest('.resume')) return;
    var b = li.querySelector('.doc-toggle'), open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    li.classList.toggle('open', open);
  });
  // figure en fond, révélée au clic (un second clic ou un changement de page la ré-estompe)
  var FIG = clean(P.productionsFigure || {}), fig = $('pj-fig');
  if (FIG.image) {
    $('pj-fig-img').src = FIG.image;
    $('pj-fig-num').textContent = 'Fig. 01';
    setText('pj-fig-title', FIG.titre); setText('pj-fig-text', FIG.legende);
    fig.setAttribute('aria-label', 'Afficher la figure' + (FIG.titre ? ' : ' + FIG.titre : ''));
    fig.hidden = false;
    fig.addEventListener('click', function () { fig.setAttribute('aria-pressed', String(fig.getAttribute('aria-pressed') !== 'true')); });
    document.addEventListener('page:show', function (e) { if (e.detail !== 'productions') fig.setAttribute('aria-pressed', 'false'); });
  }
  $('productions').hidden = !productions.length && !FIG.image;

  // ---------- 04 · Ailleurs ----------
  // Au plus un fond et une photo par voyage ; le voyage survolé (ou touché) devient actif.
  // Sans action du visiteur, les voyages défilent seuls ; le survol de la liste met en pause.
  setText('ai-intro', P.ailleursIntro);
  var trips = list(P.voyages).filter(function (v) { return v.pays; });
  var bgs = [], pics = [], items = [], resEls = [];
  trips.forEach(function (v, i) {
    if (v.fond) {
      var bg = document.createElement('div');
      bg.className = 'away-bg';
      bg.style.setProperty('--img', cssUrl(v.fond));
      $('ai-bgs').appendChild(bg);
      bgs[i] = bg;
    }
    if (v.photo) {
      var img = document.createElement('img');
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.src = v.photo;
      $('ai-photos').appendChild(img);
      pics[i] = img;
    }
    var li = document.createElement('li');
    li.innerHTML = '<button class="away-item" type="button" aria-pressed="false"><span class="away-year mono">' + esc(v.periode) + '</span>' +
      '<span class="away-name">' + esc(v.pays) + '</span>' + (v.texte ? '<span class="away-text">' + esc(v.texte) + '</span>' : '') + '</button>';
    var btn = li.firstChild;
    if (v.fond) btn.style.setProperty('--img', cssUrl(v.fond));   // bandeau sur téléphone
    // résumé facultatif, déroulé sous le pays au clic
    var res = String(v.resume || '').trim().split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (res.length) {
      var rd = document.createElement('div');
      rd.className = 'away-res'; rd.id = 'ai-res-' + i;
      rd.innerHTML = '<div>' + res.map(function (x) { return '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</div>';
      li.appendChild(rd);
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', rd.id);
      resEls[i] = rd;
    }
    // tant qu'un résumé est déroulé, le survol des autres pays ne change plus rien (seul le clic agit)
    btn.addEventListener('mouseenter', function () { if (aiOpen < 0) setTrip(i); });
    btn.addEventListener('focus', function () { if (aiOpen < 0) setTrip(i); });
    btn.addEventListener('click', function () { setTrip(i); if (resEls[i]) openRes(aiOpen === i ? -1 : i); });
    $('ai-list').appendChild(li);
    items[i] = btn;
  });
  var AI_DELAY = 7000;   // temps entre deux voyages, en millisecondes (7000 = 7 s)
  var aiCur = 0, aiTimer = null, aiHere = false, aiHold = false, aiOpen = -1;
  // un seul résumé ouvert à la fois ; tant qu'il l'est, le défilement automatique s'arrête
  function openRes(n) {
    aiOpen = n;
    $('ai-list').classList.toggle('has-open', n >= 0);
    resEls.forEach(function (r, i) {
      if (!r) return;
      r.parentNode.classList.toggle('res-open', i === n);
      items[i].setAttribute('aria-expanded', String(i === n));
    });
    aiSchedule();
  }
  function setTrip(n) {
    if (aiOpen >= 0 && aiOpen !== n) openRes(-1);
    aiCur = n;
    trips.forEach(function (v, i) {
      var on = i === n;
      items[i].classList.toggle('on', on);
      items[i].setAttribute('aria-pressed', String(on));
      if (bgs[i]) bgs[i].classList.toggle('on', on);
      if (pics[i]) pics[i].classList.toggle('on', on);
    });
  }
  // défilement automatique : uniquement page affichée, liste non survolée, écran assez large
  function aiSchedule() {
    clearTimeout(aiTimer);
    if (!aiHere || aiHold || aiOpen >= 0 || trips.length < 2 || !window.matchMedia('(min-width: 641px)').matches) return;
    aiTimer = setTimeout(function () { setTrip((aiCur + 1) % trips.length); aiSchedule(); }, AI_DELAY);
  }
  var aiList = $('ai-list');
  function aiPause(on) { aiHold = on; aiSchedule(); }
  aiList.addEventListener('mouseenter', function () { aiPause(true); });
  aiList.addEventListener('mouseleave', function () { aiPause(false); });
  aiList.addEventListener('focusin', function () { aiPause(true); });
  aiList.addEventListener('focusout', function (e) { if (!aiList.contains(e.relatedTarget)) aiPause(false); });
  document.addEventListener('page:show', function (e) {
    aiHere = e.detail === 'ailleurs';
    if (!aiHere && aiOpen >= 0) openRes(-1); else aiSchedule();
  });
  if (trips.length) setTrip(0);
  $('ailleurs').hidden = !trips.length;

  // ---------- 05 · Contact ----------
  var ICONS = {
    in: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.35h-4v-4.74c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.23-1.82 2.5v4.83h-4z"/></svg>',
    tel: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    cv: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };
  setText('c-title', P.contactTitre);
  if (P.email) {
    $('c-mail').href = 'mailto:' + P.email;
    $('c-mail').innerHTML = esc(P.email) + ARROW;
    $('c-mail').hidden = false;
  }
  var links = [];
  if (P.linkedin) {
    var li = /^https?:\/\//i.test(P.linkedin) ? P.linkedin : 'https://' + P.linkedin;
    links.push('<a href="' + esc(li) + '" target="_blank" rel="noopener">' + ICONS.in + 'LinkedIn</a>');
  }
  if (P.telephone) links.push('<a href="tel:' + esc(P.telephone.replace(/[^\d+]/g, '')) + '">' + ICONS.tel + esc(P.telephone) + '</a>');
  if (P.localisation) links.push('<span>' + ICONS.pin + esc(P.localisation) + '</span>');
  // CV sur demande : un clic ouvre un e-mail prérempli ; sans adresse, simple mention
  if (P.cvSurDemande && P.email) {
    var cvHref = 'mailto:' + P.email + '?subject=' + encodeURIComponent(P.cvObjet || 'Demande de CV') +
      (P.cvMessage ? '&body=' + encodeURIComponent(P.cvMessage) : '');
    links.push('<a class="c-cv" href="' + esc(cvHref) + '">' + ICONS.cv + 'Demander mon CV</a>');
  }
  $('c-links').innerHTML = links.join('');
  $('c-note').textContent = P.cvSurDemande && !P.email ? 'CV disponible sur demande' : '';
  var hasContact = P.email || P.linkedin || P.telephone;
  $('contact').hidden = !hasContact;
  $('cta-contact').hidden = !hasContact;

  $('copy').textContent = '© ' + new Date().getFullYear() + (CFG.nom ? ' ' + CFG.nom : '');

  // ---------- Pages ----------
  // Une page par section visible ; adresse de la forme #/karakuri (sans ancre réelle,
  // pour que le navigateur ne tente jamais de faire défiler la scène).
  var stage = $('stage'), pages = [], cur = -1, lockUntil = 0;
  document.querySelectorAll('.page').forEach(function (pg) { if (!pg.hidden) pages.push(pg); });
  var names = pages.map(function (pg) { return pg.dataset.nav || 'Accueil'; });

  var navHtml = [];
  pages.forEach(function (pg, i) {
    pg.tabIndex = -1;
    if (!pg.dataset.nav) return;
    navHtml.push('<a href="#/' + pg.id + '" data-i="' + i + '">' + esc(pg.dataset.nav) + '</a>');
    pg.querySelector('.sec-num').textContent = String(i).padStart(2, '0');
  });
  $('nav-links').innerHTML = navHtml.join('');
  // bouton « Menu » (petits écrans) : déroule la liste des pages
  var menuBtn = $('nav-menu'), navLinks = $('nav-links');
  function menu(open) { navLinks.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); }
  menuBtn.addEventListener('click', function () { menu(!navLinks.classList.contains('open')); });
  navLinks.addEventListener('click', function () { menu(false); });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.nav')) menu(false); });

  function indexOfHash() {
    var id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return i;
    return 0;
  }

  // dir < 0 : arrivée par le bas (retour arrière à la molette)
  function go(n, opts) {
    opts = opts || {};
    n = Math.max(0, Math.min(pages.length - 1, n));
    if (n === cur) return;
    var first = cur < 0;
    pages.forEach(function (pg, i) {
      pg.classList.toggle('instant', first);
      pg.classList.toggle('on', i === n);
      pg.classList.toggle('past', i < n);
      pg.style.zIndex = i;
      pg.inert = i !== n;
      pg.setAttribute('aria-hidden', String(i !== n));
    });
    var pg = pages[n];
    pg.scrollTop = opts.fromBelow ? pg.scrollHeight : 0;
    stage.scrollLeft = 0;
    cur = n;
    if (!first) lockUntil = Date.now() + 850;
    if (first) requestAnimationFrame(function () { pages.forEach(function (p) { p.classList.remove('instant'); }); });

    var url = location.pathname + location.search + (n ? '#/' + pg.id : '');
    if (!opts.fromHash) try { history.replaceState(null, '', url); } catch (err) { /* fichier ouvert en local */ }
    document.title = (n ? names[n] + ' · ' : '') + baseTitle;
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var on = +a.dataset.i === n;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('prog').style.setProperty('--p', pages.length > 1 ? n / (pages.length - 1) : 1);
    if (!first && opts.focus !== false) pg.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('page:show', { detail: pg.id }));
  }
  var baseTitle = document.title;

  // liens internes (#/page) : navigation sans saut d'ancre
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute('href').replace(/^#\/?/, '');
    var n = 0;
    pages.forEach(function (pg, i) { if (pg.id === id) n = i; });
    go(n);
  });
  window.addEventListener('hashchange', function () { go(indexOfHash(), { fromHash: true }); });

  // molette : la page défile d'abord ; arrivée en bout, un cran de plus change de page
  var acc = 0, accT = 0;
  stage.addEventListener('wheel', function (e) {
    if (e.ctrlKey || !pages.length) return;
    var d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (e.deltaMode === 1) d *= 16;
    var now = Date.now();
    if (now < lockUntil) {               // transition en cours ou inertie du pavé tactile
      e.preventDefault();
      lockUntil = Math.max(lockUntil, now + 160);
      return;
    }
    var pg = pages[cur];
    var atEnd = pg.scrollTop + pg.clientHeight >= pg.scrollHeight - 2, atStart = pg.scrollTop <= 1;
    if ((d > 0 && !atEnd) || (d < 0 && !atStart)) { acc = 0; return; }   // défilement normal
    e.preventDefault();
    if (now - accT > 300) acc = 0;
    accT = now; acc += d;
    if (Math.abs(acc) >= 40) { acc = 0; go(cur + (d > 0 ? 1 : -1), { fromBelow: d < 0, focus: false }); }
  }, { passive: false });

  // clavier : ← → et Page préc./suiv. en bout de page
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(e.target.tagName)) return;
    if (document.documentElement.classList.contains('rw-open')) return;   // une fenêtre rétro a la main
    var pg = pages[cur];
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'PageDown' && pg.scrollTop + pg.clientHeight >= pg.scrollHeight - 2) { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'PageUp' && pg.scrollTop <= 1) { e.preventDefault(); go(cur - 1, { fromBelow: true }); }
  });

  // tactile : glissement horizontal franc
  var t0 = null;
  stage.addEventListener('touchstart', function (e) { t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!t0) return;
    var dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y;
    t0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
  });

  go(indexOfHash(), { fromHash: true });
})();
