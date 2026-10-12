/* Fenêtres rétro (façon Windows 98 / Tkinter) et portages JavaScript fidèles de trois
   programmes Python d'origine : PySnake, PyShader et PyFract (code dans medias/dev).
   Ouverture : Retro.open('snake' | 'shader' | 'fract').
   Projet récent (vidéo + source VBA) : Retro.projet(p, afficherSource). */
(function () {
  'use strict';

  var TK = window.TK_COLORS || {};
  function tk(name) { return TK[name] || name; }

  // ---------- Petits utilitaires ----------
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hiDPI(canvas, w, hgt) {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * r; canvas.height = hgt * r;
    var ctx = canvas.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
    return ctx;
  }
  // rectangle Tk : remplissage + contour noir d'1 px, coordonnées incluses
  function tkRect(ctx, x0, y0, x1, y1, fill, outline) {
    ctx.fillStyle = tk(fill); ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    ctx.strokeStyle = tk(outline || 'black'); ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
  }

  // ---------- Widgets façon Tk ----------
  function label(text, cls) { return h('div', { class: 'tk-label' + (cls ? ' ' + cls : ''), text: text }); }
  function button(text, fn, cls) { return h('button', { type: 'button', class: 'tk-btn' + (cls ? ' ' + cls : ''), text: text, onclick: fn }); }
  function entry(value) { return h('input', { type: 'text', class: 'tk-entry', value: value || '', spellcheck: 'false', autocomplete: 'off' }); }

  // ---------- Gestionnaire de fenêtres ----------
  var layer, Z = 1000, wins = [];
  var CLOSE = '<svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true"><path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z" fill="currentColor"/></svg>';

  function front(w) {
    w.el.style.zIndex = ++Z;
    wins.forEach(function (o) { o.el.classList.toggle('active', o === w); });
  }

  function place(w, o) {
    var el = w.el, vw = window.innerWidth, vh = window.innerHeight;
    var ww = el.offsetWidth, wh = el.offsetHeight, x, y;
    if (o.at) { x = o.at.x; y = o.at.y; }
    else if (o.parent && o.parent.el.isConnected) {
      var r = o.parent.el.getBoundingClientRect(); x = r.left + 36; y = r.top + 48;
    } else {
      var n = wins.filter(function (v) { return !v.parent && v !== w; }).length;
      x = (vw - ww) / 2 + n * 32; y = Math.max(8, Math.min(76, vh - wh - 8), (vh - wh) / 2) + n * 32;
    }
    el.style.left = Math.round(Math.max(4, Math.min(x, vw - ww - 4))) + 'px';
    el.style.top = Math.round(Math.max(4, Math.min(y, vh - Math.min(wh, vh - 8) - 4))) + 'px';
  }

  function win(o) {
    if (!layer) { layer = h('div', { class: 'rw-layer' }); document.body.appendChild(layer); }
    var w = { parent: o.parent || null, kids: [] };
    var name = h('span', { class: 'rw-name', text: o.title });
    var tbs = h('div', { class: 'rw-tbs' });
    var bar = h('div', { class: 'rw-title' }, [h('span', { class: 'rw-ico', 'aria-hidden': 'true' }), name, tbs]);
    var el = h('div', { class: 'rw' + (o.cls ? ' ' + o.cls : '') + (o.parent ? ' rw-child' : ''), role: 'dialog', 'aria-label': o.title }, [bar]);
    w.el = el;

    if (o.source) {
      var bsrc = h('button', { type: 'button', class: 'rw-tb rw-tb-src', text: 'Source', title: o.sourceTitle || 'Voir le code Python d’origine', 'aria-pressed': 'false' });
      tbs.appendChild(bsrc);
    }
    tbs.appendChild(h('button', { type: 'button', class: 'rw-tb', 'aria-label': 'Fermer', html: CLOSE, onclick: function () { close(w); } }));

    if (o.menu) el.appendChild(menuBar(o.menu));
    w.body = h('div', { class: 'rw-body' });
    el.appendChild(w.body);
    if (o.status != null) {
      w.statusEl = h('span', { text: o.status });
      el.appendChild(h('div', { class: 'rw-status' }, [w.statusEl]));
    }
    w.status = function (t) { if (w.statusEl) w.statusEl.textContent = t; };
    if (o.source) {
      var sp = sourcePanel(o.source, function () { toggleSrc(false); });
      el.appendChild(sp);
      var toggleSrc = function (on) {
        el.classList.toggle('show-src', on);
        bsrc.setAttribute('aria-pressed', String(on));
        bsrc.textContent = on ? (o.sourceBack || 'Programme') : 'Source';
        if (o.onSource) o.onSource(on);
      };
      bsrc.addEventListener('click', function () { toggleSrc(!el.classList.contains('show-src')); });
      w.showSource = toggleSrc;
      if (o.showSource) toggleSrc(true);
    }

    w.onClose = o.onClose;
    w.close = function () { close(w); };
    w.front = function () { front(w); };
    w.setTitle = function (t) { name.textContent = t; };
    if (w.parent) w.parent.kids.push(w);
    wins.push(w);
    layer.appendChild(el);
    document.documentElement.classList.add('rw-open');
    // placée une fois son contenu ajouté (juste après le retour de win())
    el.style.visibility = 'hidden';
    Promise.resolve().then(function () { place(w, o); el.style.visibility = ''; });
    front(w);
    el.addEventListener('pointerdown', function () { front(w); });

    // déplacement par la barre de titre
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || window.matchMedia('(max-width: 640px)').matches) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      bar.setPointerCapture(e.pointerId);
      function move(ev) {
        el.style.left = Math.max(-el.offsetWidth + 80, Math.min(window.innerWidth - 80, ox + ev.clientX - sx)) + 'px';
        el.style.top = Math.max(0, Math.min(window.innerHeight - 30, oy + ev.clientY - sy)) + 'px';
      }
      function up() { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); }
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
    return w;
  }

  function close(w) {
    if (!w.el.isConnected) return;
    w.kids.slice().forEach(close);
    w.el.remove();
    wins = wins.filter(function (o) { return o !== w; });
    if (w.parent) w.parent.kids = w.parent.kids.filter(function (o) { return o !== w; });
    if (w.onClose) w.onClose();
    if (!wins.length) document.documentElement.classList.remove('rw-open');
    else front(wins.reduce(function (a, b) { return +a.el.style.zIndex > +b.el.style.zIndex ? a : b; }));
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !wins.length) return;
    close(wins.reduce(function (a, b) { return +a.el.style.zIndex > +b.el.style.zIndex ? a : b; }));
  });

  // Barre de menu Tk : commande directe ou menu déroulant (cascade)
  var openMenu = null;
  function closeMenus() { if (openMenu) { openMenu.classList.remove('open'); openMenu = null; } }
  document.addEventListener('pointerdown', function (e) { if (openMenu && !openMenu.contains(e.target)) closeMenus(); });
  function menuBar(items) {
    var bar = h('div', { class: 'rw-menu', role: 'menubar' });
    items.forEach(function (it) {
      if (!it.items) { bar.appendChild(h('button', { type: 'button', class: 'rw-mi', role: 'menuitem', text: it.label, onclick: function () { closeMenus(); it.action(); } })); return; }
      var wrap = h('div', { class: 'rw-cascade' });
      var drop = h('div', { class: 'rw-drop', role: 'menu' });
      it.items.forEach(function (sub) {
        drop.appendChild(h('button', { type: 'button', class: 'rw-di', role: 'menuitem', text: sub.label, onclick: function () { closeMenus(); sub.action(); } }));
      });
      wrap.appendChild(h('button', { type: 'button', class: 'rw-mi', 'aria-haspopup': 'true', text: it.label, onclick: function () {
        var was = wrap.classList.contains('open'); closeMenus();
        if (!was) { wrap.classList.add('open'); openMenu = wrap; }
      } }));
      wrap.appendChild(drop);
      bar.appendChild(wrap);
    });
    return bar;
  }

  // Panneau « Source » : code Python d'origine, coloré et téléchargeable
  var KW = /^(def|class|for|in|if|elif|else|while|try|except|return|import|from|as|global|pass|break|lambda|and|or|not|True|False|None|del|is)$/;
  function highlight(code) {
    var re = /(#[^\n]*)|('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|([A-Za-z_]\w*)|(\d+(?:\.\d+)?)/g, out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<i class="py-c">' + esc(m[1]) + '</i>';
      else if (m[2]) out += '<i class="py-s">' + esc(m[2]) + '</i>';
      else if (m[3]) out += KW.test(m[3]) ? '<i class="py-k">' + m[3] + '</i>' : m[3];
      else out += '<i class="py-n">' + m[4] + '</i>';
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  // VBA : commentaires ('), chaînes ("" = guillemet échappé), mots-clés et nombres
  var KW_VBA = /^(Option|Explicit|Const|Dim|ReDim|As|New|Set|If|Then|Else|ElseIf|End|Sub|Function|Private|Public|ByRef|ByVal|For|Each|To|Step|Next|Do|While|Loop|Exit|On|Error|Resume|GoTo|Not|And|Or|Mod|Like|Is|Nothing|True|False|String|Double|Single|Long|Boolean|Variant|Object|Collection|Call)$/;
  function highlightVba(code) {
    var re = /('[^\n]*)|("(?:""|[^"\n])*")|([A-Za-z_]\w*)|(\d+(?:\.\d+)?#?)/g, out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<i class="py-c">' + esc(m[1]) + '</i>';
      else if (m[2]) out += '<i class="py-s">' + esc(m[2]) + '</i>';
      else if (m[3]) out += KW_VBA.test(m[3]) ? '<i class="py-k">' + m[3] + '</i>' : m[3];
      else out += '<i class="py-n">' + m[4] + '</i>';
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  // src : nom d'un programme Python (PY_SOURCES), ou { name, code, ext, type, info, note, hl, crlf, back }
  function sourcePanel(src, back) {
    var s = typeof src === 'string'
      ? { name: src, code: (window.PY_SOURCES || {})[src], ext: 'py', type: 'text/x-python', info: 'Python / Tkinter', note: 'écrit avant l’IA', hl: highlight }
      : src;
    var code = s.code || '# Source introuvable';
    var file = s.name + '.' + s.ext;
    var lines = code.split('\n').length;
    var gutter = Array.apply(null, { length: lines }).map(function (_, i) { return i + 1; }).join('\n');
    var dl = button('Télécharger ' + file, function () {
      var a = h('a', { href: URL.createObjectURL(new Blob([s.crlf ? code.replace(/\n/g, '\r\n') : code], { type: s.type })), download: file });
      document.body.appendChild(a); a.click(); a.remove();
    });
    return h('div', { class: 'rw-srcp' }, [
      h('div', { class: 'rw-srch' }, [label(file + ' · ' + s.info + ' · ' + lines + ' lignes' + (s.note ? ', ' + s.note : '')), dl, button(s.back || 'Retour au programme', back)]),
      h('div', { class: 'rw-code' }, [h('pre', { class: 'gut', 'aria-hidden': 'true', text: gutter }), h('pre', { class: 'src', html: s.hl(code) })])
    ]);
  }

  var NOTE = 'Portage JavaScript fidèle du programme Python d’origine · bouton « Source » pour le code';

  // =====================================================================
  //  PySnake — « Oh My Snake ! »
  // =====================================================================
  var snakeWin = null;
  function openSnake() {
    if (snakeWin) { snakeWin.front(); return; }
    var TITLE = 'Oh My Snake !';
    var HELP = window.matchMedia('(pointer: coarse)').matches ? 'Jouer · flèches ou glisser sur le plateau · Pause' : 'Entrée : jouer · Flèches : diriger · Espace : pause';

    // skins (le skin « Gay Snake » a été retiré, comme dans PySnake.py)
    var clownShader = ['yellow', 'yellow', 'blue', 'blue', 'red', 'red'];
    var sunsetShader = ['red4', 'red3', 'red2', 'MediumPurple2', 'MediumPurple3', 'MediumPurple4'];
    var fireShader = ['yellow', 'yellow2', 'yellow3', 'OrangeRed3', 'OrangeRed2', 'orange red'];
    var orchidShader = ['SteelBlue3', 'SteelBlue2', 'SteelBlue1', 'MediumOrchid1', 'MediumOrchid2', 'MediumOrchid3'];
    var bloodShader = ['red', 'black', 'black', 'red', 'black', 'black'];
    var jungleShader = ['lawn green', 'spring green', 'medium spring green', 'spring green', 'lawn green', 'lawn green'];
    var poisonShader = ['white smoke', 'white smoke', 'red4', 'white smoke', 'white smoke', 'red4'];
    var spaceShader = ['DodgerBlue4', 'yellow', 'yellow', 'DodgerBlue4', 'DodgerBlue4', 'DodgerBlue4'];
    var stroboShader = ['gray1', 'gray99', 'gray1', 'gray99', 'gray1', 'gray99'];
    var tabSkins = [['Clown Snake', clownShader], ['Sunset Snake', sunsetShader], ['Fire Snake', fireShader], ['Orchid Snake', orchidShader], ['Blood Snake', bloodShader], ['Jungle Snake', jungleShader], ['Poison Snake', poisonShader], ['Space Snake', spaceShader], ['Strobo Snake', stroboShader]];
    var SKIN_NAMES = ['Clown Snake', 'Sunset Snake', 'Fire Snake', 'Orchid Snake', 'Poison Snake', 'Blood Snake', 'Jungle Snake', 'Space Snake', 'Strobo Snake'];
    var FIXED = ['Clown Snake', 'Sunset Snake', 'Fire Snake', 'Orchid Snake'];
    var MOVING = ['Poison Snake', 'Blood Snake', 'Jungle Snake', 'Space Snake', 'Strobo Snake'];

    // GAME OVER en cases rouges : [ligne j, [colonnes i]]
    var tabGameOver = [[17, [12, 13, 14, 15, 16, 20, 21, 22, 26, 27, 31, 32, 34, 35, 36, 37, 38, 39, 40]], [18, [11, 12, 19, 20, 22, 23, 26, 27, 28, 30, 31, 32, 34, 35]], [19, [10, 11, 18, 19, 23, 24, 26, 27, 28, 29, 30, 31, 32, 34, 35]], [20, [10, 11, 18, 19, 23, 24, 26, 27, 29, 31, 32, 34, 35, 36, 37, 38]], [21, [10, 11, 14, 15, 16, 18, 19, 23, 24, 26, 27, 31, 32, 34, 35]], [22, [10, 11, 15, 16, 18, 19, 20, 21, 22, 23, 24, 26, 27, 31, 32, 34, 35]], [23, [11, 12, 15, 16, 18, 19, 23, 24, 26, 27, 31, 32, 34, 35]], [24, [12, 13, 14, 15, 16, 18, 19, 23, 24, 26, 27, 31, 32, 34, 35, 36, 37, 38, 39, 40]], [26, [11, 12, 13, 14, 15, 18, 19, 23, 24, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39]], [27, [10, 11, 15, 16, 18, 19, 23, 24, 26, 27, 34, 35, 39, 40]], [28, [10, 11, 15, 16, 18, 19, 23, 24, 26, 27, 34, 35, 39, 40]], [29, [10, 11, 15, 16, 18, 19, 23, 24, 26, 27, 28, 29, 30, 34, 35, 38, 39, 40]], [30, [10, 11, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 34, 35, 36, 37, 38]], [31, [10, 11, 15, 16, 19, 20, 21, 22, 23, 26, 27, 34, 35, 38, 39]], [32, [10, 11, 15, 16, 20, 21, 22, 26, 27, 34, 35, 39, 40]], [33, [11, 12, 13, 14, 15, 21, 26, 27, 28, 29, 30, 31, 32, 34, 35, 39, 40]]];

    // options et scores (localStorage remplace fileOptions.txt et fileScores.txt)
    var opts = store.get('pysnake-options', null);
    if (opts && opts[0] === 'Epileptik Snake') opts[0] = 'Strobo Snake';   // ancien nom du skin
    var skinSnake = opts && SKIN_NAMES.indexOf(opts[0]) >= 0 ? opts[0] : 'Jungle Snake';
    var speedSnake = opts ? opts[1] : 50;

    // état du jeu (mêmes noms que l'original)
    var tabSnake = [], lenSnake = 0, scoreSnake = 0, posCandy = null, eatCandy = false;
    var gameOver = true, showGameOver = false, setDirection = false, pause = false, iShader = 0, shader = [];
    var timer = null, dirTimer = null;
    var X = function (i) { return 5 + i * 10; };
    var border = function (i, j) { return i === 0 || i === 49 || j === 0 || j === 49; };
    var randint = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
    var at = function (arr, k) { return arr[k < 0 ? arr.length + k : k]; };   // index négatif à la Python

    var canvas = h('canvas', { class: 'tk-canvas', width: 500, height: 500, 'aria-label': 'Plateau de jeu' });
    var ctx = hiDPI(canvas, 500, 500);
    var scoreLabel = label('0');
    var pad = h('div', { class: 'sn-pad' }, [
      button('▲', function () { DefineDirection('top'); }, 'up'), button('◀', function () { DefineDirection('left'); }, 'left'),
      button('▼', function () { DefineDirection('bottom'); }, 'down'), button('▶', function () { DefineDirection('right'); }, 'right'),
      button('Jouer', function () { GameReplay(); }, 'play'), button('Pause', function () { GamePause(); }, 'pause')
    ]);

    var w = snakeWin = win({
      title: TITLE, source: 'PySnake', cls: 'rw-snake',
      menu: [{ label: 'Scores', action: function () { FenetreScores(); } }, { label: 'Options', action: function () { FenetreOptions(); } }, { label: 'Info', action: function () { FenetreInfos(); } }],
      status: HELP,
      onClose: function () { clearTimeout(timer); clearTimeout(dirTimer); document.removeEventListener('keydown', onKey); snakeWin = null; }
    });
    w.body.append(canvas, label('SCORE', 'sn-score'), scoreLabel, pad);
    draw();

    function draw() {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 500, 500);
      for (var i = 0; i < 50; i++) {
        tkRect(ctx, X(i) - 5, X(0) - 5, X(i) + 5, X(0) + 5, 'black'); tkRect(ctx, X(i) - 5, X(49) - 5, X(i) + 5, X(49) + 5, 'black');
        tkRect(ctx, X(0) - 5, X(i) - 5, X(0) + 5, X(i) + 5, 'black'); tkRect(ctx, X(49) - 5, X(i) - 5, X(49) + 5, X(i) + 5, 'black');
      }
      if (posCandy) {
        ctx.beginPath(); ctx.ellipse(X(posCandy[0]) + 0.5, X(posCandy[1]) + 0.5, 5, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = tk('pink'); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
      }
      if (tabSnake.length > lenSnake) {
        var hd = tabSnake[lenSnake];
        tkRect(ctx, X(hd.i) - 6, X(hd.j) - 6, X(hd.i) + 6, X(hd.j) + 6, hd.color);
        for (var k = 0; k < lenSnake; k++) tkRect(ctx, X(tabSnake[k].i) - 5, X(tabSnake[k].j) - 5, X(tabSnake[k].i) + 5, X(tabSnake[k].j) + 5, tabSnake[k].color);
      }
      if (showGameOver) tabGameOver.forEach(function (row) {
        row[1].forEach(function (i) { tkRect(ctx, X(i) - 5, X(row[0]) - 5, X(i) + 5, X(row[0]) + 5, 'red'); });
      });
    }

    function GameHandler() {
      if (pause) { timer = setTimeout(GameHandler, speedSnake); return; }   // pause corrigée (l'original figeait la fenêtre)
      var i = tabSnake[lenSnake].i, j = tabSnake[lenSnake].j;
      for (var k = 0; k < lenSnake; k++) if (i === tabSnake[k].i && j === tabSnake[k].j && !gameOver) gameOver = true;
      if (border(i, j) && !gameOver) gameOver = true;
      if (i === posCandy[0] && j === posCandy[1]) { eatCandy = true; PopCandy(); }
      if (gameOver) GameOver(); else MoveSnake();
    }

    function GameOver() { showGameOver = true; draw(); CheckScore(scoreSnake); }

    function GameReplay() {
      if (!gameOver) return;
      clearTimeout(timer);
      tabSnake = []; scoreSnake = 0; lenSnake = 0; setDirection = false; gameOver = false; iShader = 0; showGameOver = false; pause = false;
      scoreLabel.textContent = '0';
      PopCandy(); PopSnake(); MoveSnake();
    }

    function GamePause() { if (!gameOver) { pause = !pause; w.status(pause ? 'Pause' : HELP); } }

    function PopCandy() { posCandy = [randint(2, 48), randint(2, 48)]; }

    function PopSnake() {
      for (var s = 0; s < tabSkins.length; s++) if (tabSkins[s][0] === skinSnake) { shader = tabSkins[s][1]; break; }
      for (var j = 0; j < 10; j++) {
        tabSnake[j] = { i: 25, j: 30 - j, snake: 'body', direction: 'none', color: shader[iShader] };
        lenSnake += 1;
        iShader = iShader >= 5 ? 0 : iShader + 1;
      }
      tabSnake[10] = { i: 25, j: 20, snake: 'head', direction: 'top', color: shader[iShader] };
      iShader = iShader <= 0 ? 5 : iShader - 1;
    }

    function MoveSnake() {
      var hd = tabSnake[lenSnake];
      tabSnake.push({ i: hd.i, j: hd.j, snake: 'head', direction: hd.direction, color: 'none' });
      hd.snake = 'body'; hd.direction = 'none';
      SkinSnake();
      var nh = tabSnake[lenSnake + 1];
      if (nh.direction === 'left') nh.i -= 1;
      else if (nh.direction === 'right') nh.i += 1;
      else if (nh.direction === 'top') nh.j -= 1;
      else if (nh.direction === 'bottom') nh.j += 1;
      if (eatCandy) { lenSnake += 1; scoreSnake += 1; eatCandy = false; scoreLabel.textContent = String(scoreSnake); }
      else tabSnake.shift();
      ShowSnake();
    }

    function SkinSnake() {
      if (FIXED.indexOf(skinSnake) >= 0) {
        tabSnake[lenSnake + 1].color = shader[iShader];
        iShader = iShader >= 5 ? 0 : iShader + 1;
      } else if (MOVING.indexOf(skinSnake) >= 0) {
        for (var j = 0; j < lenSnake + 1; j++) tabSnake[lenSnake + 1 - j].color = tabSnake[lenSnake - j].color;
        if (eatCandy) {
          iShader = iShader >= 5 ? 0 : iShader + 1;
          tabSnake[0].color = at(shader, iShader - 1);
        }
      }
    }

    function ShowSnake() { draw(); timer = setTimeout(GameHandler, speedSnake); }

    function DefineDirection(direction) {
      if (setDirection || !tabSnake.length) return;
      setDirection = true;
      var d = tabSnake[lenSnake].direction;
      if (!((d === 'left' && direction === 'right') || (d === 'right' && direction === 'left') || (d === 'top' && direction === 'bottom') || (d === 'bottom' && direction === 'top'))) tabSnake[lenSnake].direction = direction;
      dirTimer = setTimeout(function () { setDirection = false; }, Math.floor(speedSnake / 2));
    }

    var KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'top', ArrowDown: 'bottom' };
    function onKey(e) {
      if (/input|select|textarea/i.test(e.target.tagName) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (KEYS[e.key]) { e.preventDefault(); DefineDirection(KEYS[e.key]); }
      else if (e.key === 'Enter') { e.preventDefault(); GameReplay(); }
      else if (e.key === ' ') { e.preventDefault(); GamePause(); }
    }
    document.addEventListener('keydown', onKey);

    // glisser sur le plateau (écrans tactiles)
    var t0 = null;
    canvas.addEventListener('touchstart', function (e) { t0 = e.touches[0]; }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
      if (!t0) return;
      var dx = e.touches[0].clientX - t0.clientX, dy = e.touches[0].clientY - t0.clientY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      DefineDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
      t0 = e.touches[0];
    }, { passive: true });
    canvas.addEventListener('click', function () { if (gameOver) GameReplay(); });

    // ----- Scores -----
    function loadScores() { return store.get('pysnake-scores', [{ pseudo: 'Val', score: 13 }]); }   // le record de fileScores.txt
    function CheckScore(score) {
      var tabScores = loadScores();
      for (var i = 0; i < 10; i++) {
        if (!tabScores[i] || score > tabScores[i].score) { FenetreSauverScore(score); break; }
      }
    }
    function FenetreScores() {
      var tabScores = loadScores();
      var d = win({ title: TITLE, parent: w });
      var grid = h('div', { class: 'tk-frame tk-ridge sn-top' });
      tabScores.slice(0, 10).forEach(function (s) { grid.append(label(s.pseudo), label(String(s.score), 'r')); });
      d.body.append(label('Top 10 Highest Scores', 'c'), grid, h('div', { class: 'tk-row end' }, [button('Return', d.close)]));
    }
    function FenetreSauverScore(score) {
      var d = win({ title: TITLE, parent: w });
      var pseudo = entry('');
      d.body.append(label('_.-°\'°- Congratulation ! -°\'°-._', 'c'), label('You are in the Top 10 dude !', 'c'), label(String(score), 'c'), pseudo,
        h('div', { class: 'tk-row between' }, [button('Save', function () { SaveScore(pseudo.value, score, d); }), button('Return', d.close)]));
      pseudo.addEventListener('keydown', function (e) { if (e.key === 'Enter') SaveScore(pseudo.value, score, d); });
      pseudo.focus();
    }
    function SaveScore(pseudo, score, d) {
      d.close();
      var tabScores = loadScores();
      tabScores.push({ pseudo: pseudo, score: score });
      tabScores.sort(function (a, b) { return b.score - a.score; });
      store.set('pysnake-scores', tabScores.slice(0, 10));
      FenetreScores();
    }

    // ----- Options -----
    function FenetreOptions() {
      var d = win({ title: TITLE, parent: w });
      var idx = Math.max(0, SKIN_NAMES.indexOf(skinSnake));
      var sb = h('input', { type: 'text', class: 'tk-entry', readonly: true, value: SKIN_NAMES[idx], 'aria-label': 'Skin' });
      function spin(dlt) { idx = (idx + dlt + SKIN_NAMES.length) % SKIN_NAMES.length; sb.value = SKIN_NAMES[idx]; }
      var spinbox = h('div', { class: 'tk-spin' }, [sb, h('div', { class: 'tk-spin-btns' }, [button('▲', function () { spin(1); }), button('▼', function () { spin(-1); })])]);
      var val = h('div', { class: 'tk-scale-val' });
      var sc = h('input', { type: 'range', class: 'tk-scale', min: 0, max: 100, step: 5, value: Math.round((101 - speedSnake) / 5) * 5, 'aria-label': 'Speed' });
      function upd() { val.textContent = sc.value; val.style.left = (sc.value / 100 * 100) + '%'; }
      sc.addEventListener('input', upd);
      var ticks = h('div', { class: 'tk-ticks' }, [0, 20, 40, 60, 80, 100].map(function (t) { return h('span', { text: String(t) }); }));
      d.body.append(
        label('Options', 'c'),
        h('div', { class: 'tk-grid2' }, [label('Skin : '), spinbox, label('Speed : '), h('div', { class: 'tk-scale-wrap' }, [h('div', { class: 'tk-scale-track' }, [val]), sc, ticks])]),
        h('div', { class: 'tk-row between' }, [button('Apply', function () {
          skinSnake = sb.value; speedSnake = 101 - (+sc.value);
          store.set('pysnake-options', [skinSnake, speedSnake]);
        }), button('Return', d.close)])
      );
      upd();
    }

    function FenetreInfos() {
      var d = win({ title: TITLE, parent: w });
      d.body.append(label('Oh My Snake !', 'c b'), label('Release 1.0', 'c'),
        label('By clicking on \'Option\' you can change the skin of you Snake and its speed.'),
        label('By clicking on \'Score\' you can see the 10 highest scores you made.'),
        label('Created by Valxx', 'c'), h('div', { class: 'tk-row end' }, [button('Return', d.close)]));
    }
  }

  // =====================================================================
  //  PyShader — nuancier des couleurs nommées de Tk
  // =====================================================================
  var shaderWin = null;
  function openShader() {
    if (shaderWin) { shaderWin.front(); return; }
    var src = (window.PY_SOURCES || {}).PyShader || '';
    var m = src.match(/pyShader = (\[\[[\s\S]*?\]\])\n/);
    var pyShader = m ? JSON.parse(m[1].replace(/'/g, '"')) : [];
    var canvas = h('canvas', { class: 'tk-canvas', width: 550, height: 550, 'aria-label': 'Nuancier : cliquer une couleur pour afficher son nom' });
    var ctx = hiDPI(canvas, 550, 550);
    var hover = null, swatches = [];
    var w = shaderWin = win({ title: 'tk', source: 'PyShader', cls: 'rw-shader', status: 'Cliquer une case pour afficher le nom de la couleur', onClose: function () { shaderWin = null; } });
    w.body.append(canvas);

    function cell(i, j, outline) {
      var c = pyShader[i] && pyShader[i][j];
      if (!c) return;
      tkRect(ctx, i * 25 + 1, j * 25 + 1, i * 25 + 25, j * 25 + 25, c, outline || c);
    }
    function drawAll() {
      ctx.fillStyle = tk('SystemButtonFace') === 'SystemButtonFace' ? '#f0f0f0' : tk('SystemButtonFace'); ctx.fillRect(0, 0, 550, 550);
      for (var i = 0; i < 22; i++) for (var j = 0; j < 22; j++) cell(i, j);
    }
    drawAll();
    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * 550 / r.width, y: (e.clientY - r.top) * 550 / r.height }; }
    canvas.addEventListener('pointermove', function (e) {
      var p = pos(e), i = Math.floor(p.x / 25), j = Math.floor(p.y / 25);
      if (hover && hover[0] === i && hover[1] === j) return;
      if (hover) cell(hover[0], hover[1]);
      hover = [i, j]; cell(i, j, 'black');                 // activeoutline = 'black'
    });
    canvas.addEventListener('pointerleave', function () { if (hover) cell(hover[0], hover[1]); hover = null; });
    canvas.addEventListener('click', function (e) {
      var p = pos(e), x = Math.floor(p.x / 25), y = Math.floor(p.y / 25), c = pyShader[x] && pyShader[x][y];
      if (!c) return;
      if (swatches.length >= 8) swatches.shift().close();
      var sw = win({ title: 'tk', parent: w, at: { x: e.clientX + 14, y: e.clientY + 14 }, onClose: function () { swatches = swatches.filter(function (s) { return s !== sw; }); } });
      var cc = h('canvas', { class: 'tk-canvas sw', width: 50, height: 50 });
      tkRect(hiDPI(cc, 50, 50), 0, 0, 49, 49, c, 'black');
      sw.body.append(h('div', { class: 'tk-row' }, [cc, label(c + '   ' + tk(c).toUpperCase(), 'mono')]));
      swatches.push(sw);
    });
  }

  // =====================================================================
  //  PyFract — ensembles de Mandelbrot et de Julia
  // =====================================================================
  var fractWin = null;
  function openFract() {
    if (fractWin) { fractWin.front(); return; }
    var typeFrac = null, fields = {};
    // zones d'exemple vérifiées : [type, nom, x inf, x sup, y inf, y sup, (Re C, Im C,) itérations]
    var DEMO = [
      ['Mandelbrot', 'Vue d’ensemble', '-2.25', '0.75', '-1.5', '1.5', '300'],
      ['Mandelbrot', 'Vallée des hippocampes', '-0.74855', '-0.74205', '0.10945', '0.11595', '600'],
      ['Mandelbrot', 'Spirale', '-0.762474', '-0.760674', '-0.0856596', '-0.0838596', '800'],
      ['Julia', 'Lapin de Douady', '-1.5', '1.5', '-1.5', '1.5', '-0.123', '0.745', '300'],
      ['Julia', 'Dendrite', '-1.6', '1.6', '-1.6', '1.6', '0', '1', '300'],
      ['Julia', 'Spirales jumelles', '-1.6', '1.6', '-1.6', '1.6', '-0.8', '0.156', '400'],
      ['Julia', 'Galaxie', '-1.3', '1.3', '-1.3', '1.3', '0.285', '0.01', '400'],
      ['Julia', 'Corail', '-1.6', '1.6', '-1.6', '1.6', '-0.4', '0.6', '400'],
      ['Julia', 'Étincelles', '-1.6', '1.6', '-1.6', '1.6', '-0.70176', '-0.3842', '400']
    ];
    var ZKEY = 'pyfract-zones-v2';
    function zones() { return store.get(ZKEY, DEMO); }   // remplace fileAide.txt (pré-rempli d'exemples)

    // palettes cycliques (dégradés) ; « Original 2018 » reprend color() du script Python
    var PALETTES = {
      'Océan': [[0, [0, 7, 100]], [.16, [32, 107, 203]], [.42, [237, 255, 255]], [.6425, [255, 170, 0]], [.8575, [0, 2, 0]], [1, [0, 7, 100]]],
      'Feu': [[0, [18, 0, 38]], [.2, [120, 0, 110]], [.42, [235, 35, 70]], [.62, [255, 150, 20]], [.8, [255, 240, 160]], [1, [18, 0, 38]]],
      'Aurore': [[0, [4, 12, 40]], [.22, [0, 110, 150]], [.45, [50, 220, 170]], [.62, [235, 250, 210]], [.82, [130, 60, 210]], [1, [4, 12, 40]]],
      'Original 2018': null
    };
    function lut(stops) {
      var n = 1024, out = new Uint8ClampedArray(n * 3);
      for (var k = 0; k < n; k++) {
        var t = k / n, s = 0;
        while (s < stops.length - 2 && t > stops[s + 1][0]) s++;
        var a = stops[s], b = stops[s + 1], f = (t - a[0]) / (b[0] - a[0]);
        for (var c = 0; c < 3; c++) out[k * 3 + c] = a[1][c] + (b[1][c] - a[1][c]) * f;
      }
      return out;
    }

    var form = h('div', { class: 'tk-form' });
    var w = fractWin = win({
      title: 'Set', source: 'PyFract', cls: 'rw-fract',
      menu: [
        { label: 'Type', items: [{ label: 'Ensemble de Mandelbrot', action: function () { setType('Mandelbrot', true); } }, { label: 'Ensembles de Julia', action: function () { setType('Julia', true); } }] },
        { label: 'Mes fractales', items: [{ label: 'Ajouter les coordonnées', action: Save }, { label: 'Coordonnées sauvegardées', action: Aide }, { label: 'Supprimer des coordonnées', action: Delete }] }
      ],
      status: 'Menu « Type » pour commencer, ou « Mes fractales » → Coordonnées sauvegardées',
      onClose: function () { fractWin = null; }
    });
    w.body.append(form);

    var LABELS = {
      x0: 'Limite x inf : ', x1: 'Limite x sup : ', y0: 'Limite y inf : ', y1: 'Limite y sup : ',
      c0: 'Partie réelle de C : ', c1: 'Partie imaginaire de C : ', it: 'Nombre d\'itérations : '
    };
    var palette = 'Océan';
    function setType(t, defaults) {
      typeFrac = t; form.innerHTML = ''; fields = {};
      var keys = t === 'Julia' ? ['x0', 'x1', 'y0', 'y1', 'c0', 'c1', 'it'] : ['x0', 'x1', 'y0', 'y1', 'it'];
      keys.forEach(function (k) { fields[k] = entry(''); form.append(label(LABELS[k]), fields[k]); });
      var sel = h('select', { class: 'tk-entry tk-select', 'aria-label': 'Palette' }, Object.keys(PALETTES).map(function (p) { return h('option', { value: p, text: p, selected: p === palette }); }));
      sel.addEventListener('change', function () { palette = sel.value; });
      form.append(label('Palette : '), sel, h('div', {}, [button('Go !', go)]));
      if (defaults) fill(t === 'Julia' ? DEMO[5] : DEMO[0]);   // valeurs de départ qui fonctionnent
      w.status(t === 'Julia' ? 'Ensembles de Julia : z ← z² + C, z₀ = point du plan' : 'Ensemble de Mandelbrot : z ← z² + c, z₀ = 0');
    }
    function fill(z) {
      fields.x0.value = z[2]; fields.x1.value = z[3]; fields.y0.value = z[4]; fields.y1.value = z[5];
      if (z[0] === 'Julia') { fields.c0.value = z[6]; fields.c1.value = z[7]; }
      fields.it.value = z[z[0] === 'Julia' ? 8 : 6] || '300';
    }
    function lancerRemplissage(z) { setType(z[0]); fill(z); }

    function Save() {
      var d = win({ title: 'Nom de la zone', parent: w });
      var nom = entry('');
      d.body.append(label('Entrez le nom de la zone :', 'c'), nom, h('div', { class: 'tk-row center' }, [button('Enregistrer', function () {
        d.close();
        var tab = zones();
        if (typeFrac === 'Mandelbrot') tab.push([typeFrac, nom.value, fields.x0.value, fields.x1.value, fields.y0.value, fields.y1.value, fields.it.value]);
        else if (typeFrac === 'Julia') tab.push([typeFrac, nom.value, fields.x0.value, fields.x1.value, fields.y0.value, fields.y1.value, fields.c0.value, fields.c1.value, fields.it.value]);
        store.set(ZKEY, tab);
      })]));
      nom.focus();
    }
    function Delete() {
      var d = win({ title: 'Nom de la zone', parent: w });
      var nom = entry('');
      d.body.append(label('Entrez le nom de la zone :', 'c'), nom, h('div', { class: 'tk-row center' }, [button('Supprimer', function () {
        d.close();
        store.set(ZKEY, zones().filter(function (z) { return z[1].toLowerCase() !== nom.value.toLowerCase(); }));
      })]));
      nom.focus();
    }
    function Aide() {
      var d = win({ title: 'Aide', parent: w, cls: 'rw-white' });
      var colM = h('div', { class: 'tk-col' }, [label('Ensemble de Mandelbrot')]), colJ = h('div', { class: 'tk-col' }, [label('Ensemble de Julia')]);
      zones().forEach(function (z) {
        // un clic remplit le formulaire et lance directement le calcul
        (z[0] === 'Julia' ? colJ : colM).append(button(z[1] || '(sans nom)', function () { d.close(); lancerRemplissage(z); go(); }));
      });
      d.body.append(h('div', { class: 'tk-cols' }, [colM, colJ]), h('div', { class: 'tk-row center' }, [button('Ok', d.close)]));
    }

    // ----- couleur d'origine : color() du script Python -----
    function color(i, iteMax) {
      i = 1785 - Math.floor((i / iteMax) * 1785);
      var R = 0, G = 0, B = 0;
      if (i === iteMax) { R = 0; G = 0; B = 0; }
      if (i > 0 && i <= 255) { R = 247; G = Math.floor(i / 5); B = 0; }
      else if (i > 255 && i <= 510) { R = 255; G = Math.floor(i / 4); B = 0; }
      else if (i > 510 && i <= 765) { R = 255; G = Math.floor(i / 3); B = Math.floor(i / 5); }
      else if (i > 765 && i <= 1020) { R = 255; G = Math.floor(i / 2); B = Math.floor(i / 5); }
      else if (i > 1020 && i <= 1275) { R = 255; G = i; B = Math.floor((i / 5) - (765 / 5) + (1020 / 5)); }
      else if (i > 1275 && i <= 1530) { R = 255; G = 255; B = Math.floor((i / 5) - (765 / 5) + (1275 / 5)); }
      else if (i > 1530 && i <= 1785) { R = 255; G = 255; B = Math.floor((i / 5) - (765 / 5) + (1530 / 5)); }
      return [R, G, B];   // les valeurs > 255 sont ramenées à 255, comme le fait Pillow
    }
    function num(el) { var v = el.value.trim().replace(',', '.'); return v === '' || isNaN(+v) ? NaN : +v; }
    function go() {
      if (!typeFrac) return;
      var x0 = num(fields.x0), x1 = num(fields.x1), y0 = num(fields.y0), y1 = num(fields.y1), iteMax = parseInt(fields.it.value, 10);
      var julia = typeFrac === 'Julia', c0 = julia ? num(fields.c0) : 0, c1 = julia ? num(fields.c1) : 0;
      if ([x0, x1, y0, y1, c0, c1].some(isNaN) || !(iteMax > 0)) { w.status('ValueError : une valeur est vide ou n’est pas un nombre'); return; }
      iteMax = Math.min(iteMax, 5000);
      var stops = PALETTES[palette], LUT = stops ? lut(stops) : null, LN = 1024;

      var N = 1000, cv = h('canvas', { class: 'tk-canvas fr', width: N, height: N, 'aria-label': 'Fractale calculée' });
      var cx = cv.getContext('2d'), img = cx.createImageData(N, N), px = img.data;
      var x = 0, done = false, raf = 0, last = [0, 0, 0];
      var save = button('Enregistrer l’image', function () {
        var a = h('a', { href: cv.toDataURL('image/png'), download: 'MaFractale.png' }); document.body.appendChild(a); a.click(); a.remove();
      });
      save.disabled = true;
      var vw = win({ title: 'MaFractale.bmp', parent: w, cls: 'rw-view', status: 'Start...', onClose: function () { done = true; cancelAnimationFrame(raf); } });
      vw.body.append(cv, h('div', { class: 'tk-row end' }, [save]));

      function step() {
        if (done) return;
        var t = performance.now(), from = x;
        while (x < N && performance.now() - t < 14) {
          for (var y = 0; y < N; y++) {
            var a = x0 + (x1 - x0) * (x / 1000), b = y0 + (y1 - y0) * (y / 1000);
            var zr = julia ? a : 0, zi = julia ? b : 0, cr = julia ? c0 : a, ci = julia ? c1 : b, i = 0, nr;
            var o = (y * N + x) * 4;
            // intérieur de la cardioïde ou du disque principal : dans l'ensemble, inutile d'itérer
            if (!julia) {
              var q = (a - 0.25) * (a - 0.25) + b * b;
              if (q * (q + (a - 0.25)) <= 0.25 * b * b || (a + 1) * (a + 1) + b * b <= 0.0625) i = iteMax;
            }
            if (!LUT) {
              while (i < iteMax && Math.sqrt(zr * zr + zi * zi) < 2) { nr = zr * zr - zi * zi + cr; zi = zr * zi + zi * zr + ci; zr = nr; i++; }
              last = color(i, iteMax);
              px[o] = last[0]; px[o + 1] = last[1]; px[o + 2] = last[2];
            } else {
              // coloriage lissé : rayon d'échappement 256, itération fractionnaire
              while (i < iteMax && zr * zr + zi * zi <= 65536) { nr = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = nr; i++; }
              if (i >= iteMax) { px[o] = px[o + 1] = px[o + 2] = 0; last = [0, 0, 0]; }
              else {
                var mu = i + 1 - Math.log2(Math.log(Math.sqrt(zr * zr + zi * zi)));
                var k = Math.floor(((Math.sqrt(Math.max(mu, 0)) * 0.22) % 1) * LN) * 3;
                px[o] = LUT[k]; px[o + 1] = LUT[k + 1]; px[o + 2] = LUT[k + 2];
                last = [LUT[k], LUT[k + 1], LUT[k + 2]];
              }
            }
            px[o + 3] = 255;
          }
          x++;
        }
        cx.putImageData(img, 0, 0, from, 0, x - from, N);
        vw.status('> ' + Math.floor((x / 1000) * 100) + ' %     -     # ' + Math.min(last[0], 255) + ' ' + Math.min(last[1], 255) + ' ' + Math.min(last[2], 255));
        if (x < N) raf = requestAnimationFrame(step);
        else { vw.status('Finish !'); save.disabled = false; }
      }
      raf = requestAnimationFrame(step);
    }
  }

  // =====================================================================
  //  Projet récent : vidéo de démonstration + code source (VBA_SOURCES)
  //  p = { titre, video, poster, source, statut } (mon-profil.js → apropos.code.projets)
  // =====================================================================
  var projWins = {};
  function openProjet(p, showSource) {
    var key = p.source || p.titre, ow = projWins[key];
    if (ow) { ow.front(); if (ow.showSource) ow.showSource(!!showSource); return; }
    var vid = null;
    if (p.video) {
      vid = h('video', { src: p.video, poster: p.poster, controls: true, loop: true, playsinline: true, preload: 'metadata' });
      vid.muted = true;
    }
    var w = projWins[key] = win({
      title: p.titre, cls: 'rw-projet', status: p.statut || null, showSource: showSource,
      source: p.source ? { name: p.source, code: (window.VBA_SOURCES || {})[p.source], ext: 'bas', type: 'text/plain', info: 'VBA / SolidWorks', note: 'version publique caviardée', hl: highlightVba, crlf: true, back: 'Retour à la vidéo' } : null,
      sourceTitle: 'Voir le code VBA', sourceBack: 'Vidéo',
      onSource: function (on) { if (!vid) return; if (on) vid.pause(); else { var pr = vid.play(); if (pr) pr.catch(function () {}); } },
      onClose: function () { delete projWins[key]; }
    });
    if (vid) { w.body.appendChild(vid); if (!showSource) { var pr = vid.play(); if (pr) pr.catch(function () {}); } }
  }

  window.Retro = {
    open: function (name) {
      if (name === 'snake') openSnake();
      else if (name === 'shader') openShader();
      else if (name === 'fract') openFract();
    },
    projet: openProjet
  };
})();
