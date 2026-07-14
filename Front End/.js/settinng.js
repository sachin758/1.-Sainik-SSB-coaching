  /* ---------- Settings ---------- */
  function renderSettingsTab(main){
    const s = DATA.settings;
    main.innerHTML = `
      <h2>Settings</h2>
      <p class="sub">Site identity, contact details, social links and system toggles.</p>
      <div class="admin-form-panel">
        <h4>Site Identity</h4>
        <div class="admin-form-grid">
          <div><label>Website Name</label><input id="setSiteName" value="${s.siteName}"></div>
          <div><label>Tagline (under logo)</label><input id="setTagline" value="${s.tagline}"></div>
          <div><label>Logo Initials</label><input id="setLogo" value="${s.logoInitials}"></div>
          <div><label>SEO Title</label><input id="setSeoTitle" value="${s.seoTitle}"></div>
          <div class="full"><label>SEO Description</label><textarea id="setSeoDesc" rows="2">${s.seoDesc}</textarea></div>
          <div class="full"><label>Footer Description</label><textarea id="setFooterText" rows="2">${s.footerText}</textarea></div>
        </div>
      </div>
      <div class="admin-form-panel">
        <h4>Contact Details</h4>
        <div class="admin-form-grid">
          <div class="full"><label>Address</label><input id="setAddress" value="${s.address}"></div>
          <div><label>Phone (displayed)</label><input id="setPhone" value="${s.phone}"></div>
          <div><label>WhatsApp Number (digits only, country code)</label><input id="setWhatsapp" value="${s.whatsapp}"></div>
          <div><label>Email</label><input id="setEmail" value="${s.email}"></div>
          <div><label>Office Hours</label><input id="setHours" value="${s.hours}"></div>
          <div><label>Instagram URL</label><input id="setInstagram" value="${s.instagram}"></div>
          <div><label>Facebook URL</label><input id="setFacebook" value="${s.facebook}"></div>
          <div><label>YouTube URL</label><input id="setYoutube" value="${s.youtube}"></div>
        </div>
        <div class="admin-form-actions"><button class="btn btn-gold" id="setSaveBtn">Save Settings</button></div>
      </div>
      <div class="admin-form-panel">
        <h4>System</h4>
        <div class="toggle-row">
          <div><div class="t-label">Maintenance Mode</div><div class="t-desc">Shows a holding page to visitors; admin login stays reachable.</div></div>
          <label class="switch"><input type="checkbox" id="setMaintenance" ${s.maintenanceMode?'checked':''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div><div class="t-label">Require 2FA code at admin login (demo)</div><div class="t-desc">Illustrative only — the code is shown on screen, not sent via SMS/email, since that needs a backend.</div></div>
          <label class="switch"><input type="checkbox" id="setTwoFA" ${s.twoFAEnabled?'checked':''}><span class="slider"></span></label>
        </div>
        <div class="admin-form-actions"><button class="btn btn-gold" id="setSystemSaveBtn">Save System Settings</button></div>
      </div>
    `;
    document.getElementById('setSaveBtn').addEventListener('click', async () => {
      const g = id => document.getElementById(id);
      Object.assign(s, {
        siteName:g('setSiteName').value, tagline:g('setTagline').value, logoInitials:g('setLogo').value,
        seoTitle:g('setSeoTitle').value, seoDesc:g('setSeoDesc').value, footerText:g('setFooterText').value,
        address:g('setAddress').value, phone:g('setPhone').value, whatsapp:g('setWhatsapp').value, email:g('setEmail').value,
        hours:g('setHours').value, instagram:g('setInstagram').value, facebook:g('setFacebook').value, youtube:g('setYoutube').value
      });
      await storageSet(STORAGE_KEYS.settings, s);
      await logActivity('Site settings updated', '');
      applySettingsToPublicDOM();
      alert('Settings saved.');
    });
    document.getElementById('setSystemSaveBtn').addEventListener('click', async () => {
      s.maintenanceMode = document.getElementById('setMaintenance').checked;
      s.twoFAEnabled = document.getElementById('setTwoFA').checked;
      await storageSet(STORAGE_KEYS.settings, s);
      await logActivity('System settings updated', `maintenance:${s.maintenanceMode} 2fa:${s.twoFAEnabled}`);
      renderMaintenanceScreen();
      alert('System settings saved.');
    });
  }

  loadAllContent();
