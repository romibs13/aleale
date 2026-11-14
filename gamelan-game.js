/* Free-play instruments with synthesized sounds for creative exploration. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'gamelan-game';
  dialog.setAttribute('aria-labelledby', 'gm-title');
  const pictures = [
    '<path d="M28 14H112M34 14V81M106 14V81M23 82H117" fill="none" stroke="#916d42" stroke-width="7"/><path d="M70 14V27" stroke="#e8d6a0" stroke-width="2"/><circle cx="70" cy="49" r="29" fill="#bc914a" stroke="#e9c77c" stroke-width="3"/><circle cx="70" cy="49" r="20" fill="none" stroke="#8e672c" stroke-width="2"/><circle cx="70" cy="49" r="9" fill="#e5bb63"/>',
    '<path d="M28 19L110 31V72L28 83Z" fill="#9b5937" stroke="#d79d64" stroke-width="3"/><path d="M37 22L99 70M38 80L99 34M52 24L76 75M52 78L76 27" stroke="#e7c38d" stroke-width="2"/><ellipse cx="28" cy="51" rx="14" ry="32" fill="#ecd9ae" stroke="#9b5937" stroke-width="4"/><ellipse cx="110" cy="51" rx="9" ry="20" fill="#d6bb88" stroke="#9b5937" stroke-width="3"/>',
    '<path d="M13 65H127V80H13Z" fill="#855038"/><path d="M20 79V88M120 79V88" stroke="#b0774d" stroke-width="6"/><ellipse cx="43" cy="54" rx="23" ry="13" fill="#b38a41" stroke="#e7c578" stroke-width="3"/><ellipse cx="97" cy="54" rx="23" ry="13" fill="#b38a41" stroke="#e7c578" stroke-width="3"/><path d="M37 49V44Q43 36 49 44V49M91 49V44Q97 36 103 44V49" fill="#e7c578" stroke="#e7c578" stroke-width="2"/>'
  ];
  const names = ['Gong', 'Gendang', 'Nong-neng'];
  dialog.innerHTML = `<header class="gm-header"><div><small>Ruang Kesenian · Simulasi musik</small><h2 id="gm-title">Mainkan Bunyi Begamal</h2></div><button class="gm-close" aria-label="Kembali ke koleksi">✕</button></header><div class="gm-body"><p class="gm-intro">Ciptakan iramamu sendiri. Ketuk alat musik sesukamu atau gunakan tombol angka 1, 2, dan 3. Kamu juga bisa membunyikan beberapa alat bersamaan.</p><p class="gm-status" role="status" aria-live="polite"></p><div class="gm-instruments">${names.map((name,i)=>`<button class="gm-pad" data-pad="${i}" aria-label="Mainkan ${name}, tombol ${i+1}"><svg viewBox="0 0 140 100" aria-hidden="true">${pictures[i]}</svg><b>${name}</b><small>Ketuk / tombol ${i+1}</small></button>`).join('')}</div><div class="gm-controls"><label class="gm-volume" for="gm-volume">Volume alat musik<input id="gm-volume" type="range" min="0" max="100" value="70"></label><button class="b2 gm-sound" aria-pressed="true">Suara: aktif</button></div><p class="gm-note"><strong>Kenali, hormati, lestarikan.</strong> Begamal merupakan kesenian masyarakat Dayak Krio dari Desa Menyumbung, Hulu Sungai. Penggunaannya dalam kehidupan masyarakat mengikuti ketentuan adat. Simulasi ini menggunakan ilustrasi alat dan bunyi sintetis untuk eksplorasi, bukan rekaman alat asli atau irama upacara adat.</p></div>`;
  document.body.append(dialog);
  const q = s => dialog.querySelector(s);
  const pads = [...dialog.querySelectorAll('.gm-pad')];
  let sound=true, audio=null, master=null, savedVolume, active=false, generation=0;
  const timers = new Map();
  const voices = new Set();
  function status(text) {q('.gm-status').textContent=text;}
  function stopVoices() {voices.forEach(osc=>{try{osc.stop();}catch(_){}});voices.clear();}
  function cancel() {generation++;timers.forEach(clearTimeout);timers.clear();pads.forEach(p=>p.classList.remove('lit'));stopVoices();}
  async function prepareAudio() {
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)throw new Error('unavailable');
      if(!audio){audio=new Audio();master=audio.createGain();master.gain.value=Number(q('#gm-volume').value)/100;master.connect(audio.destination);}
      if(audio.state==='suspended')await audio.resume();
      if(audio.state!=='running')throw new Error('unavailable');
      return true;
    }catch(_){if(active)status('Suara belum tersedia. Coba ketuk alat lagi atau buka melalui browser yang mendukung audio.');return false;}
  }
  function tone(i) {
    const t=audio.currentTime;
    // Layer partials for metallic instruments; a short falling tone for the drum.
    const partials=i===0?[[110,1],[166,.42],[237,.23]]:i===1?[[190,1]]:[[440,1],[638,.32],[924,.16]];
    partials.forEach(([frequency,level])=>{
      const gain=audio.createGain(),osc=audio.createOscillator(),duration=[1.8,.28,.85][i];
      osc.type=i===1?'triangle':'sine';osc.frequency.setValueAtTime(frequency,t);
      if(i===1)osc.frequency.exponentialRampToValueAtTime(55,t+.2);
      gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.13*level,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      osc.connect(gain);gain.connect(master);voices.add(osc);
      osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration+.02);
    });
  }
  async function play(i) {
    if(!active)return;
    clearTimeout(timers.get(i));pads[i].classList.add('lit');
    timers.set(i,setTimeout(()=>{pads[i].classList.remove('lit');timers.delete(i);},220));
    if(!sound){status(`${names[i]} diketuk · suara nonaktif.`);return;}
    const token=generation;
    if(!await prepareAudio()||!active||!sound||token!==generation)return;
    // Keep rapid playing bounded while allowing overlapping instrument sounds.
    if(voices.size>=48)stopVoices();
    tone(i);status(`${names[i]} berbunyi. Lanjutkan iramamu!`);
  }
  pads.forEach((p,i)=>{
    p.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();p.focus({preventScroll:true});play(i);});
    p.addEventListener('click',e=>{if(e.detail===0)play(i);});
  });
  q('#gm-volume').addEventListener('input',()=>{if(master)master.gain.value=Number(q('#gm-volume').value)/100;});
  q('.gm-sound').onclick=()=>{
    sound=!sound;generation++;q('.gm-sound').setAttribute('aria-pressed',String(sound));q('.gm-sound').textContent=`Suara: ${sound?'aktif':'nonaktif'}`;
    if(sound){prepareAudio();status('Suara aktif. Ketuk alat untuk bermain.');}else{stopVoices();status('Suara nonaktif. Aktifkan suara untuk mendengar alat musik.');}
  };
  q('.gm-close').onclick=()=>dialog.close();
  dialog.addEventListener('keydown',e=>{if(['1','2','3'].includes(e.key)&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();if(!e.repeat)play(Number(e.key)-1);}});
  ['keydown','keyup','pointerdown','pointermove','pointerup','click'].forEach(type=>dialog.addEventListener(type,e=>e.stopPropagation()));
  dialog.addEventListener('close',()=>{active=false;cancel();if(audio)audio.suspend().catch(()=>{});if(typeof bgm!=='undefined'&&savedVolume!==undefined)bgm.volume=savedVolume;show(EXHIBITS.find(e=>e.id==='d8'));document.getElementById('cgamelan').focus();});
  window.openGamelanGame=()=>{
    closeDlg();closeCard();open=true;for(const k in keys)keys[k]=0;
    if(typeof bgm!=='undefined'){savedVolume=bgm.volume;bgm.volume=0;}
    cancel();active=true;status(sound?'Ketuk alat musik untuk mulai bermain bebas.':'Suara nonaktif. Aktifkan suara untuk mendengar alat musik.');dialog.showModal();pads[0].focus();
  };
})();
