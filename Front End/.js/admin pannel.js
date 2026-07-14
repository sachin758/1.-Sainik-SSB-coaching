  /* =========================================================
     ADMIN PANEL
  ========================================================= */
  const ADMIN_USER = 'Admin';
  const ADMIN_PASS = 'Admin@1234';
  let adminLoggedIn = false;
  let activeTab = 'overview';

  const adminOverlay = document.getElementById('adminOverlay');
  const adminDash = document.getElementById('adminDash');

  function openAdminLogin(){ adminOverlay.classList.add('open'); document.getElementById('adminError').classList.remove('show'); }
  function closeAdminLogin(){ adminOverlay.classList.remove('open'); }

  document.getElementById('adminOpenBtn').addEventListener('click', openAdminLogin);
  document.getElementById('adminOpenBtnFooter').addEventListener('click', (e)=>{ e.preventDefault(); openAdminLogin(); });
  document.getElementById('adminCloseBtn').addEventListener('click', closeAdminLogin);
  adminOverlay.addEventListener('click', (e) => { if (e.target === adminOverlay) closeAdminLogin(); });

  let pending2FACode = null;
  let credsVerified = false;

  document.getElementById('adminLoginForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const errBox = document.getElementById('adminError');
    errBox.classList.remove('show');

    // Step 2: verifying the 2FA code (demo only — shown on screen, not actually sent anywhere)
    if (credsVerified){
      const code = document.getElementById('admin2fa').value.trim();
      if (code === pending2FACode){
        finishLogin(this);
      } else {
        errBox.textContent = 'Incorrect verification code.';
        errBox.classList.add('show');
        await logActivity('Failed 2FA attempt', 'admin');
      }
      return;
    }

    // Step 1: username + password
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value;
    if (u === ADMIN_USER && p === ADMIN_PASS){
      if (DATA.settings.twoFAEnabled){
        credsVerified = true;
        pending2FACode = String(Math.floor(100000 + Math.random()*900000));
        document.getElementById('stepCreds').style.display = 'none';
        document.getElementById('stepPass').style.display = 'none';
        document.getElementById('step2fa').style.display = 'block';
        document.getElementById('twofaHint').textContent = `Demo code (no real SMS/email is sent): ${pending2FACode}`;
        document.getElementById('adminLoginBtn').textContent = 'Verify Code';
      } else {
        finishLogin(this);
      }
    } else {
      errBox.textContent = 'Incorrect username or password.';
      errBox.classList.add('show');
      await logActivity('Failed login attempt', `username: ${u}`);
    }
  });

  function finishLogin(form){
    adminLoggedIn = true;
    credsVerified = false; pending2FACode = null;
    document.getElementById('stepCreds').style.display = 'block';
    document.getElementById('stepPass').style.display = 'block';
    document.getElementById('step2fa').style.display = 'none';
    document.getElementById('adminLoginBtn').textContent = 'Log In';
    closeAdminLogin();
    form.reset();
    adminDash.classList.add('open');
    renderMaintenanceScreen();
    renderAdminTab('overview');
    logActivity('Admin logged in', '');
  }

  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    adminLoggedIn = false;
    adminDash.classList.remove('open');
    renderMaintenanceScreen();
    logActivity('Admin logged out', '');
  });
  document.getElementById('adminViewSite').addEventListener('click', () => {
    adminDash.classList.remove('open');
  });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderAdminTab(tab.getAttribute('data-tab'));
    });
  });

  function renderAdminCounts(){
    document.getElementById('cntCourses').textContent = DATA.courses.length;
    document.getElementById('cntFaculty').textContent = DATA.faculty.length;
    document.getElementById('cntSelections').textContent = DATA.selections.length;
    document.getElementById('cntTestimonials').textContent = DATA.testimonials.length;
    document.getElementById('cntMessages').textContent = DATA.messages.length;
    document.getElementById('cntStudents').textContent = DATA.students.length;
    document.getElementById('cntMedia').textContent = DATA.media.length;
    document.getElementById('cntActivity').textContent = DATA.activityLog.length;
  }

  function renderAdminTab(tab){
    activeTab = tab;
    const main = document.getElementById('adminMain');
    if (tab === 'overview') return renderOverview(main);
    if (tab === 'courses') return renderEntityTab(main, 'courses', courseFieldSpec, 'Course');
    if (tab === 'faculty') return renderEntityTab(main, 'faculty', facultyFieldSpec, 'Faculty Member');
    if (tab === 'selections') return renderEntityTab(main, 'selections', selectionFieldSpec, 'Selection');
    if (tab === 'testimonials') return renderEntityTab(main, 'testimonials', testimonialFieldSpec, 'Testimonial');
    if (tab === 'messages') return renderMessages(main);
    if (tab === 'students') return renderStudents(main);
    if (tab === 'content') return renderContentTab(main);
    if (tab === 'media') return renderMedia(main);
    if (tab === 'payments') return renderPayments(main);
    if (tab === 'activity') return renderActivityLog(main);
    if (tab === 'reports') return renderReports(main);
    if (tab === 'settings') return renderSettingsTab(main);
  }

  function renderOverview(main){
    main.innerHTML = `
      <h2>Dashboard</h2>
      <p class="sub">Everything below is live on the public site the moment you save a change.</p>
      <div class="admin-stats">
        <div class="admin-stat"><div class="n">${DATA.students.length}</div><div class="l">Total Students</div></div>
        <div class="admin-stat"><div class="n">₹${DATA.payments.records.reduce((s,r)=>s+Number(r.amount||0),0).toLocaleString('en-IN')}</div><div class="l">Total Payments</div></div>
        <div class="admin-stat"><div class="n">${DATA.messages.length}</div><div class="l">Pending Inquiries</div></div>
        <div class="admin-stat"><div class="n">${DATA.media.length}</div><div class="l">Uploaded Images</div></div>
      </div>
      <div class="admin-stats">
        <div class="admin-stat"><div class="n">${DATA.courses.length}</div><div class="l">Courses</div></div>
        <div class="admin-stat"><div class="n">${DATA.faculty.length}</div><div class="l">Faculty</div></div>
        <div class="admin-stat"><div class="n">${DATA.selections.length}</div><div class="l">Selections</div></div>
        <div class="admin-stat"><div class="n">${DATA.activityLog.length}</div><div class="l">Logged Actions</div></div>
      </div>
      <div class="admin-form-panel">
        <h4>Recent activity</h4>
        ${DATA.activityLog.slice(0,5).map(l => `<div class="log-item"><div class="log-dot"></div><div><div>${l.action}${l.detail ? ' — ' + l.detail : ''}</div><div class="log-time">${l.time}</div></div></div>`).join('') || '<p class="empty-note">No activity recorded yet.</p>'}
      </div>
      <div class="admin-note">This dashboard runs entirely client-side against shared artifact storage. It's suited to previewing content workflows — real student accounts, payments and file storage should move to a proper backend with hashed credentials and server-side validation before going live.</div>
    `;
  }

  const courseFieldSpec = [
    {k:'name', label:'Course Name', type:'text', full:true},
    {k:'code', label:'Card Label (e.g. NDA)', type:'text'},
    {k:'cat', label:'Category', type:'select', opts:['army','navy','airforce','ssb']},
    {k:'eligibility', label:'Eligibility', type:'text'},
    {k:'age', label:'Age Limit', type:'text'},
    {k:'duration', label:'Duration', type:'text'},
    {k:'price', label:'Price (₹)', type:'number'},
    {k:'oldPrice', label:'Original Price (₹, optional)', type:'number'},
    {k:'badge', label:'Badge Text (e.g. 12 Seats Left)', type:'text'}
  ];
  const facultyFieldSpec = [
    {k:'name', label:'Full Name', type:'text', full:true},
    {k:'role', label:'Role / Specialization', type:'text', full:true},
    {k:'bio', label:'Short Bio', type:'textarea', full:true}
  ];
  const selectionFieldSpec = [
    {k:'name', label:'Candidate Name', type:'text', full:true},
    {k:'entry', label:'Entry / Course', type:'text', full:true},
    {k:'air', label:'AIR / Rank', type:'text'}
  ];
  const testimonialFieldSpec = [
    {k:'name', label:'Student Name', type:'text'},
    {k:'role', label:'Course / Batch', type:'text'},
    {k:'stars', label:'Rating (1-5)', type:'number'},
    {k:'quote', label:'Testimonial Text', type:'textarea', full:true}
  ];

  function fieldInput(spec, val){
    val = (val === undefined || val === null) ? '' : val;
    if (spec.type === 'textarea') return `<textarea data-k="${spec.k}" rows="3">${val}</textarea>`;
    if (spec.type === 'select') return `<select data-k="${spec.k}">${spec.opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select>`;
    return `<input data-k="${spec.k}" type="${spec.type}" value="${val}">`;
  }

  function renderEntityTab(main, entityKey, spec, label, editId){
    const list = DATA[entityKey];
    const editing = editId ? list.find(x => x.id === editId) : null;
    main.innerHTML = `
      <h2>${label}s</h2>
      <p class="sub">${list.length} published. Edits appear on the live site immediately.</p>
      <div class="admin-actions-row">
        <span></span>
        <button class="admin-add-btn" id="entityAddBtn">${editing ? 'Cancel Edit' : '+ Add ' + label}</button>
      </div>
      <div id="entityFormWrap"></div>
      <div id="entityListWrap"></div>
    `;
    const formWrap = document.getElementById('entityFormWrap');
    const listWrap = document.getElementById('entityListWrap');

    function showForm(item){
      formWrap.innerHTML = `
        <div class="admin-form-panel">
          <h4>${item ? 'Edit' : 'New'} ${label}</h4>
          <div class="admin-form-grid" id="entityFormGrid">
            ${spec.map(s => `<div class="${s.full?'full':''}"><label style="display:block;font-family:var(--ff-mono);font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-soft);margin-bottom:6px;">${s.label}</label>${fieldInput(s, item ? item[s.k] : '')}</div>`).join('')}
          </div>
          <div class="admin-form-actions">
            <button class="btn btn-gold" id="entitySaveBtn">${item ? 'Save Changes' : 'Add ' + label}</button>
            <button class="btn btn-outline-dark" id="entityCancelBtn">Cancel</button>
          </div>
        </div>`;
      document.getElementById('entityCancelBtn').addEventListener('click', () => { formWrap.innerHTML=''; });
      document.getElementById('entitySaveBtn').addEventListener('click', async () => {
        const grid = document.getElementById('entityFormGrid');
        const newItem = item ? {...item} : {id: entityKey.slice(0,1) + Date.now()};
        spec.forEach(s => {
          const el = grid.querySelector(`[data-k="${s.k}"]`);
          let v = el.value;
          if (s.type === 'number') v = v === '' ? null : Number(v);
          newItem[s.k] = v;
        });
        if (item){
          const idx = list.findIndex(x => x.id === item.id);
          list[idx] = newItem;
        } else {
          list.push(newItem);
        }
        await storageSet(STORAGE_KEYS[entityKey], list);
        formWrap.innerHTML = '';
        renderPublicFor(entityKey);
        renderAdminCounts();
        renderEntityTab(main, entityKey, spec, label);
      });
    }

    document.getElementById('entityAddBtn').addEventListener('click', () => {
      if (formWrap.innerHTML.trim()) { formWrap.innerHTML = ''; }
      else { showForm(null); }
    });

    if (!list.length){
      listWrap.innerHTML = `<p class="empty-note">No ${label.toLowerCase()}s yet — add the first one above.</p>`;
      return;
    }
    const cols = spec.filter(s => s.k !== 'quote' && s.k !== 'bio').slice(0,4);
    listWrap.innerHTML = `
      <table class="admin-table">
        <thead><tr>${cols.map(c=>`<th>${c.label.replace(/\(.*?\)/,'').trim()}</th>`).join('')}<th></th></tr></thead>
        <tbody>
          ${list.map(item => `
            <tr>
              ${cols.map(c => `<td>${item[c.k] !== null && item[c.k] !== undefined ? item[c.k] : '—'}</td>`).join('')}
              <td style="text-align:right;">
                <button class="row-btn" data-edit="${item.id}">Edit</button>
                <button class="row-btn danger" data-del="${item.id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    listWrap.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => showForm(list.find(x => x.id === btn.getAttribute('data-edit'))));
    });
    listWrap.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this ' + label.toLowerCase() + '? This cannot be undone.')) return;
        const id = btn.getAttribute('data-del');
        DATA[entityKey] = list.filter(x => x.id !== id);
        await storageSet(STORAGE_KEYS[entityKey], DATA[entityKey]);
        renderPublicFor(entityKey);
        renderAdminCounts();
        renderEntityTab(main, entityKey, spec, label);
      });
    });
  }

  function renderPublicFor(entityKey){
    if (entityKey === 'courses') renderCourses();
    if (entityKey === 'faculty') renderFaculty();
    if (entityKey === 'selections') renderSelections();
    if (entityKey === 'testimonials') renderTestimonials();
  }

  function renderMessages(main){
    main.innerHTML = `
      <h2>Inquiries</h2>
      <p class="sub">${DATA.messages.length} submissions from the Contact form.</p>
      <div id="msgList"></div>
    `;
    const wrap = document.getElementById('msgList');
    if (!DATA.messages.length){
      wrap.innerHTML = '<p class="empty-note">No inquiries yet.</p>';
      return;
    }
    wrap.innerHTML = DATA.messages.map(m => `
      <div class="msg-card">
        <div class="top"><span><b>${m.name}</b> · ${m.phone}${m.email ? ' · ' + m.email : ''}</span><span>${m.time}</span></div>
        <p><b>Interested in:</b> ${m.course}</p>
        ${m.message ? `<p>${m.message}</p>` : ''}
        <button class="row-btn danger" data-msgdel="${m.id}">Delete</button>
      </div>`).join('');
    wrap.querySelectorAll('[data-msgdel]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-msgdel');
        DATA.messages = DATA.messages.filter(x => x.id !== id);
        await storageSet(STORAGE_KEYS.messages, DATA.messages);
        renderAdminCounts();
        renderMessages(main);
      });
    });
  }

