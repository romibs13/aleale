/* Membatik Khas Ketapang — Canvas 2D mandiri, tanpa aset atau dependensi.
 * Semua state dibatasi pada sesi; destroy() membersihkan listener dan animasi.
 */
(() => {
  'use strict';
  const W=480,H=580,CREAM='#F5EEDB',GOLD='#E6B44C';
  const dialog=document.createElement('dialog');dialog.id='batik-game';
  dialog.setAttribute('aria-labelledby','bp-title');
  dialog.innerHTML=`<div class="bp-shell">
    <header class="bp-header"><div><span class="bp-eyebrow">Bekesah Sejarah / Lokakarya</span><h2 id="bp-title">Membatik Khas Ketapang</h2><strong id="bp-stage"></strong></div><div class="bp-score"><small>Ketepatan pola</small><b id="bp-score">0%</b></div><button class="bp-close" aria-label="Tutup game dan kembali ke cerita">✕</button></header>
    <ol class="bp-steps" aria-label="Tahapan membatik"><li>Mencanting</li><li>Mewarnai</li><li>Melorod</li></ol>
    <main class="bp-workspace"><div class="bp-gawangan"><canvas id="bp-canvas" width="480" height="580" tabindex="0" aria-label="Kain bermotif pucuk rebung. Seret jari mengikuti garis putus-putus untuk mencanting."></canvas><i></i></div>
    <div class="bp-controls"><p id="bp-help"></p><p id="bp-status" role="status" aria-live="polite"></p><progress id="bp-progress" max="100" value="0" aria-label="Kelengkapan garis canting"></progress><div class="bp-palette" role="group" aria-label="Palet warna tradisional" hidden></div><button class="bp-primary" id="bp-next">Lanjut Mewarnai</button><button class="bp-secondary" id="bp-assist">Bantu canting satu motif</button><details class="bp-note"><summary>Tentang motif dan teknik</summary><p>Eksplorasi digital Pucuk Rebung dengan teknik canting yang disederhanakan. Kain Pelangi Ketapang dikenal dengan teknik melangi; permainan ini bukan rekonstruksi proses pembuatannya.</p></details></div></main>
    <section class="bp-result" hidden role="dialog" aria-modal="true" aria-labelledby="bp-result-title"><div class="bp-result-card"><span class="bp-eyebrow">Sehelai cerita, karya tanganmu</span><h2 id="bp-result-title">Pengrajin Muda Ketapang</h2><div class="bp-result-art"><canvas id="bp-preview" width="240" height="290" aria-label="Hasil karya batik"></canvas><span>P U C U K &nbsp; R E B U N G</span></div><p id="bp-final"></p><div class="bp-philosophy"><strong>Pucuk Rebung · Tumbuh dengan budi</strong><p>Terinspirasi tunas bambu, Pucuk Rebung umum dikenal dalam ragam hias Melayu sebagai lambang pertumbuhan dan harapan. Dalam karya ini, bentuknya mengajak kita belajar dengan tekun dan tetap mengingat akar budaya.</p></div><div class="bp-result-actions"><button class="bp-primary" id="bp-save">Simpan Batik (PNG)</button><button class="bp-secondary" id="bp-replay">Main Lagi</button><button class="bp-secondary" id="bp-back">Kembali ke Cerita</button></div><p id="bp-download-status" role="status"></p></div></section>
  </div>`;
  document.body.append(dialog);
  const q=id=>dialog.querySelector('#'+id),canvas=q('bp-canvas'),ctx=canvas.getContext('2d');
  const colors=[['Sogan Cokelat','#855335'],['Hijau Zamrud','#227461'],['Biru Indigo','#334b80'],['Merah Kesumba','#b64c45'],['Kuning Emas',GOLD]];
  colors.forEach(([name,value],i)=>{const b=document.createElement('button');b.type='button';b.className='bp-swatch';b.style.setProperty('--swatch',value);b.dataset.color=value;b.setAttribute('aria-label',name);b.title=name;b.setAttribute('aria-pressed',String(i===0));dialog.querySelector('.bp-palette').append(b);});
  // Pola tertutup dari koordinat kurva kuadratik; titik panduan dipakai untuk tracing.
  function quadratic(a,b,c,t){const u=1-t;return{x:u*u*a.x+2*u*t*b.x+t*t*c.x,y:u*u*a.y+2*u*t*b.y+t*t*c.y};}
  function createMotifs(){const motifs=[];
    for(let row=0;row<3;row++)for(let col=0;col<2;col++){
      const x=132+col*216,y=48+row*174,points=[];
      const tip={x,y},right={x:x+76,y:y+137},base={x,y:y+116},left={x:x-76,y:y+137};
      const curves=[[tip,{x:x+22,y:y+80},right],[right,{x:x+32,y:y+133},base],[base,{x:x-32,y:y+133},left],[left,{x:x-22,y:y+80},tip]];
      for(const curve of curves)for(let i=0;i<30;i++)points.push(quadratic(...curve,i/30));
      const path=new Path2D();path.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>path.lineTo(p.x,p.y));path.closePath();
      motifs.push({points,path,marked:new Uint8Array(points.length),color:null,bloom:null});
    }return motifs;
  }
  // Tekstur serat kain dibuat sekali, digunakan ulang dalam setiap frame dan ekspor.
  const fabric=document.createElement('canvas');fabric.width=W;fabric.height=H;
  const fc=fabric.getContext('2d');fc.fillStyle=CREAM;fc.fillRect(0,0,W,H);
  for(let x=0;x<W;x+=3){fc.strokeStyle=x%2?'#876b2510':'#ffffff55';fc.beginPath();fc.moveTo(x,0);fc.lineTo(x,H);fc.stroke();}
  for(let y=0;y<H;y+=3){fc.strokeStyle=y%2?'#876b2510':'#ffffff44';fc.beginPath();fc.moveTo(0,y);fc.lineTo(W,y);fc.stroke();}
  let session=null;
  function percentage(){const all=session.motifs.flatMap(m=>Array.from(m.marked));return Math.floor(100*all.reduce((a,b)=>a+b,0)/all.length);}
  function listen(target,event,fn,options={}){target.addEventListener(event,fn,{...options,signal:session.abort.signal});}
  function updateUI(){
    const s=session,score=percentage();q('bp-score').textContent=score+'%';q('bp-progress').value=score;
    q('bp-stage').textContent=['TAHAP 1: MENCANTING','TAHAP 2: MEWARNAI','TAHAP 3: MELOROD'][Math.min(s.stage,2)];
    dialog.querySelectorAll('.bp-steps li').forEach((el,i)=>{if(i===s.stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    q('bp-help').textContent=['Seret ujung canting mengikuti garis putus-putus. Capai 70% garis untuk lanjut; teruskan hingga 100% jika ingin hasil terbaik.','Pilih warna, lalu ketuk bagian dalam setiap pucuk rebung. Warna dapat diganti sebelum melorod.','Celupkan kain untuk mengangkat malam. Garis motif akan muncul terang di antara warna.'][Math.min(s.stage,2)];
    q('bp-status').textContent=s.stage===0?`${score}% garis dicanting tepat${s.assisted?' · dengan bantuan':''}`:s.stage===1?`${s.motifs.filter(m=>m.color).length} / 6 motif diwarnai · ${s.colorName}`:s.dipping?'Malam meluruh, motif mulai bersinar…':'Kain siap dicelup air panas.';
    q('bp-next').textContent=['Lanjut Mewarnai','Proses Melorod','Celup Air Panas'][Math.min(s.stage,2)];
    q('bp-next').disabled=s.stage===0?score<70:s.stage===1?s.motifs.some(m=>!m.color):s.dipping;
    q('bp-progress').hidden=s.stage!==0;q('bp-assist').hidden=s.stage!==0;
    dialog.querySelector('.bp-palette').hidden=s.stage!==1;
    canvas.setAttribute('aria-label',s.stage===0?'Ikuti garis motif dengan jari atau gunakan tombol bantuan canting.':s.stage===1?'Ketuk bagian dalam motif untuk mewarnai. Alternatif keyboard: tekan angka 1 sampai 6.':'Kain siap melorod. Gunakan tombol Celup Air Panas.');
  }
  // Renderer kanvas: warna diserap hanya di dalam path motif, tertahan garis malam.
  function render(target=ctx,finished=false,now=performance.now()){
    const s=session;target.clearRect(0,0,W,H);target.drawImage(fabric,0,0);
    target.strokeStyle='#b5944b';target.lineWidth=2;target.strokeRect(15,15,W-30,H-30);
    target.setLineDash([2,6]);target.strokeRect(24,24,W-48,H-48);target.setLineDash([]);
    const reveal=finished?1:s.reveal;
    for(const m of s.motifs){
      if(m.color){
        target.save();target.clip(m.path);
        if(m.bloom&&!finished){target.fillStyle=m.bloom.previous||CREAM;target.fillRect(0,0,W,H);const t=Math.min(1,(now-m.bloom.start)/650),r=1+(1-(1-t)**3)*220;const g=target.createRadialGradient(m.bloom.x,m.bloom.y,0,m.bloom.x,m.bloom.y,r);g.addColorStop(0,m.color);g.addColorStop(.8,m.color);g.addColorStop(1,m.color+'00');target.fillStyle=g;target.fillRect(0,0,W,H);if(t===1)m.bloom=null;}
        else{target.fillStyle=m.color;target.fillRect(0,0,W,H);}
        target.globalAlpha=.18;target.globalCompositeOperation='multiply';target.drawImage(fabric,0,0);target.restore();
      }
      if(s.stage===0&&!finished){
        target.strokeStyle='#a58b6488';target.lineWidth=2;target.setLineDash([4,5]);target.stroke(m.path);target.setLineDash([]);
        target.strokeStyle='#94602c';target.lineWidth=5;target.lineCap='round';target.beginPath();
        m.points.forEach((p,i)=>{if(m.marked[i]){const next=m.points[(i+1)%m.points.length];target.moveTo(p.x,p.y);target.lineTo(next.x,next.y);}});target.stroke();
      }else{
        target.lineWidth=5;target.strokeStyle='#92602e';target.stroke(m.path);
        target.save();target.globalAlpha=reveal;target.strokeStyle='#fff9e9';target.stroke(m.path);target.restore();
        // Tulang dan titik hias terinspirasi tunas bambu.
        const top=m.points[0];target.strokeStyle=reveal>.5?'#fff2cc':'#b68a46';target.lineWidth=2;target.beginPath();target.moveTo(top.x,top.y+40);target.lineTo(top.x,top.y+106);target.stroke();
        for(const side of [-1,1])for(let i=0;i<3;i++){target.beginPath();target.arc(top.x+side*(12+i*7),top.y+81+i*10,2,0,Math.PI*2);target.fillStyle=target.strokeStyle;target.fill();}
      }
    }
    if(!finished){
      for(const p of s.particles){target.save();target.globalAlpha=Math.max(0,p.life)*.3;target.fillStyle='#fff6dc';target.beginPath();target.arc(p.x,p.y,p.radius,0,Math.PI*2);target.fill();target.restore();}
      if(s.pointer&&s.stage===0){const p=s.pointer;target.save();target.translate(p.x,p.y);target.rotate(-.5);target.strokeStyle='#6b4025';target.lineWidth=7;target.beginPath();target.moveTo(1,-4);target.lineTo(30,-40);target.stroke();target.fillStyle='#c88d36';target.beginPath();target.ellipse(9,-13,9,6,-.5,0,Math.PI*2);target.fill();target.fillStyle='#76421f';target.beginPath();target.arc(0,0,3,0,Math.PI*2);target.fill();target.restore();}
    }
  }
  function point(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*W/rect.width,y:(e.clientY-rect.top)*H/rect.height};}
  function smoke(x,y,steam=false){const s=session;if(s.particles.length>70)return;s.particles.push({x,y,life:1,radius:steam?8+Math.random()*10:2+Math.random()*3,vx:(Math.random()-.5)*(steam?20:8),vy:steam?-40:-18});}
  function trace(p){
    const s=session,prev=s.pointer||p,length=Math.hypot(p.x-prev.x,p.y-prev.y),steps=Math.max(1,Math.ceil(length/5));
    for(let i=0;i<=steps;i++){const t=i/steps,x=prev.x+(p.x-prev.x)*t,y=prev.y+(p.y-prev.y)*t;
      for(const m of s.motifs)for(let j=0;j<m.points.length;j++){const q=m.points[j];if((q.x-x)**2+(q.y-y)**2<13**2)m.marked[j]=1;}
    }
    s.pointer=p;smoke(p.x,p.y);updateUI();
  }
  function paint(index,p){const s=session,m=s.motifs[index];if(!m)return;m.bloom={previous:m.color,x:p?.x??m.points[0].x,y:p?.y??m.points[0].y+90,start:performance.now()};m.color=s.color;updateUI();}
  function clearPointer(e){if(!session)return;if(session.pointerId===e.pointerId){session.pointerId=null;session.pointer=null;}}
  function next(){const s=session;if(q('bp-next').disabled)return;
    if(s.stage<2){s.stage++;s.pointer=null;updateUI();q('bp-next').focus();}
    else if(!s.dipping){s.dipping=true;s.dipStart=performance.now();updateUI();}
  }
  function result(){
    const s=session;s.stage=3;s.pointer=null;render(ctx,true);
    const preview=q('bp-preview').getContext('2d');preview.save();preview.scale(.5,.5);render(preview,true);preview.restore();
    q('bp-final').textContent=`Ketepatan pola ${percentage()}% · ${s.assisted?'Dibuat dengan bantuan canting.':'Setiap garis adalah hasil ketekunanmu.'}`;
    q('bp-download-status').textContent='';dialog.querySelector('.bp-result').hidden=false;dialog.querySelector('.bp-workspace').hidden=true;dialog.querySelector('.bp-steps').hidden=true;dialog.classList.add('bp-finished');q('bp-stage').textContent='KARYAMU SELESAI';dialog.scrollTop=0;q('bp-save').focus({preventScroll:true});
    dialog.querySelector('.bp-workspace').inert=true;
  }
  function tick(now){const s=session;if(!s)return;const dt=s.last?Math.min(.05,(now-s.last)/1000):0;s.last=now;
    if(!document.hidden){
      if(s.dipping&&s.stage===2){s.reveal=Math.min(1,(now-s.dipStart)/2400);for(let i=0;i<2;i++)smoke(40+Math.random()*400,120+Math.random()*400,true);if(s.reveal===1)result();}
      for(const p of s.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.radius+=dt*4;}s.particles=s.particles.filter(p=>p.life>0);
      if(s.stage!==3)render(ctx,false,now);
    }
    if(s.stage!==3)s.raf=requestAnimationFrame(tick);
  }
  function reset(){const s=session;cancelAnimationFrame(s.raf);s.stage=0;s.motifs=createMotifs();s.particles=[];s.pointer=null;s.pointerId=null;s.reveal=0;s.dipping=false;s.assisted=false;s.last=0;s.color=colors[0][1];s.colorName=colors[0][0];
    dialog.querySelectorAll('.bp-swatch').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===0)));
    dialog.querySelector('.bp-result').hidden=true;dialog.querySelector('.bp-workspace').hidden=false;dialog.querySelector('.bp-steps').hidden=false;dialog.classList.remove('bp-finished');dialog.querySelector('.bp-workspace').inert=false;dialog.scrollTop=0;updateUI();render();s.raf=requestAnimationFrame(tick);canvas.focus();
  }
  function save(){const output=document.createElement('canvas');output.width=W;output.height=H;render(output.getContext('2d'),true);
    const current=session;output.toBlob(blob=>{if(!blob||session!==current)return;const url=URL.createObjectURL(blob);session.urls.add(url);const a=document.createElement('a');a.href=url;a.download='batik-pucuk-rebung-ketapang.png';document.body.append(a);a.click();a.remove();q('bp-download-status').textContent='PNG disiapkan. Jika unduhan tidak muncul, periksa daftar unduhan browser.';},'image/png');
  }
  function destroy(){if(!session)return;const s=session;session=null;cancelAnimationFrame(s.raf);s.abort.abort();s.urls.forEach(url=>URL.revokeObjectURL(url));if(s.pointerId!==null&&canvas.hasPointerCapture(s.pointerId))canvas.releasePointerCapture(s.pointerId);document.body.style.overflow=s.overflow;open=s.previousOpen;s.trigger?.focus({preventScroll:true});}
  // API pembuka yang digunakan tombol cerita dan kartu koleksi.
  window.openBatikGame=()=>{
    if(dialog.open)return;
    session={abort:new AbortController(),urls:new Set(),trigger:document.activeElement,previousOpen:open,overflow:document.body.style.overflow};
    open=true;for(const k in keys)keys[k]=0;if('speechSynthesis' in window)speechSynthesis.cancel();document.body.style.overflow='hidden';
    listen(dialog,'close',destroy);listen(dialog,'cancel',e=>{e.preventDefault();dialog.close();});
    listen(dialog.querySelector('.bp-close'),'click',()=>dialog.close());listen(q('bp-back'),'click',()=>dialog.close());
    listen(q('bp-next'),'click',next);listen(q('bp-replay'),'click',reset);listen(q('bp-save'),'click',save);
    listen(q('bp-assist'),'click',()=>{const m=session.motifs.find(m=>m.marked.some(v=>!v));if(m){m.marked.fill(1);session.assisted=true;updateUI();}});
    dialog.querySelectorAll('.bp-swatch').forEach(b=>listen(b,'click',()=>{session.color=b.dataset.color;session.colorName=b.title;dialog.querySelectorAll('.bp-swatch').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));updateUI();}));
    listen(canvas,'pointerdown',e=>{if(!e.isPrimary||session.stage>1)return;e.preventDefault();const p=point(e);if(session.stage===0){session.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);session.pointer=p;trace(p);}else{const i=session.motifs.findIndex(m=>ctx.isPointInPath(m.path,p.x,p.y));if(i>=0)paint(i,p);}});
    listen(canvas,'pointermove',e=>{if(session.stage===0&&e.pointerId===session.pointerId){e.preventDefault();trace(point(e));}});
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>listen(canvas,type,clearPointer));
    listen(canvas,'keydown',e=>{if(session.stage===1&&/^[1-6]$/.test(e.key)){e.preventDefault();paint(Number(e.key)-1);}});
    listen(dialog,'keydown',e=>{e.stopPropagation();if(!dialog.querySelector('.bp-result').hidden&&e.key==='Tab'){
      const controls=[dialog.querySelector('.bp-close'),q('bp-save'),q('bp-replay'),q('bp-back')],i=controls.indexOf(document.activeElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();
    }});
    ['keyup','pointerdown','pointermove','pointerup','click'].forEach(type=>listen(dialog,type,e=>e.stopPropagation()));
    listen(window,'blur',()=>{if(session){session.pointer=null;session.pointerId=null;}});
    dialog.showModal();reset();
  };
})();
