// CrewForge site: menus and the launch-list form.
(() => {
  const header = document.querySelector('header.site');
  document.querySelector('.menu-toggle')?.addEventListener('click', () => header.classList.toggle('menu-open'));
  document.querySelectorAll('.nav li.dd > button').forEach(b => b.addEventListener('click', e => {
    const li = b.parentElement, open = li.classList.toggle('open');
    b.setAttribute('aria-expanded', open);
    e.stopPropagation();
  }));
  document.addEventListener('click', () => document.querySelectorAll('.nav li.open').forEach(li => li.classList.remove('open')));

  // Email links are built here so the raw page never contains an address for spam bots to scrape.
  document.querySelectorAll('a.eml').forEach(a => {
    const addr = a.dataset.u + '@' + a.dataset.d;
    a.href = 'mailto:' + addr + (a.dataset.s ? '?subject=' + encodeURIComponent(a.dataset.s) : '');
    if (/\[at\]/.test(a.textContent)) a.textContent = addr;
  });
  window.CF_CONTACT = () => document.querySelector('a.eml')?.href.replace('mailto:', '').split('?')[0] || '';

  // Launch list. ENDPOINT is set when the email service (MailerLite or Kit) is connected; until then the form
  // shows a preview message and sends nothing.
  const ENDPOINT = document.body.dataset.signupEndpoint || '';
  // Region gate (2026-11-07): the launch list isn't offered in some regions. Choosing one shows a notice and hides or
  // disables the sign-up; nothing is sent or stored.
  const BLOCKED = (document.body.dataset.blockedRegions || '').split('|').filter(Boolean);
  const isBlocked = v => BLOCKED.includes(v);
  document.querySelectorAll('select.region').forEach(sel => {
    const box = sel.closest('form, .signup') || document;
    const update = () => {
      const v = sel.value, bad = isBlocked(v);
      box.querySelectorAll('.region-note').forEach(n => n.hidden = !bad);
      box.querySelectorAll('.region-ok').forEach(n => n.hidden = !v || bad);
      box.querySelectorAll('button[type=submit]').forEach(b => b.disabled = bad);
    };
    sel.addEventListener('change', update); update();
  });
  document.querySelectorAll('form.signup-form').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = f.querySelector('.form-ok');
    if (isBlocked(f.querySelector('select.region')?.value)) return;
    if (!f.reportValidity()) return;
    if (ENDPOINT) {
      try { await fetch(ENDPOINT, { method: 'POST', body: new FormData(f), mode: 'no-cors' }); }
      catch (err) { ok.textContent = 'Something went wrong. Email us and we will add you: ' + window.CF_CONTACT(); }
    } else {
      ok.textContent = 'Preview only: the sign-up list is not connected yet.';
    }
    ok.style.display = 'block';
    f.querySelector('button[type=submit]').disabled = true;
  }));
})();
