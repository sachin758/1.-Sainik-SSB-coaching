  /* ---------- Public renderers ---------- */
  function renderCourses(){
    const grid = document.getElementById('courseGrid');
    if (!DATA.courses.length){ grid.innerHTML = '<p class="empty-note" style="grid-column:1/-1;">No courses published yet.</p>'; return; }
    grid.innerHTML = DATA.courses.map(c => `
      <div class="course-card" data-cat="${c.cat}">
        <div class="course-media"><span>${c.code}</span><span class="course-badge">${c.badge || ''}</span></div>
        <div class="course-body">
          <h4>${c.name}</h4>
          <div class="course-meta"><span><b>Eligibility:</b> ${c.eligibility}</span><span><b>Age:</b> ${c.age}</span><span><b>Duration:</b> ${c.duration}</span></div>
          <div class="course-foot"><div class="price">₹${Number(c.price).toLocaleString('en-IN')}${c.oldPrice ? ` <small>₹${Number(c.oldPrice).toLocaleString('en-IN')}</small>` : ''}</div><a href="#contact" class="enroll-btn">Enroll →</a></div>
        </div>
      </div>`).join('');
    // re-apply active filter
    const activeChip = document.querySelector('.chip.active');
    const f = activeChip ? activeChip.getAttribute('data-f') : 'all';
    document.querySelectorAll('#courseGrid .course-card').forEach(card => {
      card.style.display = (f === 'all' || card.getAttribute('data-cat') === f) ? '' : 'none';
    });
  }
  function renderFaculty(){
    const grid = document.getElementById('facultyGrid');
    if (!DATA.faculty.length){ grid.innerHTML = '<p class="empty-note" style="grid-column:1/-1;">No faculty published yet.</p>'; return; }
    grid.innerHTML = DATA.faculty.map(f => `
      <div class="faculty-card">
        <div class="faculty-photo"><svg viewBox="0 0 120 150" width="66%"><path d="M60 40c14 0 24 12 24 28s-10 30-24 30-24-14-24-30 10-28 24-28z" fill="rgba(245,241,228,.18)"/><path d="M12 150c0-30 20-50 48-50s48 20 48 50z" fill="rgba(245,241,228,.18)"/></svg></div>
        <div class="faculty-info"><h4>${f.name}</h4><div class="role">${f.role}</div><p>${f.bio}</p></div>
      </div>`).join('');
  }
  function renderSelections(){
    const grid = document.getElementById('selGrid');
    if (!DATA.selections.length){ grid.innerHTML = '<p class="empty-note" style="grid-column:1/-1;">No selections published yet.</p>'; return; }
    grid.innerHTML = DATA.selections.map(s => `
      <div class="sel-card"><div class="sel-avatar">${initials(s.name)}</div><h4>${s.name}</h4><div class="entry">${s.entry}</div><span class="sel-air">${s.air}</span></div>`).join('');
  }
  function renderTestimonials(){
    const grid = document.getElementById('testGrid');
    if (!DATA.testimonials.length){ grid.innerHTML = '<p class="empty-note" style="grid-column:1/-1;">No testimonials published yet.</p>'; return; }
    grid.innerHTML = DATA.testimonials.map(t => `
      <div class="test-card">
        <div class="stars">${'★'.repeat(t.stars || 5)}${'☆'.repeat(5-(t.stars||5))}</div>
        <p class="quote">${t.quote}</p>
        <div class="test-who"><div class="test-avatar">${initials(t.name)}</div><div><div class="n">${t.name}</div><div class="r">${t.role}</div></div></div>
      </div>`).join('');
  }

