  /* ---------- Media library ---------- */
  function renderMedia(main){
    main.innerHTML = `
      <h2>Media Library</h2>
      <p class="sub">${DATA.media.length} images stored. Images are kept as compressed data URLs in artifact storage — keep files small (under ~500KB) since each is capped at 5MB.</p>
      <div class="admin-form-panel">
        <input type="file" id="mediaInput" accept="image/png,image/jpeg,image/webp" multiple>
        <p class="form-note">JPG, PNG or WebP. Large images are automatically downscaled before saving.</p>
      </div>
      <div class="gallery-grid" id="mediaGrid" style="grid-auto-rows:140px;"></div>
    `;
    const grid = document.getElementById('mediaGrid');
    function renderGrid(){
      if (!DATA.media.length){ grid.innerHTML = '<p class="empty-note" style="grid-column:1/-1;">No images uploaded yet.</p>'; return; }
      grid.innerHTML = DATA.media.map(m => `
        <div class="g-tile" style="background:#eee;">
          <img data-src="${m.id}" style="width:100%;height:100%;object-fit:cover;" alt="${m.name}">
          <button class="row-btn danger" data-mdel="${m.id}" style="position:absolute; top:6px; right:6px; background:#fff;">✕</button>
        </div>`).join('');
      grid.querySelectorAll('img[data-src]').forEach(async img => {
        const rec = await storageGet('media:'+img.getAttribute('data-src'));
        if (rec) img.src = rec;
      });
      grid.querySelectorAll('[data-mdel]').forEach(b => b.addEventListener('click', async () => {
        const id = b.getAttribute('data-mdel');
        DATA.media = DATA.media.filter(x=>x.id!==id);
        await storageSet(STORAGE_KEYS.media, DATA.media);
        try{ await window.storage.delete('media:'+id, true); }catch(err){}
        await logActivity('Image deleted', id);
        renderAdminCounts();
        renderGrid();
      }));
    }
    renderGrid();

    document.getElementById('mediaInput').addEventListener('change', async (e) => {
      for (const file of Array.from(e.target.files)){
        const dataUrl = await downscaleImage(file, 900);
        const id = 'img'+Date.now()+Math.random().toString(36).slice(2,6);
        await storageSet('media:'+id, dataUrl);
        DATA.media.push({id, name:file.name, addedAt:new Date().toLocaleString()});
        await storageSet(STORAGE_KEYS.media, DATA.media);
      }
      await logActivity('Image(s) uploaded', `${e.target.files.length} file(s)`);
      renderAdminCounts();
      renderGrid();
      e.target.value = '';
    });
  }
  function downscaleImage(file, maxDim){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let {width, height} = img;
          if (width > maxDim || height > maxDim){
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width*scale); height = Math.round(height*scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

