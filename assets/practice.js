// CrewForge practice exam: pick an answer, see if it's right, and open the worked solution. No libraries.
(() => {
  const score = document.querySelector('.score');
  let got = 0, tried = 0;
  document.querySelectorAll('.pq').forEach(q => {
    const right = Number(q.dataset.answer);
    const opts = q.querySelectorAll('.opt');
    opts.forEach(b => b.addEventListener('click', () => {
      if (q.classList.contains('done')) return;
      q.classList.add('done');
      const pick = Number(b.dataset.i);
      opts.forEach(o => {
        o.disabled = true;
        if (Number(o.dataset.i) === right) o.classList.add('right');
      });
      if (pick !== right) b.classList.add('wrong');
      tried += 1; if (pick === right) got += 1;
      if (score) {
        score.hidden = false;
        score.querySelector('.got').textContent = got;
        score.querySelector('.tried').textContent = tried;
      }
      const sol = q.querySelector('details.sol');
      if (sol) sol.open = true;
    }));
  });
})();
