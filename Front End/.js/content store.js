  /* =========================================================
     CONTENT STORE — powers both the public site and the admin
     dashboard. Persists via window.storage (shared, so any
     visitor's browser sees the admin's edits) with an in-memory
     fallback if storage is unavailable.
  ========================================================= */
  const DEFAULTS = {
    courses: [
      {id:'c1', cat:'army', code:'NDA', badge:'18 Seats Left', name:'NDA Foundation Batch', eligibility:'12th appearing', age:'16.5–19.5', duration:'12 months', price:28000, oldPrice:35000},
      {id:'c2', cat:'army', code:'CDS', badge:'12 Seats Left', name:'CDS Complete Course', eligibility:'Graduate', age:'19–24', duration:'6 months', price:22000, oldPrice:27000},
      {id:'c3', cat:'airforce', code:'AFCAT', badge:'9 Seats Left', name:'AFCAT Intensive', eligibility:'Graduate', age:'20–24', duration:'4 months', price:19000, oldPrice:24000},
      {id:'c4', cat:'ssb', code:'SSB', badge:'Rolling Batch', name:'SSB Interview Complete Course', eligibility:'Screening cleared', age:'Any', duration:'21 days', price:15000, oldPrice:null},
      {id:'c5', cat:'army', code:'TES', badge:'15 Seats Left', name:'TES Entry Preparation', eligibility:'12th PCM', age:'16.5–19.5', duration:'8 months', price:24000, oldPrice:29000},
      {id:'c6', cat:'army', code:'OTA', badge:'Rolling Batch', name:'OTA Chennai Batch', eligibility:'Graduate', age:'19–25', duration:'5 months', price:20000, oldPrice:25000},
      {id:'c7', cat:'army', code:'AGNIVEER', badge:'40 Seats Left', name:'Agniveer GD & Technical', eligibility:'10th / 12th', age:'17.5–21', duration:'6 months', price:14000, oldPrice:18000},
      {id:'c8', cat:'ssb', code:'CAPF', badge:'10 Seats Left', name:'CAPF AC Course', eligibility:'Graduate', age:'20–25', duration:'5 months', price:21000, oldPrice:26000},
      {id:'c9', cat:'ssb', code:'PSYCH', badge:'Rolling Batch', name:'Psychology + GTO Special Batch', eligibility:'Any aspirant', age:'Any', duration:'14 days', price:9000, oldPrice:null}
    ],
    faculty: [
      {id:'f1', name:'Maj. Sudhir Mishra (Retd.)', role:'GTO & Outdoor Training', bio:'22 years IAF, ex-GTO at Allahabad Selection Board.'},

    ],
    selections: [
      {id:'s1', name:'Yogendra Singh ', entry:'TGC- 144th Course', air:'AIR 34'},

    ],
    testimonials: [
      {id:'t1', quote:'The mock GTO ground made the real Board feel familiar. I knew exactly how a command task should sound by the time I sat in front of the assessor.', name:'Aditya Kaushik', role:'NDA 149', stars:5},
    ],
    messages: [],
    banner: { active:true, text:'Admissions open for the August batch — limited seats across all entries.' },
    faqs: [
      {id:'q1', q:'What is the minimum qualification to join?', a:'It depends on the entry: 10th/12th pass for Agniveer and TES, 12th appearing for NDA, and graduation for CDS, AFCAT, OTA and CAPF AC courses.'},
    ],
    students: [
      {id:'st1', name:'Yogendra singh', studentId:'GVC2024-041', phone:'7223887030', email:'yogendra.s@example.com', course:'TGC Batch', username:'yogendra.s', password:'Welcome@123', status:'active'},
    ],
    settings: {
      siteName:'GVC Sainik SSB Academy', tagline:'SSB ACADEMY', logoInitials:'GVC',
      address:'AM 08, Sector A, near ECS Bagless School, Deen Dayal Nagar, Gwalior, Madhya Pradesh 474005',
      phone:'+91 8962729314', whatsapp:'919755343995', email:'sudhirmishrak116@gmail.com',
      hours:'Mon–Sat, 7:00 AM – 7:00 PM',
      instagram:'#', facebook:'#', youtube:'#',
      footerText:'Transforming aspirants into officers since 2011 — NDA, CDS, AFCAT and every SSB entry, taught by those who assessed.',
      seoTitle:'GVC Sainik SSB Academy — Transforming Aspirants into Officers',
      seoDesc:'SSB coaching institute in Gwalior, Madhya Pradesh for NDA, CDS, AFCAT and Agniveer aspirants.',
      maintenanceMode:false,
      twoFAEnabled:false
    },
    payments: {
      methods:{upi:true, bank:true, cash:true, gateway:false},
      upiId:'gvcssb@upi', bankName:'State Bank of India', accName:'GVC Sainik SSB Academy',
      accNumber:'XXXXXXXXXXXX1234', ifsc:'SBIN0001234',
      records:[
        {id:'p1', student:'Karan Mehta', amount:14000, method:'UPI', date:'2026-06-02'},
        {id:'p2', student:'Priya Nair', amount:11000, method:'Bank Transfer', date:'2026-06-10'}
      ]
    },
    activityLog: [],
    media: []
  };

  let DATA = JSON.parse(JSON.stringify(DEFAULTS));
  const STORAGE_KEYS = {
    courses:'content:courses', faculty:'content:faculty', selections:'content:selections', testimonials:'content:testimonials', messages:'content:messages',
    banner:'content:banner', faqs:'content:faqs', students:'content:students', settings:'content:settings',
    payments:'content:payments', activityLog:'content:activitylog', media:'content:medialist'
  };

  async function storageGet(key){
    try{
      const res = await window.storage.get(key, true);
      return res ? JSON.parse(res.value) : null;
    }catch(err){ return null; }
  }
  async function storageSet(key, value){
    try{ await window.storage.set(key, JSON.stringify(value), true); }catch(err){ console.error('Storage save failed', err); }
  }

  async function loadAllContent(){
    for (const k of Object.keys(STORAGE_KEYS)){
      const stored = await storageGet(STORAGE_KEYS[k]);
      if (stored) DATA[k] = stored;
    }
    renderCourses(); renderFaculty(); renderSelections(); renderTestimonials();
    renderBannerPublic(); renderFAQPublic(); applySettingsToPublicDOM(); renderMaintenanceScreen();
    renderAdminCounts();
  }

  function initials(name){
    return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  }

  /* ---------- Activity logging ---------- */
  async function logActivity(action, detail){
    DATA.activityLog.unshift({id:'log'+Date.now()+Math.random().toString(36).slice(2,6), time:new Date().toLocaleString(), action, detail: detail || ''});
    DATA.activityLog = DATA.activityLog.slice(0, 200);
    await storageSet(STORAGE_KEYS.activityLog, DATA.activityLog);
    const el = document.getElementById('cntActivity');
    if (el) el.textContent = DATA.activityLog.length;
  }

