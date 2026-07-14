  /* ---------- Payments ---------- */
  function renderPayments(main){
    const p = DATA.payments;
    main.innerHTML = `
      <h2>Payments</h2>
      <p class="sub">Method settings and a manual payment log. This is UI only — no real payment gateway is wired up.</p>
      <div class="admin-note">Connecting a live payment gateway (Razorpay, PayU, etc.) requires server-side keys and webhook handling, which this static file cannot host securely. Use this tab to publish which methods you accept and to log payments received offline.</div>
      <div class="admin-form-panel">
        <h4>Accepted Methods</h4>
        <div class="toggle-row"><div class="t-label">UPI</div><label class="switch"><input type="checkbox" id="payUpi" ${p.methods.upi?'checked':''}><span class="slider"></span></label></div>
        <div class="toggle-row"><div class="t-label">Bank Transfer</div><label class="switch"><input type="checkbox" id="payBank" ${p.methods.bank?'checked':''}><span class="slider"></span></label></div>
        <div class="toggle-row"><div class="t-label">Cash</div><label class="switch"><input type="checkbox" id="payCash" ${p.methods.cash?'checked':''}><span class="slider"></span></label></div>
        <div class="toggle-row"><div class="t-label">Online Gateway</div><label class="switch"><input type="checkbox" id="payGateway" ${p.methods.gateway?'checked':''}><span class="slider"></span></label></div>
        <div class="admin-form-grid" style="margin-top:16px;">
          <div><label>UPI ID</label><input id="payUpiId" value="${p.upiId}"></div>
          <div><label>Bank Name</label><input id="payBankName" value="${p.bankName}"></div>
          <div><label>Account Name</label><input id="payAccName" value="${p.accName}"></div>
          <div><label>Account Number</label><input id="payAccNumber" value="${p.accNumber}"></div>
          <div><label>IFSC</label><input id="payIfsc" value="${p.ifsc}"></div>
        </div>
        <div class="admin-form-actions"><button class="btn btn-gold" id="paySaveBtn">Save Payment Settings</button></div>
      </div>
      <div class="admin-actions-row"><h4 style="font-size:15px;">Payment Records</h4><button class="admin-add-btn" id="payAddBtn">+ Record Payment</button></div>
      <div id="payFormWrap"></div>
      <div id="payListWrap"></div>
    `;
    document.getElementById('paySaveBtn').addEventListener('click', async () => {
      const g = id => document.getElementById(id);
      p.methods = {upi:g('payUpi').checked, bank:g('payBank').checked, cash:g('payCash').checked, gateway:g('payGateway').checked};
      p.upiId = g('payUpiId').value; p.bankName = g('payBankName').value; p.accName = g('payAccName').value; p.accNumber = g('payAccNumber').value; p.ifsc = g('payIfsc').value;
      await storageSet(STORAGE_KEYS.payments, p);
      await logActivity('Payment settings updated', '');
      alert('Payment settings saved.');
    });
    const formWrap = document.getElementById('payFormWrap');
    const listWrap = document.getElementById('payListWrap');
    document.getElementById('payAddBtn').addEventListener('click', () => {
      formWrap.innerHTML = `
        <div class="admin-form-panel">
          <h4>New Payment Record</h4>
          <div class="admin-form-grid">
            <div><label>Student Name</label><input id="prStudent"></div>
            <div><label>Amount (₹)</label><input id="prAmount" type="number"></div>
            <div><label>Method</label><select id="prMethod"><option>UPI</option><option>Bank Transfer</option><option>Cash</option><option>Gateway</option></select></div>
            <div><label>Date</label><input id="prDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
          </div>
          <div class="admin-form-actions">
            <button class="btn btn-gold" id="prSaveBtn">Save</button>
            <button class="btn btn-outline-dark" id="prCancelBtn">Cancel</button>
          </div>
        </div>`;
      document.getElementById('prCancelBtn').addEventListener('click', () => formWrap.innerHTML='');
      document.getElementById('prSaveBtn').addEventListener('click', async () => {
        const g = id => document.getElementById(id);
        const studentVal = g('prStudent').value, amountVal = g('prAmount').value;
        p.records.unshift({id:'pr'+Date.now(), student:studentVal, amount:Number(amountVal||0), method:g('prMethod').value, date:g('prDate').value});
        await storageSet(STORAGE_KEYS.payments, p);
        await logActivity('Payment recorded', `${studentVal} — ₹${amountVal}`);
        formWrap.innerHTML = '';
        renderPayments(main);
      });
    });
    if (!p.records.length){ listWrap.innerHTML = '<p class="empty-note">No payments recorded yet.</p>'; }
    else {
      listWrap.innerHTML = `
        <table class="admin-table">
          <thead><tr><th>Student</th><th>Amount</th><th>Method</th><th>Date</th><th></th></tr></thead>
          <tbody>${p.records.map(r => `<tr><td>${r.student}</td><td>₹${Number(r.amount).toLocaleString('en-IN')}</td><td>${r.method}</td><td>${r.date}</td><td style="text-align:right;"><button class="row-btn danger" data-prdel="${r.id}">Delete</button></td></tr>`).join('')}</tbody>
        </table>`;
      listWrap.querySelectorAll('[data-prdel]').forEach(b => b.addEventListener('click', async () => {
        p.records = p.records.filter(x=>x.id!==b.getAttribute('data-prdel'));
        await storageSet(STORAGE_KEYS.payments, p);
        await logActivity('Payment record deleted', '');
        renderPayments(main);
      }));
    }
  }

