// CrewForge sample lesson: reading progress bar, table-of-contents highlight, practice quiz (window.CF_QUIZ).
// A simulator iframe with data-mode opens on that mode's tab (the rigging simulator serves several lessons).
document.querySelectorAll('iframe.sim-frame[data-mode]').forEach(f => f.addEventListener('load', () => {
  try {
    const d = f.contentDocument, m = f.dataset.mode;
    const b = d && d.querySelector(`#c-mode button[data-v="${m}"]`);
    if (b) b.click(); else if (f.contentWindow.sim) f.contentWindow.sim.set({ mode: m }, 0);
  } catch (e) { /* cross-origin preview: the learner picks the tab */ }
}));
(() => {
  const bar = document.getElementById('lp-bar');
  const links = [...document.querySelectorAll('.toc-card a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? 100 * h.scrollTop / max : 0) + '%';
    let cur = 0;
    targets.forEach((t, i) => { if (t.getBoundingClientRect().top < 140) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const Q = window.CF_QUIZ || [], app = document.getElementById('quiz-app');
  if (!app || !Q.length) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let i = 0, res = Q.map(() => null);
  function dots() {
    return `<div class="qdots">${Q.map((_, k) => `<i class="${res[k] === true ? 'ok' : res[k] === false ? 'bad' : k === i ? 'cur' : ''}"></i>`).join('')}</div>`;
  }
  function show() {
    if (i >= Q.length) return finish();
    const q = Q[i];
    app.innerHTML = `<div class="qcard"><div class="qtop"><span>Question ${i + 1} of ${Q.length}</span>${dots()}</div>
      <p class="qq">${esc(q.q)}</p>
      <div class="qopts">${q.o.map((o, k) => `<button class="qopt" data-k="${k}"><b>${'ABCD'[k]}</b><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="qfb"><div><div class="verdict"></div><div class="work">${esc(q.x)}</div></div>
        ${q.img ? `<img loading="lazy" src="${esc(q.img)}" alt="Simulator set up for this question">` : ''}</div>
      <div class="qnav"></div></div>`;
    app.querySelectorAll('.qopt').forEach(b => b.addEventListener('click', () => pick(+b.dataset.k)));
  }
  function pick(k) {
    const q = Q[i], ok = k === q.a;
    res[i] = ok;
    app.querySelectorAll('.qopt').forEach(b => {
      b.disabled = true;
      const n = +b.dataset.k;
      if (n === q.a) b.classList.add('right'); else if (n === k) b.classList.add('wrong');
    });
    const fb = app.querySelector('.qfb'), v = fb.querySelector('.verdict');
    v.textContent = ok ? 'Correct. Here is the working:' : `Not quite. The answer is ${'ABCD'[q.a]}. Here is the working:`;
    v.className = 'verdict ' + (ok ? 'ok' : 'bad');
    fb.classList.add('show');
    app.querySelector('.qdots').outerHTML = dots();
    const nav = app.querySelector('.qnav');
    nav.innerHTML = `<button class="btn primary">${i + 1 < Q.length ? 'Next question →' : 'See your score'}</button>`;
    nav.querySelector('button').addEventListener('click', () => { i++; show(); app.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  function finish() {
    const n = res.filter(Boolean).length, pct = Math.round(100 * n / Q.length);
    app.innerHTML = `<div class="qcard qresult"><div class="qtop" style="justify-content:center">${dots()}</div>
      <div class="big">${n} / ${Q.length}</div>
      <p>${pct >= 80 ? 'That would pass a CrewForge lesson check-in (80 %).' : 'Lesson check-ins need 80 %. Review the worked examples and try again.'}</p>
      <p style="margin-top:18px"><button class="btn ghost" id="qagain">Try again</button>
      <a class="btn primary" href="index.html#join" style="margin-left:8px">Join the launch list</a></p></div>`;
    app.querySelector('#qagain').addEventListener('click', () => { i = 0; res = Q.map(() => null); show(); });
  }
  show();
})();
