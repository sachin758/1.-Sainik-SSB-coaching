  // Course filter (re-queries cards fresh each click, since courses are admin-editable)
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.getAttribute('data-f');
      document.querySelectorAll('#courseGrid .course-card').forEach(card => {
        card.style.display = (f === 'all' || card.getAttribute('data-cat') === f) ? '' : 'none';
      });
    });
  });

aders = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && Session.token) headers['Authorization'] = `Bearer ${Session.token}`;

    let res;
    try{
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined
      });
    }catch(err){
      throw new Error('Could not reach the server. Check your connection or try again shortly.');
    }

    let data = null;
    try{ data = await res.json(); }catch(e){ /* e.g. 204 No Content */ }

    if (!res.ok){
      throw new Error((data && data.error) || `Request failed (${res.status}).`);
    }
    return data;
  }

