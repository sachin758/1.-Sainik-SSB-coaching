
  /* ---------- Banner / Maintenance / FAQ / Settings on public site ---------- */
  function renderBannerPublic(){
    const bar = document.getElementById('siteBanner');
    const txt = document.getElementById('siteBannerText');
    if (DATA.banner && DATA.banner.active && DATA.banner.text){
      txt.textContent = DATA.banner.text;
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }
  document.getElementById('siteBannerClose').addEventListener('click', () => {
    document.getElementById('siteBanner').classList.add('hidden');
  });

  function renderMaintenanceScreen(){
    const screen = document.getElementById('maintenanceScreen');
    if (DATA.settings.maintenanceMode && !adminLoggedIn){
      screen.classList.add('open');
    } else {
      screen.classList.remove('open');
    }
  }
  document.getElementById('maintenanceAdminLink').addEventListener('click', (e) => { e.preventDefault(); openAdminLogin(); });

  function renderFAQPublic(){
    const wrap = document.getElementById('faqList');
    if (!DATA.faqs.length){ wrap.innerHTML = '<p class="empty-note">No FAQs published yet.</p>'; return; }
    wrap.innerHTML = DATA.faqs.map(f => `
      <div class="faq-item" data-id="${f.id}">
        <button class="faq-q"><span>${f.q}</span><span class="plus">+</span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`).join('');
    wrap.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        wrap.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight = null; });
        if (!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  function applySettingsToPublicDOM(){
    const s = DATA.settings;
    document.title = s.seoTitle || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc && s.seoDesc){
      const m = document.createElement('meta'); m.name='description'; m.content=s.seoDesc; document.head.appendChild(m);
    } else if (metaDesc){ metaDesc.content = s.seoDesc || ''; }

    const setText = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    setText('navBrandBadge', s.logoInitials);
    setText('footerBrandBadge', s.logoInitials);
    const navBrandText = document.getElementById('navBrandText');
    if (navBrandText) navBrandText.innerHTML = `${(s.siteName||'').toUpperCase()}<span>${s.tagline||''}</span>`;
    const footerBrandText = document.getElementById('footerBrandText');
    if (footerBrandText) footerBrandText.innerHTML = `${(s.siteName||'').toUpperCase()}<span>${s.tagline||''}</span>`;
    setText('footerTagline', s.footerText);
    setText('footerCopyright', `© 2026 ${s.siteName || 'GVC Sainik SSB Academy'}. All rights reserved.`);
    setText('ciAddress', s.address);
    setText('ciPhone', s.phone);
    setText('ciEmail', s.email);
    setText('ciHours', s.hours);
    const ig = document.getElementById('ciInstagram'); if (ig) ig.href = s.instagram || '#';
    const fb = document.getElementById('ciFacebook'); if (fb) fb.href = s.facebook || '#';
    const yt = document.getElementById('ciYoutube'); if (yt) yt.href = s.youtube || '#';
    const wa = document.getElementById('waFloat'); if (wa && s.whatsapp) wa.href = `https://wa.me/${s.whatsapp}`;
  }

