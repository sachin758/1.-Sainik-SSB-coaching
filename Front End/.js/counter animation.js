  // Counter animation
  const counters = document.querySelectorAll('.dogtag .num');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.getAttribute('data-count');
      let cur = 0;
      const step = Math.max(1, Math.round(target / 60));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target.toLocaleString() + '+'; return; }
        el.textContent = cur.toLocaleString();
        requestAnimationFrame(tick);
      };
      tick();
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterIO.observe(c));

