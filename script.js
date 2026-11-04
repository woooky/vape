// Vape V4 Better — theme dark default + lang toggle PT/EN + FAQ + nav + reveal
(function(){
  // ---- ícones do botão de tema (SVG, sem emoji) ----
  const SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // ---- tema escuro por padrão ----
  const themeBtn = document.getElementById('themeToggle');
  let theme = localStorage.getItem('vapev4-theme') || 'dark';
  function setTheme(t){
    theme = t;
    localStorage.setItem('vapev4-theme', t);
    document.documentElement.setAttribute('data-theme', t);
    if(themeBtn) themeBtn.innerHTML = t === 'dark' ? SUN : MOON;
    if(themeBtn) themeBtn.title = t === 'dark' ? 'Mudar para claro' : 'Mudar para escuro';
  }
  if(themeBtn) themeBtn.addEventListener('click', ()=> setTheme(theme === 'dark' ? 'light' : 'dark'));
  setTheme(theme);

  const btn = document.getElementById('langToggle');
  const label = document.getElementById('langLabel');
  let lang = localStorage.getItem('vapev4-lang') || 'en';

  function setLang(l){
    lang = l;
    localStorage.setItem('vapev4-lang', l);
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
    document.querySelectorAll('[data-pt]').forEach(el=>{
      const v = l === 'pt' ? el.getAttribute('data-pt') : el.getAttribute('data-en');
      if(v !== null) el.innerHTML = v;
    });
    if(label) label.textContent = l === 'pt' ? 'EN' : 'PT';
    if(btn) btn.title = l === 'pt' ? 'Switch to English' : 'Trocar para Português';
    const main = document.querySelector('main');
    if(main && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      main.classList.remove('lang-in');
      void main.offsetWidth;
      main.classList.add('lang-in');
    }
  }

  if(btn) btn.addEventListener('click', ()=> setLang(lang === 'pt' ? 'en' : 'pt'));
  setLang(lang);

  // Direct download: the .zip is served by this site, then send the user to the tutorial.
  const downloadDirect = document.getElementById('downloadDirect');
  if(downloadDirect){
    downloadDirect.addEventListener('click', ()=>{
      const tutorial = document.getElementById('tutorial');
      const title = document.getElementById('tutorialTitle');
      if(!tutorial) return;
      history.replaceState(null, '', '#tutorial');
      if(title) title.focus({preventScroll:true});
      tutorial.scrollIntoView({
        behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block:'start'
      });
    });
  }

  // Custom player controls stay visible in native and page fullscreen modes.
  const tutorialVideo = document.getElementById('tutorialVideo');
  const player = document.getElementById('tutorialPlayer');
  const playButton = document.getElementById('tutorialPlay');
  const fullscreenButton = document.getElementById('tutorialFullscreen');
  const exitButton = document.getElementById('tutorialExit');
  if(tutorialVideo && player && playButton && fullscreenButton && exitButton){
    const status = document.getElementById('tutorialVideoStatus');
    function message(pt, en){
      if(status) status.textContent = document.documentElement.lang.startsWith('pt') ? pt : en;
    }
    playButton.addEventListener('click', async ()=>{
      try{
        message('Carregando vídeo…', 'Loading video…');
        await tutorialVideo.play();
        message('', '');
      }catch{
        message('Não foi possível reproduzir. Tente novamente ou abra o vídeo em outra aba.', 'Unable to play. Try again or open the video in a new tab.');
      }
    });
    tutorialVideo.addEventListener('playing', ()=>{player.classList.add('is-playing');message('', '');});
    tutorialVideo.addEventListener('pause', ()=>player.classList.remove('is-playing'));
    tutorialVideo.addEventListener('ended', ()=>player.classList.remove('is-playing'));
    tutorialVideo.addEventListener('error', ()=>message('Não foi possível carregar o vídeo. Abra o vídeo em outra aba.', 'Unable to load the video. Open it in a new tab.'));
    function expandInPage(){
      player.classList.add('is-expanded');
      document.body.classList.add('tutorial-expanded');
      exitButton.focus();
    }
    async function exitFullscreen(){
      player.classList.remove('is-expanded');
      document.body.classList.remove('tutorial-expanded');
      try{
        if(document.fullscreenElement) await document.exitFullscreen();
        else if(document.webkitFullscreenElement) document.webkitExitFullscreen();
      }catch{ /* Page expansion is already cleared. */ }
      fullscreenButton.focus({preventScroll:true});
    }
    fullscreenButton.addEventListener('click', async ()=>{
      // Expand immediately so the control works even when native fullscreen is denied.
      expandInPage();
      try{
        if(player.requestFullscreen && document.fullscreenEnabled !== false){
          await player.requestFullscreen();
        }else if(player.webkitRequestFullscreen){
          player.webkitRequestFullscreen();
        }else if(tutorialVideo.webkitEnterFullscreen && tutorialVideo.readyState >= 1){
          tutorialVideo.webkitEnterFullscreen();
        }
      }catch{ /* Keep the expanded player as a working fallback. */ }
    });
    exitButton.addEventListener('click', exitFullscreen);
    document.addEventListener('keydown', event=>{
      if(event.key === 'Escape' && player.classList.contains('is-expanded')) exitFullscreen();
    });
    function syncFullscreen(){
      if(!document.fullscreenElement && !document.webkitFullscreenElement){
        player.classList.remove('is-expanded');
        document.body.classList.remove('tutorial-expanded');
      }
    }
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    tutorialVideo.addEventListener('webkitendfullscreen', syncFullscreen);
  }

  // ---- reveal ao descer a página ----
  const revealEls = document.querySelectorAll('.duo-card,.trio-card,.mini,.step,.faq,.mock,.price,.suggest-card,.art-card,.alert');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, {threshold: 0.12});
    revealEls.forEach(el=>{ el.classList.add('reveal'); io.observe(el); });
  }

  // copiar nick do Discord
  const discordNick = 'wooooooky';
  async function copyDiscord(){
      try{ await navigator.clipboard.writeText(discordNick); }
    catch(e){
      const t = document.createElement('textarea');
      t.value = discordNick; document.body.appendChild(t); t.select();
      try{ document.execCommand('copy'); }catch(_){}
      t.remove();
    }
    const msg = document.getElementById('copyMsg');
    const done = document.documentElement.lang.startsWith('pt')
      ? 'Nick copiado! É só colar no Discord e me chamar.'
      : 'Username copied! Just paste it on Discord and message me.';
    if(msg) msg.textContent = done;
  }
  const copyBtn = document.getElementById('copyNick');
  const copyBtn2 = document.getElementById('copyNick2');
  if(copyBtn) copyBtn.addEventListener('click', copyDiscord);
  if(copyBtn2) copyBtn2.addEventListener('click', copyDiscord);

  // FAQ accordion
  document.querySelectorAll('.faq').forEach(faq=>{
    const q = faq.querySelector('.faq-q');
    const a = faq.querySelector('.faq-a');
    function sync(){
      if(faq.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
      else a.style.maxHeight = '0px';
    }
    if(q) q.addEventListener('click', ()=>{
      const wasOpen = faq.classList.contains('open');
      document.querySelectorAll('.faq.open').forEach(o=>{ o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight='0px'; });
      if(!wasOpen) faq.classList.add('open');
      sync();
      if(!wasOpen) a.style.maxHeight = a.scrollHeight + 'px';
    });
    sync();
    window.addEventListener('resize', sync);
  });
  // abre o primeiro
  const first = document.querySelector('.faq .faq-a');
  if(first) first.style.maxHeight = first.scrollHeight + 'px';

  // mobile menu
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if(ham && links) ham.addEventListener('click', ()=>{
    const open = links.classList.toggle('show');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', String(open));
  });
  if(links) links.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ links.classList.remove('show'); if(ham){ ham.classList.remove('open'); ham.setAttribute('aria-expanded','false'); } }));

  // navbar shadow + back to top
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', ()=>{
    if(nav) nav.style.boxShadow = window.scrollY > 10 ? '0 10px 30px rgba(0,0,0,.4)' : 'none';
  });
  const top = document.getElementById('backTop');
  if(top) top.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();
