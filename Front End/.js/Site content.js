  /* ---------- Site Content (banner + FAQs) ---------- */
  function renderContentTab(main){
    main.innerHTML = `
      <h2>Site Content</h2>
      <p class="sub">Homepage announcement banner and the FAQ section shown near the bottom of the site.</p>
      <div class="admin-form-panel">
        <h4>Announcement Banner</h4>
        <div class="toggle-row">
          <div><div class="t-label">Show banner on site</div><div class="t-desc">Appears as a strip above the header.</div></div>
          <label class="switch"><input type="checkbox" id="bannerActive" ${DATA.banner.active?'checked':''}><span class="slider"></span></label>
        </div>
        <div class="field" style="margin-top:14px;"><label>Banner Text</label><textarea id="bannerText" rows="2">${DATA.banner.text}</textarea></div>
        <div class="admin-form-actions"><button class="btn btn-gold" id="bannerSaveBtn">Save Banner</button></div>
      </div>
      <div class="admin-actions-row"><h4 style="font-size:15px;">FAQs</h4><button class="admin-add-btn" id="faqAddBtn">+ Add FAQ</button></div>
      <div id="faqFormWrap"></div>
      <div id="faqListWrap"></div>
    `;
    document.getElementById('bannerSaveBtn').addEventListener('click', async () => {
      DATA.banner.active = document.getElementById('bannerActive').checked;
      DATA.banner.text = document.getElementById('bannerText').value;
      await storageSet(STORAGE_KEYS.banner, DATA.banner);
      await logActivity('Banner updated', DATA.banner.active ? 'shown' : 'hidden');
      renderBannerPublic();
    });

    const formWrap = document.getElementById('faqFormWrap');
    const listWrap = document.getElementById('faqListWrap');
    function showFaqForm(item){
      formWrap.innerHTML = `
        <div class="admin-form-panel">
          <h4>${item?'Edit':'New'} FAQ</h4>
          <div class="field"><label>Question</label><input id="faqQ" value="${item?item.q:''}"></div>
          <div class="field"><label>Answer</label><textarea id="faqA" rows="3">${item?item.a:''}</textarea></div>
          <div class="admin-form-actions">
            <button class="btn btn-gold" id="faqSaveBtn">${item?'Save':'Add FAQ'}</button>
            <button class="btn btn-outline-dark" id="faqCancelBtn">Cancel</button>
          </div>
        </div>`;
      document.getElementById('faqCancelBtn').addEventListener('click', () => formWrap.innerHTML='');
      document.getElementById('faqSaveBtn').addEventListener('click', async () => {
        const q = document.getElementById('faqQ').value, a = document.getElementById('faqA').value;
        if (item){ item.q = q; item.a = a; } else { DATA.faqs.push({id:'faq'+Date.now(), q, a}); }
        await storageSet(STORAGE_KEYS.faqs, DATA.faqs);
        await logActivity('FAQ saved', q);
        formWrap.innerHTML = '';
        renderFAQPublic();
        renderContentTab(main);
      });
    }
    document.getElementById('faqAddBtn').addEventListener('click', () => showFaqForm(null));
    if (!DATA.faqs.length){ listWrap.innerHTML = '<p class="empty-note">No FAQs yet.</p>'; }
    else {
      listWrap.innerHTML = DATA.faqs.map(f => `
        <div class="msg-card"><div class="top"><b>${f.q}</b></div><p>${f.a}</p>
          <button class="row-btn" data-edit="${f.id}">Edit</button>
          <button class="row-btn danger" data-del="${f.id}">Delete</button>
        </div>`).join('');
      listWrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => showFaqForm(DATA.faqs.find(x=>x.id===b.getAttribute('data-edit')))));
      listWrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('Delete this FAQ?')) return;
        DATA.faqs = DATA.faqs.filter(x=>x.id!==b.getAttribute('data-del'));
        await storageSet(STORAGE_KEYS.faqs, DATA.faqs);
        await logActivity('FAQ deleted', '');
        renderFAQPublic();
        renderContentTab(main);
      }));
    }
  }

