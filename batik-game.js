/* A deliberately simplified creative activity inspired by Kain Pelangi. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'batik-game';
  dialog.setAttribute('aria-labelledby', 'bp-title');
  dialog.innerHTML = `<header class="bp-header"><div><small>Lokakarya • Kerajinan Ketapang</small><h2 id="bp-title">Sehelai Pelangi Karyamu</h2></div><button class="bp-close" aria-label="Kembali ke koleksi">✕</button></header>
  <ol class="bp-steps"><li>01 · Perintang</li><li>02 · Warna</li><li>03 · Hasil</li></ol>
  <div class="bp-body"><div class="bp-cloth"><svg viewBox="0 0 480 560" aria-label="Kain dengan 12 motif bunga pelangi" role="group"></svg></div><div class="bp-controls"><p id="bp-help"></p><p class="bp-status" aria-live="polite"></p><progress class="bp-meter" max="12" value="0" aria-label="Motif selesai"></progress><div class="bp-palette" role="group" aria-label="Pilih warna"></div><button class="btn bp-next"></button><button class="bp-reset">Mulai ulang</button><p class="bp-note">Eksplorasi digital dengan motif bunga rekaan, terinspirasi Kain Pelangi Ketapang. Tahapan disederhanakan untuk bermain, bukan panduan teknik melangi tradisional. Karya hanya tersimpan selama sesi ini.</p></div></div>`;
  document.body.append(dialog);
  const q = s => dialog.querySelector(s);
  const colors = [['Merah','#bb514b'],['Jingga','#dc8b42'],['Kuning','#e3ba50'],['Hijau','#56856b'],['Biru','#4d8fa0'],['Ungu','#8b6e98']];
  let stage = 0, wax = new Set(), painted = new Map(), color = colors[0][1], returnFocus;
  const svg = q('svg');
  const petal = 'M0 0 C-24-14-24-42 0-49 C24-42 24-14 0 0Z';
  function render() {
    svg.innerHTML = `<rect x="10" y="10" width="460" height="540" rx="3" fill="${stage === 2 ? '#315d60' : 'none'}" stroke="#bc9b59" stroke-width="2"/><rect x="20" y="20" width="440" height="520" fill="none" stroke="#bc9b59" stroke-dasharray="2 7"/>`;
    for (let i=0;i<12;i++) {
      const x = 90+(i%3)*150, y = 87+Math.floor(i/3)*130;
      const stroke = wax.has(i) ? (stage === 2 ? '#fff9e9' : '#b39755') : '#cbbf9f';
      const fill = painted.get(i) || '#fff9e9';
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform',`translate(${x} ${y})`);
      g.setAttribute('class','bp-motif');
      g.setAttribute('role','button');g.setAttribute('tabindex',stage<2?'0':'-1');
      g.setAttribute('aria-label',`Motif ${i+1}${painted.has(i)?', sudah diwarnai':wax.has(i)?', perintang siap':', belum diberi perintang'}`);
      g.innerHTML = `<circle class="bp-guide" r="59" fill="transparent" stroke="${stroke}" stroke-dasharray="${wax.has(i)?'none':'3 6'}"/>` + Array.from({length:6},(_,j)=>`<path d="${petal}" transform="rotate(${j*60})" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`).join('') + `<circle r="8" fill="${stage===2?'#e3ba50':stroke}"/>`;
      const apply = () => {if(stage===0)wax.add(i);else if(stage===1)painted.set(i,color);else return;render();svg.querySelectorAll('.bp-motif')[i]?.focus({preventScroll:true});};
      g.addEventListener('click',apply);
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();apply();}});
      svg.append(g);
    }
    const count = stage===0?wax.size:painted.size;
    q('.bp-meter').value = count;
    q('.bp-status').textContent = stage===2?'Kain Pelangi karyamu selesai!':`${count} / 12 motif ${stage===0?'diberi perintang':'diwarnai'}`;
    q('#bp-help').textContent = ['Ketuk setiap motif untuk menorehkan perintang warna. Garis emas menandai motif yang sudah siap.','Pilih warna, lalu ketuk bunga untuk mewarnainya. Gunakan beragam warna pelangi! Warna masih bisa diganti sebelum melorod.','Perintang terangkat dan menyisakan garis terang di atas kain. Selamat, kamu telah menyelesaikan sehelai karya penuh warna!'][stage];
    q('.bp-next').textContent = ['Lanjut mewarnai','Lorod & lihat hasil','Unduh karya (SVG)'][stage];
    q('.bp-next').disabled = stage<2 && count<12;
    q('.bp-palette').hidden = stage!==1;
    q('.bp-palette').style.display = stage===1?'flex':'none';
    dialog.querySelectorAll('.bp-steps li').forEach((el,i)=>{if(i===stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  }
  colors.forEach(([name,value])=>{const b=document.createElement('button');b.className='bp-swatch';b.style.background=value;b.title=name;b.setAttribute('aria-label',name);b.setAttribute('aria-pressed',String(value===color));b.onclick=()=>{color=value;dialog.querySelectorAll('.bp-swatch').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));};q('.bp-palette').append(b);});
  q('.bp-next').onclick = () => {
    if(stage<2){stage++;render();q('.bp-next').focus();return;}
    const copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.insertAdjacentHTML('afterbegin','<rect width="480" height="560" fill="#fff9e9"/>');
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='batik-pelangi-karyaku.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  q('.bp-reset').onclick=()=>{stage=0;wax.clear();painted.clear();render();};
  q('.bp-close').onclick=()=>dialog.close();
  // Isolate museum movement, shortcuts and dialog progression while crafting.
  ['keydown','keyup','pointerdown','pointermove','pointerup','click'].forEach(type=>dialog.addEventListener(type,e=>e.stopPropagation()));
  dialog.addEventListener('close',()=>{open=true;show(EXHIBITS.find(e=>e.id==='d6'));if(returnFocus?.isConnected && returnFocus.offsetParent) returnFocus.focus();else document.getElementById('cplay').focus();});
  window.openBatikGame=()=>{returnFocus=document.activeElement;closeDlg();closeCard();open=true;for(const k in keys)keys[k]=0;render();dialog.showModal();q('.bp-close').focus();};
})();
