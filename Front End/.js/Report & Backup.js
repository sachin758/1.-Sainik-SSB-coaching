
  /* ---------- Reports & Backup ---------- */
  function toCSV(rows, cols){
    const esc = v => `"${String(v===undefined||v===null?'':v).replace(/"/g,'""')}"`;
    return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
  }
  function downloadFile(filename, content, mime){
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  function renderReports(main){
    main.innerHTML = `
      <h2>Reports &amp; Backup</h2>
      <p class="sub">Export data as CSV, or back up / restore the entire site's content.</p>
      <div class="report-grid">
        <div class="report-card"><h4>Students</h4><p>Name, ID, course, contact, status.</p><button class="btn btn-outline-dark" id="repStudents">Download CSV</button></div>
        <div class="report-card"><h4>Payments</h4><p>All recorded payments.</p><button class="btn btn-outline-dark" id="repPayments">Download CSV</button></div>
        <div class="report-card"><h4>Inquiries</h4><p>Contact form submissions.</p><button class="btn btn-outline-dark" id="repMessages">Download CSV</button></div>
        <div class="report-card"><h4>Activity Log</h4><p>Login history and admin actions.</p><button class="btn btn-outline-dark" id="repActivity">Download CSV</button></div>
        <div class="report-card"><h4>Website Activity</h4><p>Courses, faculty, selections, testimonials counts.</p><button class="btn btn-outline-dark" id="repWebsite">Download CSV</button></div>
        <div class="report-card"><h4>Uploaded Media</h4><p>Media library file list.</p><button class="btn btn-outline-dark" id="repMedia">Download CSV</button></div>
      </div>
      <div class="admin-form-panel" style="margin-top:24px;">
        <h4>Backup &amp; Restore</h4>
        <p style="font-size:13px; color:var(--ink-soft); margin-bottom:14px;">Download a full JSON snapshot of every section, or restore from a previous snapshot.</p>
        <div class="admin-form-actions">
          <button class="btn btn-gold" id="backupBtn">Download Full Backup (.json)</button>
          <label class="btn btn-outline-dark" style="cursor:pointer;">Restore from Backup<input type="file" id="restoreInput" accept="application/json" style="display:none;"></label>
        </div>
      </div>
    `;
    document.getElementById('repStudents').addEventListener('click', () => downloadFile('students.csv', toCSV(DATA.students, ['name','studentId','phone','email','course','status']), 'text/csv'));
    document.getElementById('repPayments').addEventListener('click', () => downloadFile('payments.csv', toCSV(DATA.payments.records, ['student','amount','method','date']), 'text/csv'));
    document.getElementById('repMessages').addEventListener('click', () => downloadFile('inquiries.csv', toCSV(DATA.messages, ['name','phone','email','course','message','time']), 'text/csv'));
    document.getElementById('repActivity').addEventListener('click', () => downloadFile('activity-log.csv', toCSV(DATA.activityLog, ['time','action','detail']), 'text/csv'));
    document.getElementById('repMedia').addEventListener('click', () => downloadFile('media.csv', toCSV(DATA.media, ['id','name','addedAt']), 'text/csv'));
    document.getElementById('repWebsite').addEventListener('click', () => downloadFile('website-activity.csv', toCSV([
      {section:'Courses', count:DATA.courses.length}, {section:'Faculty', count:DATA.faculty.length},
      {section:'Selections', count:DATA.selections.length}, {section:'Testimonials', count:DATA.testimonials.length},
      {section:'FAQs', count:DATA.faqs.length}
    ], ['section','count']), 'text/csv'));

    document.getElementById('backupBtn').addEventListener('click', async () => {
      await logActivity('Full backup downloaded', '');
      downloadFile(`gvc-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(DATA, null, 2), 'application/json');
    });
    document.getElementById('restoreInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!confirm('Restoring will overwrite all current content with the backup file. Continue?')) { e.target.value=''; return; }
      const reader = new FileReader();
      reader.onload = async () => {
        try{
          const parsed = JSON.parse(reader.result);
          DATA = {...DEFAULTS, ...parsed};
          for (const k of Object.keys(STORAGE_KEYS)) await storageSet(STORAGE_KEYS[k], DATA[k]);
          await logActivity('Restored from backup', file.name);
          loadAllContent();
          renderReports(main);
          alert('Backup restored successfully.');
        }catch(err){ alert('Could not read that backup file.'); }
      };
      reader.readAsText(file);
    });
  }

