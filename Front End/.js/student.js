  /* ---------- Students ---------- */
  function genPassword(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let out = '';
    for (let i=0;i<10;i++) out += chars[Math.floor(Math.random()*chars.length)];
    return out;
  }
  function renderStudents(main, filter){
    filter = filter || '';
    main.innerHTML = `
      <h2>Students</h2>
      <p class="sub">${DATA.students.length} student accounts. Search by name, ID, phone or email.</p>
      <div class="admin-note">Passwords here are stored as plain text in artifact storage for demo purposes only. A production system must hash passwords (bcrypt/Argon2) server-side and never expose them in the admin UI.</div>
      <div class="admin-actions-row">
        <input class="admin-search" id="studentSearch" placeholder="Search students…" value="${filter}">
        <button class="admin-add-btn" id="studentAddBtn">+ Create Student Account</button>
      </div>
      <div id="studentFormWrap"></div>
      <div id="studentListWrap"></div>
    `;
    const formWrap = document.getElementById('studentFormWrap');
    const listWrap = document.getElementById('studentListWrap');

    function showForm(item){
      formWrap.innerHTML = `
        <div class="admin-form-panel">
          <h4>${item ? 'Edit' : 'New'} Student</h4>
          <div class="admin-form-grid" id="stForm">
            <div><label>Full Name</label><input data-k="name" value="${item?item.name:''}"></div>
            <div><label>Student ID</label><input data-k="studentId" value="${item?item.studentId:'GVC'+new Date().getFullYear()+'-'+Math.floor(Math.random()*900+100)}"></div>
            <div><label>Phone</label><input data-k="phone" value="${item?item.phone:''}"></div>
            <div><label>Email</label><input data-k="email" value="${item?item.email:''}"></div>
            <div><label>Course</label><input data-k="course" value="${item?item.course:''}"></div>
            <div><label>Username</label><input data-k="username" value="${item?item.username:''}"></div>
            <div><label>Status</label><select data-k="status"><option value="active" ${item&&item.status==='active'?'selected':''}>Active</option><option value="inactive" ${item&&item.status==='inactive'?'selected':''}>Inactive</option></select></div>
          </div>
          <div class="admin-form-actions">
            <button class="btn btn-gold" id="stSaveBtn">${item?'Save Changes':'Create Account'}</button>
            <button class="btn btn-outline-dark" id="stCancelBtn">Cancel</button>
          </div>
        </div>`;
      document.getElementById('stCancelBtn').addEventListener('click', () => { formWrap.innerHTML=''; });
      document.getElementById('stSaveBtn').addEventListener('click', async () => {
        const grid = document.getElementById('stForm');
        const newItem = item ? {...item} : {id:'st'+Date.now(), password: genPassword()};
        ['name','studentId','phone','email','course','username','status'].forEach(k => {
          newItem[k] = grid.querySelector(`[data-k="${k}"]`).value;
        });
        if (item){ DATA.students[DATA.students.findIndex(x=>x.id===item.id)] = newItem; }
        else { DATA.students.push(newItem); }
        await storageSet(STORAGE_KEYS.students, DATA.students);
        await logActivity(item ? 'Student updated' : 'Student account created', newItem.name);
        formWrap.innerHTML = '';
        renderAdminCounts();
        renderStudents(main, document.getElementById('studentSearch') ? document.getElementById('studentSearch').value : '');
      });
    }
    document.getElementById('studentAddBtn').addEventListener('click', () => {
      if (formWrap.innerHTML.trim()) formWrap.innerHTML=''; else showForm(null);
    });
    document.getElementById('studentSearch').addEventListener('input', (e) => renderStudents(main, e.target.value));

    const q = filter.toLowerCase();
    const list = DATA.students.filter(s => !q || [s.name,s.studentId,s.phone,s.email].some(v => (v||'').toLowerCase().includes(q)));

    if (!list.length){ listWrap.innerHTML = '<p class="empty-note">No matching students.</p>'; return; }
    listWrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Student ID</th><th>Course</th><th>Contact</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${list.map(s => `
            <tr>
              <td>${s.name}</td><td>${s.studentId}</td><td>${s.course}</td>
              <td>${s.phone}${s.email?'<br>'+s.email:''}</td>
              <td><span class="status-pill ${s.status==='active'?'active':'inactive'}">${s.status}</span></td>
              <td style="text-align:right; white-space:nowrap;">
                <button class="row-btn" data-edit="${s.id}">Edit</button>
                <button class="row-btn" data-toggle="${s.id}">${s.status==='active'?'Deactivate':'Activate'}</button>
                <button class="row-btn" data-reset="${s.id}">Reset PW</button>
                <button class="row-btn danger" data-del="${s.id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    listWrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => showForm(DATA.students.find(x=>x.id===b.getAttribute('data-edit')))));
    listWrap.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', async () => {
      const s = DATA.students.find(x=>x.id===b.getAttribute('data-toggle'));
      s.status = s.status === 'active' ? 'inactive' : 'active';
      await storageSet(STORAGE_KEYS.students, DATA.students);
      await logActivity(s.status === 'active' ? 'Student activated' : 'Student deactivated', s.name);
      renderStudents(main, document.getElementById('studentSearch').value);
    }));
    listWrap.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', async () => {
      const s = DATA.students.find(x=>x.id===b.getAttribute('data-reset'));
      s.password = genPassword();
      await storageSet(STORAGE_KEYS.students, DATA.students);
      await logActivity('Password reset', s.name);
      alert(`New temporary password for ${s.name}: ${s.password}\n(Demo only — share this securely; a real system would email/SMS a reset link instead.)`);
    }));
    listWrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
      const s = DATA.students.find(x=>x.id===b.getAttribute('data-del'));
      if (!confirm(`Delete student account for ${s.name}?`)) return;
      DATA.students = DATA.students.filter(x=>x.id!==s.id);
      await storageSet(STORAGE_KEYS.students, DATA.students);
      await logActivity('Student account deleted', s.name);
      renderAdminCounts();
      renderStudents(main, document.getElementById('studentSearch').value);
    }));
  }

