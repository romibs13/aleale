/* A short click-to-row race inspired by the river landscape of Ketapang. */
(() => {
  const dialog=document.createElement('dialog');
  dialog.id='pawan-game';dialog.setAttribute('aria-labelledby','pw-title');
  const boat=(color,shirt)=>`<path d="M-7 25Q44 43 110 18L94 39Q31 60 4 39Z" fill="${color}" stroke="#5b402c" stroke-width="2"/><path d="M8 29Q48 40 93 25" fill="none" stroke="#f5d694" stroke-width="3"/><circle cx="44" cy="-3" r="9" fill="#c88c5b"/><path d="M34-11Q45-22 55-10Z" fill="#e6c879"/><path d="M33 28V10Q44 1 55 12L60 27" fill="${shirt}" stroke="#483c2f" stroke-width="2"/><g class="pw-paddle"><path d="M49 10L72 60" stroke="#694626" stroke-width="5" stroke-linecap="round"/><ellipse cx="75" cy="65" rx="6" ry="13" fill="#c19b56" transform="rotate(-25 75 65)"/></g><path d="M-20 49h22m-35-8h19" stroke="#d0eee1" stroke-width="3" stroke-linecap="round"/>`;
  dialog.innerHTML=`<header class="pw-header"><div><small>Ketapang · Mini game sungai</small><h2 id="pw-title">Lomba Sampan Pawan</h2></div><button class="pw-close" aria-label="Kembali ke koleksi">✕</button></header><div class="pw-body"><p class="pw-intro">Bawa sampan kuningmu lebih dulu ke garis finis! Setiap klik atau ketukan pada <strong>Dayung!</strong> membuat sampan maju. Cukup terus mendayung untuk melawan dua peserta lainnya.</p><div class="pw-score"><span>Kamu · sampan kuning</span><span class="pw-distance">0 / 120 m</span><span class="pw-strokes">0 kayuhan</span></div><div class="pw-scene"><svg viewBox="0 0 900 460" role="img" aria-label="Lintasan ilustrasi Sungai Pawan dengan sampan pemain dan dua sampan lawan"><defs><pattern id="pw-water" width="90" height="34" patternUnits="userSpaceOnUse"><path d="M9 16q14 7 28 0m20 11h19" stroke="#b8d9c7" stroke-width="2" fill="none" opacity=".45"/></pattern><pattern id="pw-check" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#f9f0d5"/><path d="M0 0h10v10H0zm10 10h10v10H10z" fill="#31514a"/></pattern></defs><rect width="900" height="460" fill="#97b48b"/><path d="M0 0H900V76Q650 104 450 78T0 91Z" fill="#607c50"/><path d="M0 82Q200 61 440 88T900 79V417Q670 398 450 424T0 420Z" fill="#68988e"/><path d="M0 82Q200 61 440 88T900 79V417Q670 398 450 424T0 420Z" fill="url(#pw-water)"/><g fill="#334f3e"><path d="M25 61V36H93V61ZM18 36L59 12 100 36Z"/><path d="M115 65V45H159V65ZM107 45L137 26 167 45Z"/></g><g fill="#d8c99c"><path d="M38 59V44H48V59ZM69 59V44H79V59Z"/><path d="M129 63V51H139V63Z"/></g><g stroke="#476644" stroke-width="5"><path d="M285 67V30m-12 12 12-18 17 19m-31-6 14-13 19 4M663 67V30m-12 12 12-18 17 19m-31-6 14-13 19 4"/></g><text x="450" y="47" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="#f8efd7">SUNGAI PAWAN</text><path d="M25 197H865M25 310H865" stroke="#d7e6bf" stroke-dasharray="8 14" opacity=".55"/><path d="M32 98V408" stroke="#e2e8ca" stroke-dasharray="5 7"/><rect x="800" y="98" width="20" height="310" fill="url(#pw-check)"/><text x="810" y="443" text-anchor="middle" font-size="16" fill="#243f35" font-weight="bold">FINIS</text><g class="pw-boat pw-player">${boat('#e2b944','#f6ead0')}<text x="42" y="-32" text-anchor="middle" font-size="17" font-weight="bold" fill="#fff6d6">KAMU</text></g><g class="pw-boat pw-rival">${boat('#b5604b','#eee0c5')}</g><g class="pw-boat pw-rival">${boat('#476b8b','#d5e6dc')}</g></svg></div><p class="pw-status" role="status" aria-live="polite"></p><div class="pw-controls"><button class="pw-row">Mulai lomba</button><button class="pw-restart">Ulangi</button></div><p class="pw-note">Klik / ketuk tombol Dayung!, atau gunakan Spasi dan Enter saat tombol terpilih. Ilustrasi lintasan dan jarak dibuat untuk permainan, bukan gambaran ukuran Sungai Pawan sebenarnya.</p></div>`;
  document.body.append(dialog);
  const q=s=>dialog.querySelector(s),boats=[...dialog.querySelectorAll('.pw-boat')];
  const FINISH=120,STEP=4;
  let phase='closed',distance=[0,0,0],strokes=0,elapsed=0,countdown=0,last=null,frame=null,strokeTimer=null,returnId='u3';
  function status(text){q('.pw-status').textContent=text;}
  function render(){
    boats.forEach((boat,i)=>boat.setAttribute('transform',`translate(${30+660*Math.min(distance[i],FINISH)/FINISH} ${[130,243,356][i]})`));
    q('.pw-distance').textContent=`${Math.min(distance[0],FINISH)} / ${FINISH} m`;
    q('.pw-strokes').textContent=`${strokes} kayuhan`;
  }
  function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;clearTimeout(strokeTimer);strokeTimer=null;boats[0].classList.remove('stroking');q('.pw-scene').classList.remove('racing');}
  function reset(){stop();phase='ready';distance=[0,0,0];strokes=0;elapsed=0;countdown=0;last=null;render();q('.pw-row').disabled=false;q('.pw-row').textContent='Mulai lomba';status('Siap berlomba? Tekan Mulai lomba, lalu dayung sampan kuningmu!');}
  function finish(won){
    phase='finished';stop();render();q('.pw-row').disabled=false;q('.pw-row').textContent='Balapan lagi';
    status(won?`Kamu menang! Sampanmu tiba pertama dengan ${strokes} kayuhan dalam ${elapsed.toFixed(1).replace('.',',')} detik.`:'Sampan lawan tiba lebih dulu. Ayo coba lagi dan ketuk Dayung! lebih sering!');
  }
  function tick(time){
    frame=null;
    if(phase!=='countdown'&&phase!=='racing')return;
    const dt=last===null||document.hidden?0:Math.min((time-last)/1000,.1);last=time;
    if(phase==='countdown'){
      countdown=Math.max(0,countdown-dt);
      if(countdown<=0){phase='racing';q('.pw-row').disabled=false;q('.pw-row').textContent='Dayung!';q('.pw-scene').classList.add('racing');status('Mulai! Terus ketuk Dayung! agar sampanmu melaju.');}
      else {const text=`Bersiap… ${Math.ceil(countdown)}`;if(q('.pw-status').textContent!==text)status(text);}
    }else{
      elapsed+=dt;distance[1]=Math.min(FINISH,distance[1]+3.1*dt);distance[2]=Math.min(FINISH,distance[2]+2.75*dt);render();
      if(distance[1]>=FINISH||distance[2]>=FINISH){finish(false);return;}
    }
    frame=requestAnimationFrame(tick);
  }
  function action(){
    if(phase==='ready'||phase==='finished'){
      reset();phase='countdown';countdown=3;q('.pw-row').disabled=true;status('Bersiap… 3');frame=requestAnimationFrame(tick);return;
    }
    if(phase!=='racing')return;
    distance[0]=Math.min(FINISH,distance[0]+STEP);strokes++;render();
    clearTimeout(strokeTimer);boats[0].classList.add('stroking');strokeTimer=setTimeout(()=>boats[0].classList.remove('stroking'),160);
    if(distance[0]>=FINISH)finish(true);
  }
  q('.pw-row').onclick=action;
  q('.pw-restart').onclick=()=>{reset();q('.pw-row').focus();};
  q('.pw-close').onclick=()=>dialog.close();
  // Native button activation provides Enter/Space support; holding a key is not a stream of strokes.
  dialog.addEventListener('keydown',e=>{if(e.repeat&&(e.key===' '||e.key==='Enter'))e.preventDefault();});
  ['keydown','keyup','pointerdown','pointermove','pointerup','click'].forEach(type=>dialog.addEventListener(type,e=>e.stopPropagation()));
  document.addEventListener('visibilitychange',()=>{last=null;});
  dialog.addEventListener('close',()=>{phase='closed';stop();show(EXHIBITS.find(e=>e.id===returnId));document.getElementById('cpawan').focus();});
  window.openPawanGame=(id='u3')=>{
    if(phase!=='closed')return;returnId=['u3','l3'].includes(id)?id:'u3';closeDlg();closeCard();open=true;for(const k in keys)keys[k]=0;reset();dialog.showModal();q('.pw-row').focus();
  };
})();
