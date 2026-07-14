  /* ---------- Inquiry form: saves into the admin's Inquiries tab ---------- */
  document.getElementById('inquiryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const entry = {
      id: 'm' + Date.now(),
      name: document.getElementById('fname').value,
      phone: document.getElementById('fphone').value,
      email: document.getElementById('femail').value,
      course: document.getElementById('fcourse').value,
      message: document.getElementById('fmsg').value,
      time: new Date().toLocaleString()
    };
    DATA.messages.unshift(entry);
    await storageSet(STORAGE_KEYS.messages, DATA.messages);
    await logActivity('New inquiry received', `${entry.name} — ${entry.course}`);
    renderAdminCounts();
    document.getElementById('formNote').textContent = 'Thanks — your inquiry has been received. Our team will call you within one business day.';
    this.reset();
  });

