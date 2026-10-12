/* Fenêtre « projet » du quadrant Code & IA : vidéo de démonstration et code source
   (window.VBA_SOURCES, app/retro/sources-vba.js), dans deux onglets.
   Ouverture : Projet.open(p, 'video' | 'code') — p vient de mon-profil.js → apropos.code.projets. */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // VBA : commentaires ('), chaînes ("" = guillemet échappé), mots-clés et nombres
  var KW = /^(Option|Explicit|Const|Dim|ReDim|As|New|Set|If|Then|Else|ElseIf|End|Sub|Function|Private|Public|ByRef|ByVal|For|Each|To|Step|Next|Do|While|Loop|Exit|On|Error|Resume|GoTo|Not|And|Or|Mod|Like|Is|Nothing|True|False|String|Double|Single|Long|Boolean|Variant|Object|Collection|Call)$/;
  function highlightVba(code) {
    var re = /('[^\n]*)|("(?:""|[^"\n])*")|([A-Za-z_]\w*)|(\d+(?:\.\d+)?#?)/g, out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<i class="pj-c">' + esc(m[1]) + '</i>';
      else if (m[2]) out += '<i class="pj-s">' + esc(m[2]) + '</i>';
      else if (m[3]) out += KW.test(m[3]) ? '<i class="pj-k">' + m[3] + '</i>' : m[3];
      else out += '<i class="pj-n">' + m[4] + '</i>';
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  var CLOSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var DL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m-5-5 5 5 5-5M5 20h14"/></svg>';
  var cur = null;

  function open(p, tab) {
    close();
    var code = p.source ? (window.VBA_SOURCES || {})[p.source] : null;
    var file = p.source ? p.source + '.bas' : '';
    var tabs = [];
    if (p.video) tabs.push(['video', '<span aria-hidden="true">▶</span> Vidéo']);
    if (code) tabs.push(['code', 'Code']);
    if (!tabs.length) return;
    if (!tabs.some(function (t) { return t[0] === tab; })) tab = tabs[0][0];

    var ov = document.createElement('div');
    ov.className = 'pj-ov';
    ov.innerHTML =
      '<div class="pj-dlg" role="dialog" aria-modal="true" aria-labelledby="pj-title">' +
        '<header class="pj-hd">' +
          '<h2 class="pj-title" id="pj-title">' + esc(p.titre) + (p.techno ? ' <span class="mono">' + esc(p.techno) + '</span>' : '') + '</h2>' +
          (tabs.length > 1 ? '<div class="pj-tabs mono" role="tablist">' + tabs.map(function (t) {
            return '<button type="button" role="tab" id="pj-tab-' + t[0] + '" aria-controls="pj-p-' + t[0] + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
          }).join('') + '</div>' : '') +
          '<button type="button" class="pj-x" aria-label="Fermer">' + CLOSE + '</button>' +
        '</header>' +
        (p.video ? '<div class="pj-panel pj-video" id="pj-p-video" role="tabpanel" aria-labelledby="pj-tab-video">' +
          '<video src="' + esc(p.video) + '"' + (p.poster ? ' poster="' + esc(p.poster) + '"' : '') + ' controls loop muted playsinline preload="metadata"></video></div>' : '') +
        (code ? '<div class="pj-panel pj-code" id="pj-p-code" role="tabpanel" aria-labelledby="pj-tab-code" tabindex="0">' +
          '<pre class="gut" aria-hidden="true"></pre><pre class="src"></pre></div>' : '') +
        '<footer class="pj-ft mono"><span class="pj-info"></span>' +
          (code ? '<button type="button" class="pj-dl">' + DL + ' Télécharger ' + esc(file) + '</button>' : '') +
        '</footer>' +
      '</div>';

    var dlg = ov.querySelector('.pj-dlg'), vid = ov.querySelector('video'), info = ov.querySelector('.pj-info');
    var dl = ov.querySelector('.pj-dl'), lines = code ? code.split('\n').length : 0, filled = false;
    if (vid) vid.muted = true;

    function show(t) {
      ov.querySelectorAll('[data-tab]').forEach(function (b) {
        var on = b.getAttribute('data-tab') === t;
        b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      });
      ov.querySelectorAll('.pj-panel').forEach(function (el) { el.hidden = el.id !== 'pj-p-' + t; });
      if (t === 'code' && !filled) {
        filled = true;
        ov.querySelector('.gut').textContent = Array.apply(null, { length: lines }).map(function (_, i) { return i + 1; }).join('\n');
        ov.querySelector('.src').innerHTML = highlightVba(code);
      }
      if (dl) dl.hidden = t !== 'code';
      info.textContent = t === 'code' ? file + ' · VBA / SolidWorks · ' + lines + ' lignes · version publique caviardée' : (p.statut || '');
      if (vid) { if (t === 'video') { var pr = vid.play(); if (pr) pr.catch(function () {}); } else vid.pause(); }
    }

    ov.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {   // flèches entre onglets
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault(); e.stopPropagation();
        var all = Array.prototype.slice.call(ov.querySelectorAll('[data-tab]')), k = all.indexOf(b);
        var nb = all[(k + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
        nb.focus(); show(nb.getAttribute('data-tab'));
      });
    });
    ov.querySelector('.pj-x').addEventListener('click', close);
    ov.addEventListener('pointerdown', function (e) { if (e.target === ov) close(); });
    if (dl) dl.addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([code.replace(/\n/g, '\r\n')], { type: 'text/plain' }));
      a.download = file; document.body.appendChild(a); a.click(); a.remove();
    });

    // clavier : Échap ferme, Tab reste dans la fenêtre
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(dlg.querySelectorAll('button, video, [tabindex="0"]'), function (el) { return !el.closest('[hidden]') && el.tabIndex >= 0; });
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);

    cur = { el: ov, onKey: onKey, back: document.activeElement };
    document.body.appendChild(ov);
    document.documentElement.classList.add('pj-open');
    show(tab);
    ov.querySelector('.pj-x').focus({ preventScroll: true });
  }

  function close() {
    if (!cur) return;
    var c = cur; cur = null;
    document.removeEventListener('keydown', c.onKey);
    var v = c.el.querySelector('video'); if (v) v.pause();
    c.el.remove();
    document.documentElement.classList.remove('pj-open');
    if (c.back && c.back.focus) c.back.focus({ preventScroll: true });
  }

  window.Projet = { open: open, close: close };
})();
