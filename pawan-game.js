/* Overlay adapter: the complete, reusable game lives in pawan-game.html. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'pawan-game';
  dialog.setAttribute('aria-label', 'Kayuh di Sungai Pawan');
  dialog.innerHTML = '<iframe title="Minigame Kayuh di Sungai Pawan" src="about:blank"></iframe><button class="pw-close" aria-label="Tutup game dan kembali ke cerita">×</button>';
  document.body.append(dialog);
  const frame = dialog.querySelector('iframe');
  let trigger, previousOpen, previousOverflow;
  const close = () => dialog.close();
  dialog.querySelector('button').onclick = close;
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  // Keep keyboard shortcuts in the museum from advancing or closing the story.
  ['keydown', 'keyup', 'pointerdown', 'pointerup', 'click'].forEach(type => dialog.addEventListener(type, e => e.stopPropagation()));
  window.addEventListener('message', e => {
    if (e.source !== frame.contentWindow || e.origin !== location.origin || !dialog.open) return;
    if (e.data?.type === 'pawan:close') close();
    if (['pawan:gameover', 'pawan:artifact'].includes(e.data?.type)) {
      // Integration point for the host application. No scores are persisted here.
      window.dispatchEvent(new CustomEvent(e.data.type, { detail: e.data.detail }));
    }
  });
  dialog.addEventListener('close', () => {
    frame.src = 'about:blank'; // Release the WebGL context, audio and animation loop.
    open = previousOpen;
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll: true });
  });
  window.openPawanGame = () => {
    if (dialog.open) return;
    trigger = document.activeElement;
    previousOpen = open;
    previousOverflow = document.body.style.overflow;
    open = true;
    for (const k in keys) keys[k] = 0;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.body.style.overflow = 'hidden';
    frame.src = 'pawan-game.html';
    dialog.showModal();
    frame.focus();
  };
})();
