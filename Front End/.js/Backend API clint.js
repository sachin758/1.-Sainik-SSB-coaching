  /* =========================================================
     BACKEND API CLIENT
     Talks to the Node/Express + PostgreSQL backend. Update
     API_BASE to your deployed API URL once you go live.
  ========================================================= */
  const API_BASE = window.GVC_API_BASE || 'http://localhost:4000/api';

  const Session = {
    get token(){ return localStorage.getItem('gvc_token'); },
    set token(t){ if (t) localStorage.setItem('gvc_token', t); else localStorage.removeItem('gvc_token'); },
    get user(){ try{ return JSON.parse(localStorage.getItem('gvc_user') || 'null'); }catch(e){ return null; } },
    set user(u){ if (u) localStorage.setItem('gvc_user', JSON.stringify(u)); else localStorage.removeItem('gvc_user'); },
    clear(){ this.token = null; this.user = null; }
  };

  // Generic API call helper. Throws an Error with a user-facing message on
  // any non-2xx response, so callers can just try/catch and show err.message.
  async function apiFetch(path, { method='GET', body, auth=true, isForm=false } = {}){
    const he