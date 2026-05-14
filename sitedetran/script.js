/* =============================================
   DETRAN-PB — Redesign 2025
   script.js
   ============================================= */

// ─── UTILITÁRIOS ───────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ─── ACESSIBILIDADE: FONTE ────────────────────
const fontLevels = ['font-sm', '', 'font-lg', 'font-xl'];
let fontLevel = 1;

function adjustFont(dir) {
  document.body.classList.remove(...fontLevels.filter(Boolean));
  if (dir === 0) { fontLevel = 1; return; }
  fontLevel = Math.max(0, Math.min(3, fontLevel + dir));
  if (fontLevels[fontLevel]) document.body.classList.add(fontLevels[fontLevel]);
}

// ─── ACESSIBILIDADE: CONTRASTE ────────────────
function toggleContrast() {
  const on = document.body.classList.toggle('high-contrast');
  $('contrast-btn').textContent = on ? 'Contraste normal' : 'Alto contraste';
}

// ─── HAMBURGER / MENU MOBILE ─────────────────
const hamburger = $('hamburger');
const nav = $('main-nav');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  nav.classList.toggle('mobile-open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// fechar ao clicar num link do menu mobile
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('mobile-open')) {
      hamburger.classList.remove('open');
      nav.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
});

// ─── BARRA DE BUSCA ──────────────────────────
const SUGESTOES = [
  'Renovação de CNH',
  '1ª Habilitação (CNH)',
  'Transferência de veículo',
  'Licenciamento anual',
  'Consulta de multas',
  'Recurso de multa (JARI)',
  'CRLV digital',
  'Vistoria veicular',
  'Mudança de categoria',
  'Segunda via de CNH',
  'Permissão Internacional de Dirigir',
  'Agendamento presencial',
  'Ciretrans',
  'Pontuação na CNH',
  'Suspensão de CNH',
];

$('btn-search').addEventListener('click', openSearch);
function openSearch() {
  const bar = $('search-bar');
  bar.classList.add('open');
  bar.setAttribute('aria-hidden', 'false');
  setTimeout(() => $('search-input').focus(), 50);
}
function closeSearch() {
  $('search-bar').classList.remove('open');
  $('search-bar').setAttribute('aria-hidden', 'true');
  $('search-suggestions').innerHTML = '';
  $('search-suggestions').classList.remove('visible');
  $('search-input').value = '';
}

$('search-input').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  const cont = $('search-suggestions');
  if (!q) { cont.innerHTML = ''; cont.classList.remove('visible'); return; }
  const matches = SUGESTOES.filter(s => s.toLowerCase().includes(q)).slice(0, 6);
  if (!matches.length) { cont.innerHTML = ''; cont.classList.remove('visible'); return; }
  cont.innerHTML = matches.map(s =>
    `<div class="sugg-item" tabindex="0" role="option" onclick="selectSugg('${s}')">${highlight(s, q)}</div>`
  ).join('');
  cont.classList.add('visible');
});

function highlight(text, query) {
  const re = new RegExp(`(${query})`, 'gi');
  return text.replace(re, '<strong>$1</strong>');
}

function selectSugg(text) {
  $('search-input').value = text;
  $('search-suggestions').classList.remove('visible');
  doSearch();
}

function doSearch() {
  const q = $('search-input').value.trim();
  if (!q) return;
  alert(`Buscando por: "${q}"\n\n(Em produção, esta busca consultaria o sistema oficial do DETRAN-PB.)`);
  closeSearch();
}

$('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
  if (e.key === 'Escape') closeSearch();
});

// ─── CONSULTA RÁPIDA: TABS ────────────────────
$$('.qtab').forEach(tab => {
  tab.addEventListener('click', function () {
    $$('.qtab').forEach(t => t.classList.remove('active'));
    $$('.qtab-content').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    $('tab-' + this.dataset.tab).classList.add('active');
  });
});

// máscaras simples
function maskCPF(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  el.value = v;
}
const cpfInput = $('cpf-input');
if (cpfInput) cpfInput.addEventListener('input', () => maskCPF(cpfInput));

const agCpf = $('ag-cpf');
if (agCpf) agCpf.addEventListener('input', () => maskCPF(agCpf));

const contCpfLike = $('cont-nome'); // só para o form de contato não precisa de máscara

// máscara placa
const placa = $('placa-input');
if (placa) {
  placa.addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  });
}

// ─── MODAIS DE RESULTADO ──────────────────────
function openModal(title, bodyHTML) {
  $('modal-title').textContent = title;
  $('modal-body').innerHTML = bodyHTML;
  const overlay = $('modal-overlay');
  overlay.removeAttribute('hidden');
  overlay.querySelector('.modal-close').focus();
}
function closeModal() {
  $('modal-overlay').setAttribute('hidden', '');
}
$('modal-overlay').addEventListener('click', e => {
  if (e.target === $('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('modal-overlay').hidden) closeModal();
});

// ─── CONSULTAS (simuladas) ────────────────────
function consultarCNH() {
  const cpf = $('cpf-input').value.replace(/\D/g, '');
  if (cpf.length !== 11) { showToast('Por favor, informe um CPF válido.', 'warn'); return; }
  openModal('Consulta de CNH', `
    <div class="modal-result-item"><strong>CPF:</strong><span>${$('cpf-input').value}</span></div>
    <div class="modal-result-item"><strong>Situação:</strong><span class="modal-badge ok">Regular</span></div>
    <div class="modal-result-item"><strong>Categoria:</strong><span>B</span></div>
    <div class="modal-result-item"><strong>Validade:</strong><span>15/08/2027</span></div>
    <div class="modal-result-item"><strong>Pontos:</strong><span>0 pontos</span></div>
    <p style="margin-top:1rem;font-size:12px;color:#6b7280;">⚠️ Dados simulados para demonstração. Em produção, consulta o sistema RENACH.</p>
  `);
}

function consultarVeiculo() {
  const placa = $('placa-input').value.trim();
  if (placa.length < 7) { showToast('Por favor, informe uma placa válida.', 'warn'); return; }
  openModal('Consulta de Veículo', `
    <div class="modal-result-item"><strong>Placa:</strong><span>${placa}</span></div>
    <div class="modal-result-item"><strong>Situação:</strong><span class="modal-badge ok">Regular</span></div>
    <div class="modal-result-item"><strong>Modelo:</strong><span>Fiat Argo Drive 1.0</span></div>
    <div class="modal-result-item"><strong>Ano/Modelo:</strong><span>2022/2023</span></div>
    <div class="modal-result-item"><strong>Licenciamento:</strong><span class="modal-badge ok">Em dia (2025)</span></div>
    <div class="modal-result-item"><strong>Restrições:</strong><span>Nenhuma</span></div>
    <p style="margin-top:1rem;font-size:12px;color:#6b7280;">⚠️ Dados simulados para demonstração. Em produção, consulta o sistema RENAVAM.</p>
  `);
}

function consultarMulta() {
  const renavam = $('renavam-input').value.trim();
  if (renavam.length < 9) { showToast('Por favor, informe o RENAVAM completo.', 'warn'); return; }
  openModal('Consulta de Multas', `
    <div class="modal-result-item"><strong>RENAVAM:</strong><span>${renavam}</span></div>
    <div class="modal-result-item"><strong>Infrações abertas:</strong><span class="modal-badge ok">Nenhuma</span></div>
    <div class="modal-result-item"><strong>Débitos pendentes:</strong><span class="modal-badge ok">R$ 0,00</span></div>
    <p style="margin-top:1rem;font-size:12px;color:#6b7280;">⚠️ Dados simulados para demonstração. Em produção, consulta o sistema RENAINF.</p>
  `);
}

// ─── AGENDAMENTO ──────────────────────────────
// Define data mínima como hoje
const today = new Date().toISOString().split('T')[0];
const agData = $('ag-data');
if (agData) agData.min = today;

function agendar() {
  const ciretran = $('ag-ciretran').value;
  const servico  = $('ag-servico').value;
  const data     = $('ag-data').value;
  const cpf      = $('ag-cpf').value.replace(/\D/g, '');

  if (!ciretran || !servico || !data || cpf.length !== 11) {
    showToast('Preencha todos os campos para verificar a disponibilidade.', 'warn');
    return;
  }

  const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  openModal('Disponibilidade de Agendamento', `
    <div class="modal-result-item"><strong>Unidade:</strong><span>${ciretran}</span></div>
    <div class="modal-result-item"><strong>Serviço:</strong><span>${servico}</span></div>
    <div class="modal-result-item"><strong>Data:</strong><span>${dataFormatada}</span></div>
    <div style="margin:1.25rem 0;padding:1rem;background:#e8f5e8;border-radius:8px;">
      <p style="font-weight:600;color:#007a00;margin-bottom:0.5rem;">✅ Horários disponíveis</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:0.5rem;">
        ${['08:00','08:30','09:00','09:30','10:00','14:00','14:30','15:00'].map(h =>
          `<button onclick="confirmarHorario('${h}')" style="padding:6px 14px;border:1.5px solid #00a300;border-radius:6px;background:#fff;color:#007a00;font-size:13px;font-weight:600;cursor:pointer;">${h}</button>`
        ).join('')}
      </div>
    </div>
    <p style="font-size:12px;color:#6b7280;">⚠️ Sistema de demonstração. Em produção, redirecionaria para o portal oficial de agendamento.</p>
  `);
}

function confirmarHorario(hora) {
  closeModal();
  showToast(`✅ Agendamento às ${hora} registrado! Você receberá a confirmação por e-mail.`, 'ok');
}

// ─── FILTRO DE SERVIÇOS ──────────────────────
$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    $$('.service-card').forEach(card => {
      const show = filter === 'todos' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
      if (show) {
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'cardIn .25s ease forwards';
        });
      }
    });
  });
});

// animar entrada dos cards
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes cardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`;
document.head.appendChild(styleEl);

// ─── CIRETRANS ───────────────────────────────
const CIRETRANS = [
  { cidade: 'João Pessoa', tipo: 'Sede', endereco: 'Av. Monsenhor Walfredo Leal, 484 — Tambiá', tel: '(83) 3218-8500', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Campina Grande', tipo: 'Regional', endereco: 'R. Presidente Epitácio Pessoa, 1000', tel: '(83) 3321-0000', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Patos', tipo: 'Regional', endereco: 'Av. Presidente Getúlio Vargas, 500', tel: '(83) 3421-1234', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Sousa', tipo: 'Regional', endereco: 'R. Coronel João Pessoa, 200', tel: '(83) 3521-5678', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Cajazeiras', tipo: 'Regional', endereco: 'Av. Getúlio Vargas, 450', tel: '(83) 3531-9012', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Guarabira', tipo: 'Regional', endereco: 'R. Monsenhor Emídio, 300', tel: '(83) 3271-3456', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Bayeux', tipo: 'Ciretran', endereco: 'Av. Liberdade, 120', tel: '(83) 3232-7890', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Santa Rita', tipo: 'Ciretran', endereco: 'R. Manoel Agra, 55', tel: '(83) 3228-1234', horario: 'Seg–Sex, 8h–17h' },
  { cidade: 'Itabaiana', tipo: 'Ciretran', endereco: 'R. Cel. Domiciano, 70', tel: '(83) 3364-2222', horario: 'Seg–Sex, 8h–16h' },
  { cidade: 'Pombal', tipo: 'Ciretran', endereco: 'Av. Francisco Leite, 90', tel: '(83) 3431-5555', horario: 'Seg–Sex, 8h–16h' },
  { cidade: 'Monteiro', tipo: 'Ciretran', endereco: 'Praça Getúlio Vargas, 10', tel: '(83) 3351-7777', horario: 'Seg–Sex, 8h–16h' },
  { cidade: 'Esperança', tipo: 'Ciretran', endereco: 'R. Álvaro Machado, 34', tel: '(83) 3362-8888', horario: 'Seg–Sex, 8h–16h' },
];

function renderCiretrans(lista) {
  const cont = $('ciretrans-list');
  if (!lista.length) {
    cont.innerHTML = '<p style="color:#6b7280;font-size:14px;">Nenhuma unidade encontrada para esta cidade.</p>';
    return;
  }
  cont.innerHTML = lista.map(c => `
    <div class="ciretran-card">
      <h4>${c.cidade} <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:100px;background:#e8f5e8;color:#007a00;margin-left:6px;">${c.tipo}</span></h4>
      <p>📍 ${c.endereco}</p>
      <p>📞 ${c.tel}</p>
      <p>🕐 ${c.horario}</p>
    </div>
  `).join('');
}

function filtrarCiretrans(q) {
  const r = q.trim().toLowerCase();
  renderCiretrans(r ? CIRETRANS.filter(c => c.cidade.toLowerCase().includes(r)) : CIRETRANS);
}

renderCiretrans(CIRETRANS);

// ─── FORMULÁRIO DE CONTATO ───────────────────
function enviarMensagem(e) {
  e.preventDefault();
  const nome    = $('cont-nome').value.trim();
  const email   = $('cont-email').value.trim();
  const assunto = $('cont-assunto').value;
  const msg     = $('cont-msg').value.trim();

  if (!nome || !email || !assunto || !msg) {
    showToast('Preencha todos os campos antes de enviar.', 'warn');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Por favor, insira um e-mail válido.', 'warn');
    return;
  }

  const success = $('form-success');
  success.removeAttribute('hidden');
  e.target.reset();
  e.target.style.display = 'none';
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─── SCROLL: BACK TO TOP + HEADER SHADOW ─────
window.addEventListener('scroll', () => {
  const btn = $('back-to-top');
  btn.classList.toggle('visible', window.scrollY > 400);
});

// ─── TOAST / NOTIFICAÇÃO ─────────────────────
let toastTimer;
function showToast(msg, type = 'ok') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '0.75rem 1.5rem',
      borderRadius: '100px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'var(--font-body)',
      zIndex: '9999',
      boxShadow: '0 4px 20px rgba(0,0,0,.2)',
      maxWidth: '90vw',
      textAlign: 'center',
      transition: 'opacity .3s, transform .3s',
    });
  }
  clearTimeout(toastTimer);
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(-50%) translateY(10px)';

  if (type === 'ok') {
    toast.style.background = '#00a300';
    toast.style.color = '#fff';
  } else if (type === 'warn') {
    toast.style.background = '#f5c800';
    toast.style.color = '#1a2a3a';
  } else {
    toast.style.background = '#dc2626';
    toast.style.color = '#fff';
  }

  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 4000);
}

// ─── SMOOTH SCROLL PARA LINKS DE ÂNCORA ──────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── ANIMAÇÃO DE ENTRADA (Intersection Observer) ─
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }
  .reveal.revealed { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(revealStyle);

// aplica reveal nos elementos principais
document.querySelectorAll('.service-card, .noticia-card, .ciretran-card, .stat-item').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${Math.min(i * 40, 300)}ms`;
  observer.observe(el);
});