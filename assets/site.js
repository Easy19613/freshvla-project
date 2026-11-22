(() => {
  const root = document.documentElement;
  root.classList.add('enhanced');

  const theme = document.querySelector('#theme');
  const modeKey = 'freshvla-mode-' + (root.dataset.palette || 'paper');
  function setMode(dark) {
    root.dataset.mode = dark ? 'dark' : 'light';
    theme.setAttribute('aria-pressed', String(dark));
    theme.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }
  let dark = false;
  try { dark = localStorage.getItem(modeKey) === 'dark'; } catch {}
  setMode(dark);
  theme.addEventListener('click', () => {
    setMode(root.dataset.mode !== 'dark');
    try { localStorage.setItem(modeKey, root.dataset.mode); } catch {}
  });

  const menu = document.querySelector('#menu');
  const nav = document.querySelector('#nav-links');
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
  });
  nav.addEventListener('click', closeMenu);
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  const sections = Array.from(nav.querySelectorAll('a'), link => ({
    link, section: document.querySelector(link.hash)
  })).sort((a, b) => a.section.offsetTop - b.section.offsetTop);
  function activeSection() {
    const current = sections.filter(item => item.section.getBoundingClientRect().top <= 115).pop();
    sections.forEach(({link}) => {
      if (current?.link === link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  activeSection();
  window.addEventListener('scroll', activeSection, {passive:true});

  document.querySelectorAll('[data-tabs]').forEach(group => {
    const buttons = Array.from(group.querySelectorAll('[data-tab]'));
    const panels = buttons.map(button => document.getElementById(button.dataset.tab));
    group.querySelector('.tablist').setAttribute('role', 'tablist');
    function select(index) {
      buttons.forEach((button, i) => {
        button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
    }
    buttons.forEach((button, index) => {
      const panel = panels[index];
      button.id = panel.id + '-tab';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', event => {
        const keys = {ArrowLeft:(index + buttons.length - 1) % buttons.length,
          ArrowRight:(index + 1) % buttons.length, Home:0, End:buttons.length - 1};
        if (!Object.hasOwn(keys, event.key)) return;
        event.preventDefault();
        select(keys[event.key]);
        buttons[keys[event.key]].focus();
      });
    });
    select(0);
  });

  const dialog = document.querySelector('#lightbox');
  const image = dialog.querySelector('img');
  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-zoom]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        image.src = link.href;
        image.alt = link.dataset.caption || link.querySelector('img')?.alt || 'FreshVLA figure';
        dialog.showModal();
      });
    });
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }

  const copy = document.querySelector('#copy');
  const citation = document.querySelector('#citation');
  const status = document.querySelector('#copy-status');
  let statusTimer;
  copy.addEventListener('click', async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(citation.textContent);
      copied = true;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(citation);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try { copied = document.execCommand('copy'); } catch {}
      if (copied) selection.removeAllRanges();
    }
    copy.querySelector('span').textContent = copied ? 'Copied' : 'Selected';
    status.textContent = copied ? 'Citation copied.' : 'Citation selected. Use your device’s copy command.';
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      copy.querySelector('span').textContent = 'Copy';
      status.textContent = '';
    }, 2500);
  });
})();
