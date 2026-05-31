import { animate, scroll, inView, stagger, hover, press } from "https://cdn.jsdelivr.net/npm/motion@12.40.0/+esm";

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = [0.16, 1, 0.3, 1];

/* CURSOR */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function loop(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
document.addEventListener('mousedown',()=>document.body.classList.add('clicking'));
document.addEventListener('mouseup',()=>document.body.classList.remove('clicking'));
const HOVER_SEL = 'a,button,.setor-tab,.prod-card,.filter-btn,.dif-item,.option-chip,.setor-prod-tag,.thumb,.g-cell,.g-sub';
function bindCursor(root=document){root.querySelectorAll(HOVER_SEL).forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));});}
bindCursor();

/* LOADER */
const loaderEl=document.getElementById('loader'),loaderLogo=document.getElementById('loader-logo'),loaderBar=document.getElementById('loader-bar'),loaderPct=document.getElementById('loader-pct');
document.body.style.overflow='hidden';
setTimeout(()=>loaderLogo.classList.add('show'),200);
let pct=0;const li=setInterval(()=>{pct+=Math.random()*18+4;if(pct>=100){pct=100;clearInterval(li);}loaderBar.style.width=pct+'%';loaderPct.textContent=Math.round(pct)+'%';if(pct>=100)setTimeout(()=>{loaderEl.classList.add('hidden');document.body.style.overflow='auto';},500);},120);

/* SCROLL: nav state + progress (single passive listener) */
const navEl=document.getElementById('nav');
if(REDUCE){
  window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>60);const d=document.documentElement;document.getElementById('scroll-progress').style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';},{passive:true});
}else{
  scroll(animate('#scroll-progress',{scaleX:[0,1]},{ease:'linear'}));
  window.addEventListener('scroll',()=>navEl.classList.toggle('scrolled',window.scrollY>60),{passive:true});
}

/* ============================================================
   MOBILE MENU (toggle drawer + ancoras + CTA orçamento)
============================================================ */
const navToggle=document.getElementById('nav-toggle');
const mobileMenu=document.getElementById('mobile-menu');
let menuOpen=false;
function setMenu(open){
  menuOpen=open;
  mobileMenu.classList.toggle('open',open);
  mobileMenu.setAttribute('aria-hidden',open?'false':'true');
  navToggle.setAttribute('aria-expanded',open?'true':'false');
  navToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  document.body.style.overflow=open?'hidden':'auto';
}
if(navToggle&&mobileMenu){
  navToggle.addEventListener('click',()=>setMenu(!menuOpen));
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)setMenu(false);});
  window.addEventListener('resize',()=>{if(menuOpen&&window.innerWidth>760)setMenu(false);},{passive:true});
}

/* ============================================================
   DADOS
============================================================ */
const SETORES = [
  {
    name: 'Padarias & Confeitarias',
    tagline: 'Da fermentação ideal ao forno perfeito',
    desc: 'Equipamentos de alta assepsia e carros esqueleto para armazenar e organizar assadeiras de panificação. Mesas com tampos sanitários robustos em PEAD (polietileno) perfeitos para manusear e sovar massas sem grudar, além de prateleiras sob medida.',
    prods: ['Mesas de Panificação', 'Carros Esqueleto', 'Armários Fermentadores', 'Móveis Sob Medida', 'Refrigerador Horizontal']
  },
  {
    name: 'Restaurantes, Bares & Lanchonetes',
    tagline: 'Máxima performance no ritmo acelerado do serviço',
    desc: 'Equipamentos de cocção pesada, fritadeiras eletrônicas e a gás com zona fria, fogões robustos, coifas de alta sucção, refrigeradores sob bancadas com gavetões e estações personalizadas de barman para preparo dinâmico de bebidas.',
    prods: ['Fritadeiras Industriais', 'Fogões Industriais', 'Refrigerador Horizontal', 'Mesas Drink / Bar', 'Coifas Industriais']
  },
  {
    name: 'Mercados & Supermercados',
    tagline: 'Exposição fresca, cortes precisos e organização sanitária',
    desc: 'Bancadas de processamento em açougues e peixarias, pias duplas, mesas de recepção de mercadoria de alta bitola e carros de transporte de carnes frias. Projetados sob medida para as altas normas de vigilância sanitária.',
    prods: ['Apoios de Processamento', 'Refrigerador Horizontal', 'Móveis Sob Medida', 'Coifas Industriais', 'Utensílios GN']
  },
  {
    name: 'Hospitais, Clínicas & Laboratórios',
    tagline: 'Biossegurança total e assepsia mecânica impecável',
    desc: 'Equipamentos especializados de higiene, lavatórios cirúrgicos com acionamento de cotovelo, pedal ou sensor por aproximação, cubas sanitárias ultra profundas e expurgos hidráulicos vedados de assepsia crítica (conforme ANVISA RDC 50).',
    prods: ['Lavatórios Cirúrgicos', 'Expurgos Hidráulicos', 'Cubas Sanitárias', 'Móveis Hospitalares', 'Utensílios GN']
  },
  {
    name: 'Condomínios & Áreas VIP',
    tagline: 'Lazer moderno de alta sofisticação que resiste ao tempo',
    desc: 'Salões de festas coletivos instalados com pias profundas, bancadas com churrasqueiras integradas que resistem à ferrugem externa e armários planejados com acabamento inox escovado impecável. Exemplos instalados em condomínios renomados do RS.',
    prods: ['Churrasqueiras Integradas', 'Bancadas Gourmet', 'Mesas de Buffet', 'Armários Inox', 'Coifas']
  }
];

const PRODUTOS = [
  { id:'fritadeiras', cat:'Cocção', pop:true, name:'Fritadeiras Industriais de Alta Performance', short:'Do elétrico ao gás, de 14L a 240L, com tecnologia de zona fria.',
    features:['Disponível a Gás (GLP/GN) e Elétrico (220V ou 380V Trifásico)','Capacidades de 14 litros a 240 litros para todos os volumes','Sistema de Zona Fria — resíduos decantam sem queimar, óleo dura 50% mais','Termostato de segurança com controle preciso de temperatura','Cestos robustos com cabo emborrachado e calha de escoamento rápido'],
    specs:{Material:'Aço Inox AISI 304 escovado de alta espessura',Garantia:'6 meses + assistência permanente',Dimensões:'400x800x900mm até 1200x1000x950mm (customizável)',Capacidade:'14 litros a 240 litros',Potência:'Gás alta pressão ou resistências blindadas 6kW a 18kW',Acabamento:'Inox Escovado Scotch-Brite'},
    options:[{label:'Tipo de Alimentação',values:['Fritadeira Elétrica','Fritadeira a Gás GLP','Fritadeira a Gás Natural']},{label:'Formato da Cuba',values:['Retangular (Zona Fria)','Cilíndrica','Zona Fria Tripla']},{label:'Capacidade',values:['Compacta 14 Litros','Média 28 Litros','Industrial 120 Litros','Super Industrial 240 Litros']}]
  },
  { id:'fogoes', cat:'Cocção', pop:true, name:'Fogões Industriais em Aço Inox', short:'Queimadores de alta potência com estrutura 100% reforçada em inox.',
    features:['Grelhas reforçadas de 30×30cm ou 40×40cm em ferro fundido','Queimadores de alto rendimento com regulagem precisa de chama','Chapa coletora de resíduos inferior de fácil remoção','Opção com forno acoplado integrado em inox com isolamento térmico','Pés com regulagem de altura e sapatas em polímero emborrachado'],
    specs:{Material:'Aço Inox AISI 304 ou AISI 430 estrutural reforçado',Garantia:'6 meses de garantia de fábrica',Configuração:'2, 4, 6 ou 8 bocas (sob consulta)',Carga:'Resistência dinâmica até 80kg por boca',Potência:'3.000 kcal/h a 6.000 kcal/h por queimador',Acabamento:'Inox escovado semi-brilho'},
    options:[{label:'Quantidade de Bocas',values:['2 Bocas','4 Bocas','6 Bocas','8 Bocas Sob Medida']},{label:'Forno Integrado',values:['Sem Forno (Cavalete)','Com Forno em Inox']},{label:'Tipo de Gás',values:['Baixa Pressão','Alta Pressão']}]
  },
  { id:'refrigerador', cat:'Refrigeração', pop:false, name:'Refrigerador Horizontal com Gavetas', short:'Estações de trabalho refrigeradas com tampo reforçado e gaveteiros.',
    features:['Unidade condensadora embutida e protegida com baixo nível de ruído','Isolamento em poliuretano injetado ecológico de 50mm de espessura','Gavetas preparadas para cubas Gastronorm (GN) de diversas profundidades','Controlador digital de temperatura microprocessado (−2°C a +8°C)','Tampo liso reforçado com contra-maciço em MDF naval'],
    specs:{Material:'Aço Inox AISI 304 sanitário (externo e interno)',Garantia:'6 meses + garantia de componentes e freon',Comprimentos:'1500mm, 2000mm ou sob medida',Capacidade:'200 a 600 litros de área refrigerada útil',Consumo:'Compressores 1/4 HP a 1/2 HP (220V)',Acabamento:'Inox escovado refinado contra marcas de dedos'},
    options:[{label:'Configuração de Gavetas',values:['2 Gavetas Grandes','4 Gavetas + 1 Porta de Acesso','6 Gavetas Sob Medida']},{label:'Tampo Superior',values:['Liso para preparações','Com cuba de pia integrada','Com encosto de parede (Espelho)']}]
  },
  { id:'mesas_drink', cat:'Mobiliário', pop:true, name:'Mesas Drink / Preparo de Bebidas', short:'Estações de bartender ergonômicas para preparações dinâmicas e barmen.',
    features:['Isolamento térmico em poliuretano na cuba de gelo para evitar condensação','Divisórias de gelo móveis em inox para otimização do espaço','Trilho Speed Rail integrado de fácil alcance para garrafas de destilados','Grelha escorredora embutida removível para lavagem de copos','Porta lixo integrado basculante para manutenção de limpeza'],
    specs:{Material:'Aço Inox AISI 304 de alta assepsia',Garantia:'6 meses de fábrica + suporte estrutural permanente',Comprimento:'Sob medida (1200mm a 2200mm)',Capacidade:'Cuba de gelo de até 40kg isolada',Acabamento:'Inox Satinado escovado de fácil higienização'},
    options:[{label:'Configuração de Cubas',values:['1 Cuba com Lavador de Copos','2 Cubas Separadas','Cuba + Cuba de Expurgo']},{label:'Trilho de Garrafas',values:['Trilho Simples (6 Garrafas)','Trilho Duplo (12 Garrafas)']}]
  },
  { id:'coifas', cat:'Exaustão', pop:false, name:'Coifas Industriais Sob Medida', short:'Sistemas completos de exaustão e lavagem de gases residuais.',
    features:['Modelos de parede ou de centro (Ilha) com fixação rígida','Filtros colmeia ou labirinto de inox totalmente laváveis','Calha coletora de gordura ao longo de toda a borda com dreno','Furação para saída e encaixe de dutos sob medida','Iluminação embutida vedada a prova de vapor e calor (opcional)'],
    specs:{Material:'Aço Inox AISI 304 ou AISI 430 de alta resistência a vapores',Garantia:'6 meses contra defeitos de solda ou flexão',Dimensões:'Largura e comprimento conforme bloco de fogões',Exaustão:'Até 2500m³/hora por metro linear de coifa',Acabamento:'Juntas invisíveis e polimento de luxo'},
    options:[{label:'Formato',values:['Parede','Central em Ilha','Caixa Retangular']},{label:'Filtros',values:['Labirinto Inox (Recomendado)','Alumínio Descartável']},{label:'Iluminação',values:['Com LED Integrado','Sem Iluminação']}]
  },
  { id:'panificacao', cat:'Padaria', pop:false, name:'Equipamentos de Panificação', short:'Mesas para sova com tampo em polietileno ou inox e carros auxiliares.',
    features:['Mesas de manipulação com tampo de polietileno de alta densidade alimentar','Estrutura em metalon de inox soldado com reforço extra para sova pesada','Carros esqueleto para bandejas 40×60, 60×80 ou sob medida','Armários fermentadores com isolamento térmico impecável','Gavetões em inox com trilho para farinha, grãos e açúcar'],
    specs:{Material:'Aço Inox AISI 304 sanitário e Polietileno PEAD alimentar',Garantia:'6 meses de fábrica',Comprimento:'Mesas de 1000mm a 3000mm',Capacidade:'Esqueletos para 20, 40 ou 60 assadeiras simultâneas',Acabamento:'Superfícies ultra-lisas de cantos arredondados'},
    options:[{label:'Material do Tampo',values:['Inox AISI 304 Sanitário','Polietileno Branco 20mm','Madeira Compensada Tratada']},{label:'Módulos Inferiores',values:['Prateleira Gradeada','Prateleira Lisa','3 Gavetões Inox']}]
  },
  { id:'processamento', cat:'Preparação', pop:false, name:'Apoios de Processamento de Alimentos', short:'Estações mecânicas seguras para picadores, trituradores e balanças.',
    features:['Pés robustos em tubos de inox de 2 polegadas de alta espessura','Fundo com MDF naval anti-umidade para absorção de vibração','Sapatas niveladoras robustas que corrigem irregularidades no piso','Canaletas de proteção para cabos de alimentação industrial','Abas laterais (rodapias) para evitar queda de resíduos'],
    specs:{Material:'Aço Inox AISI 304 resistente a choques mecânicos',Garantia:'6 meses',Dimensões:'Estações 800×800mm ergonômicas reguláveis',Capacidade:'Suporta impactos dinâmicos de até 250kg',Acabamento:'Soldagem TIG de alta fusão e polimento fosco'},
    options:[{label:'Energia',values:['Com tomadas industriais blindadas','Sem tomadas']},{label:'Mobilidade',values:['Pés fixos niveladores','Rodízios com Freios 360°']}]
  },
  { id:'moveis', cat:'Mobiliário', pop:true, name:'Móveis Sob Medida em Aço Inox', short:'Armários, estantes, prateleiras e bancadas totalmente adaptáveis.',
    features:['Fabricação 100% industrial em chapas de inox com espessura variável','Soldas contínuas e polidas sem frestas para impedir acúmulo de sujeira','Reforços ômega soldados sob os tampos de bancadas para estabilidade','Armários com prateleiras internas reposicionáveis e fechadura com chave','Desenhos em CAD 3D enviados para aprovação antes da fabricação'],
    specs:{Material:'AISI 304 para pias e áreas úmidas / AISI 430 para áreas secas',Garantia:'6 meses',Dimensões:'Desenvolvido conforme planta e cotas enviadas',Capacidade:'Prateleiras suportam 50kg a 150kg distribuído',Acabamento:'Escovado Scotch-Brite elegante'},
    options:[{label:'Tipo de Inox',values:['AISI 304 (Áreas Úmidas)','AISI 430 (Áreas Secas)']},{label:'Portas',values:['Sem Portas (Estante aberta)','Portas de Correr Deslizantes','Portas de Abrir com Dobradiças']}]
  },
  { id:'hospitais', cat:'Biossegurança', pop:true, name:'Equipamentos para Laboratórios e Hospitais', short:'Cubas assépticas, expurgos cirúrgicos e mobiliário de alta esterilidade.',
    features:['Cantos internos totalmente arredondados (raio ≥10mm) sem frestas','Expurgo com tampa pesada basculante e acionamento hidráulico','Torneiras com acionador de cotovelo, pedal ou sensor óptico','Alta resistência a cloro, desinfetantes e autoclaves térmicos','Acabamento ultra-polido que impede a fixação de fungos e bactérias'],
    specs:{Material:'Aço Inox AISI 304 de alta liga (antisséptico por excelência)',Garantia:'6 meses contra corrosão química superficial',Norma:'ANVISA RDC 50 de engenharia clínica',Capacidade:'Cubas profundas de 40 a 120 litros para lavagem cirúrgica',Acabamento:'Polimento espelhado sanitário total de alta reflexibilidade'},
    options:[{label:'Acionamento',values:['Pedal mecânico','Sensor eletrônico por aproximação','Alavanca de cotovelo anatômica']},{label:'Norma Técnica',values:['Padrão Sanitário Clínico RDC 50','Modelo Laboratorial Químico Especial']}]
  },
  { id:'condominios', cat:'Projetos', pop:false, name:'Cozinhas para Condomínios e Áreas Gourmet', short:'Cozinhas gourmet coletivas, salões de festa e lavanderias em inox.',
    features:['Ternos para churrasqueiras com exaustão integrada sob medida','Portas de gabinetes que resistem à salinidade e umidade externa','Mesas de buffet com pista fria ou quente integradas eletricamente','Bancadas integradas de grande extensão ideais para recepções','Instalados em condomínios renomados (ex: Piratini/RS)'],
    specs:{Material:'Aço Inox AISI 304 de extrema resistência à oxidação',Garantia:'6 meses na estrutura geral e juntas de soldadura',Dimensões:'Adequado ao layout da área gourmet',Acabamento:'Inox Escovado acetinado à prova de manchas'},
    options:[{label:'Área',values:['Salão de Festas (Interna)','Churrasqueira / Quiosque (Semicoberta)','Lavanderia de Uso Comum']},{label:'Painel Estético',values:['Minimalista Prata Clássico','Contraste com Acabamento Preto']}]
  }
];

/* galerias reais (fundo inox) — anexa hero + gallery aos produtos fotografados */
const GAL = {
  fritadeiras:  Array.from({length:13},(_,i)=>`assets/products/fritadeira1-${i+1}.png`),
  fogoes:       Array.from({length:4}, (_,i)=>`assets/products/fogao1-${i+1}.png`),
  refrigerador: Array.from({length:4}, (_,i)=>`assets/products/refrigeracao1-${i+1}.png`),
  moveis:       Array.from({length:10},(_,i)=>`assets/products/mobiliario1-${i+1}.png`),
  mesas_drink:  ['assets/products/mobiliario1-2.png'],
  coifas:       ['assets/products/exaustao-1.png'],
  panificacao:  ['assets/products/mobiliario1-4.png'],
  processamento:['assets/products/mobiliario1-8.png'],
  hospitais:    ['assets/products/mobiliario1-7.png'],
  condominios:  ['assets/products/projetos-1.png'],
};
PRODUTOS.forEach(p=>{ if(GAL[p.id]){ p.gallery=GAL[p.id]; p.hero=GAL[p.id][0]; } });

/* ============================================================
   SETORES
============================================================ */
function renderSetor(idx){
  document.querySelectorAll('.setor-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
  const s=SETORES[idx];
  document.getElementById('setor-panel-container').innerHTML=`
    <div class="setor-panel">
      <div class="setor-panel-grid">
        <div>
          <h3 class="setor-panel-name">${s.name}</h3>
          <p class="setor-panel-desc">${s.desc}</p>
          <div class="setor-prods">${s.prods.map(p=>`<span class="setor-prod-tag">${p}</span>`).join('')}</div>
        </div>
        <div class="setor-panel-side">
          <p class="setor-tagline">${s.tagline}</p>
          <a href="#quote" class="btn-primary">Solicitar projeto →</a>
        </div>
      </div>
    </div>`;
  if(!REDUCE)animate('.setor-panel',{opacity:[0,1],y:[16,0]},{duration:0.45,ease:EASE});
  bindCursor(document.getElementById('setor-panel-container'));
}
document.getElementById('setores-tabs').addEventListener('click',e=>{const t=e.target.closest('.setor-tab');if(t)renderSetor(+t.dataset.setor);});
renderSetor(0);

/* ============================================================
   PRODUTOS
============================================================ */
let activeProdId=null;
function prodCardMedia(p){
  return p.hero
    ? `<div class="prod-media"><img src="${p.hero}" alt="${p.name}" loading="lazy" width="600" height="600"></div>`
    : `<div class="prod-media prod-media--fallback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 14l4-4 5 5 3-3 6 6"/></svg></div>`;
}
function renderProds(cat){
  const grid=document.getElementById('prod-grid');
  document.getElementById('prod-detail').innerHTML=''; activeProdId=null;
  const items=cat==='all'?PRODUTOS:PRODUTOS.filter(p=>p.cat===cat);
  grid.innerHTML=items.map(p=>`
    <button class="prod-card" data-prod="${p.id}">
      ${prodCardMedia(p)}
      <div class="prod-card-body">
        <div class="prod-cat">${p.cat}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-short">${p.short}</div>
        ${p.pop?'<span class="prod-badge">★ Popular</span>':''}
      </div>
      <span class="prod-arrow">↗</span>
    </button>`).join('');
  if(!REDUCE)animate('.prod-card',{opacity:[0,1],y:[20,0]},{duration:0.5,ease:EASE,delay:stagger(0.05)});
  bindCursor(grid);
}

function openProd(id){
  const detail=document.getElementById('prod-detail');
  if(activeProdId===id){detail.innerHTML='';activeProdId=null;return;}
  activeProdId=id;
  const p=PRODUTOS.find(x=>x.id===id); if(!p)return;
  const feats=p.features.map(f=>`<li>${f}</li>`).join('');
  const specs=Object.entries(p.specs).map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('');
  const opts=(p.options||[]).map(o=>`<div class="options-group"><div class="options-group-label">${o.label}</div><div class="options-chips">${o.values.map(v=>`<button class="option-chip">${v}</button>`).join('')}</div></div>`).join('');
  const gallery=p.gallery?`
    <div class="prod-gallery">
      <div class="prod-gallery-main"><img id="gal-main" src="${p.hero}" alt="${p.name}" width="800" height="800"></div>
      ${p.gallery.length>1?`<div class="prod-thumbs">${p.gallery.map((src,i)=>`<button class="thumb${i===0?' active':''}" data-src="${src}"><img src="${src}" alt="" loading="lazy" width="120" height="120"></button>`).join('')}</div>`:''}
    </div>`:'';
  detail.innerHTML=`
    <div class="prod-detail-panel">
      <div class="prod-detail-header">
        <div><div class="prod-cat">${p.cat}</div><h3 class="prod-detail-title">${p.name}</h3></div>
        <div class="prod-detail-actions"><a href="#quote" class="btn-primary">Solicitar Orçamento →</a><button class="btn-outline" data-close>✕ Fechar</button></div>
      </div>
      <div class="prod-detail-grid">
        <div class="prod-detail-left">
          ${gallery}
          <div class="prod-features-title">Características Técnicas</div>
          <ul class="features-list">${feats}</ul>
          ${opts?`<div class="prod-options"><div class="prod-options-title">Configurações Disponíveis</div>${opts}</div>`:''}
        </div>
        <div>
          <div class="prod-specs-title">Especificações</div>
          <div class="specs-list">${specs}</div>
        </div>
      </div>
    </div>`;
  bindCursor(detail);
  if(!REDUCE)animate('.prod-detail-panel',{opacity:[0,1],y:[16,0]},{duration:0.45,ease:EASE});
  setTimeout(()=>detail.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}

function swapThumb(btn){
  const main=document.getElementById('gal-main'); if(!main)return;
  document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active')); btn.classList.add('active');
  if(REDUCE){main.src=btn.dataset.src;return;}
  animate(main,{opacity:[1,0]},{duration:0.15}).then(()=>{main.src=btn.dataset.src;animate(main,{opacity:[0,1]},{duration:0.25,ease:EASE});});
}

document.getElementById('filter-bar').addEventListener('click',e=>{const b=e.target.closest('.filter-btn');if(!b)return;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProds(b.dataset.cat);});
document.getElementById('produtos').addEventListener('click',e=>{
  const card=e.target.closest('.prod-card'); if(card){openProd(card.dataset.prod);return;}
  const thumb=e.target.closest('.thumb'); if(thumb){swapThumb(thumb);return;}
  if(e.target.closest('[data-close]')){document.getElementById('prod-detail').innerHTML='';activeProdId=null;return;}
  const chip=e.target.closest('.option-chip'); if(chip){chip.classList.toggle('selected');}
});
renderProds('all');

/* ============================================================
   FORM
============================================================ */
const qs=document.getElementById('quote-submit');
if(qs)qs.addEventListener('click',()=>{
  qs.textContent='✓ Solicitação enviada — retorno em até 24h';
  qs.style.background='var(--bg4)';qs.style.color='var(--accent)';qs.style.border='1px solid var(--accent)';qs.disabled=true;
  if(!REDUCE)animate(qs,{scale:[0.98,1]},{type:'spring',visualDuration:0.3,bounce:0.2});
});

/* ============================================================
   REVEAL + STAGGER (Motion)
============================================================ */
function reveal(){
  if(REDUCE){document.querySelectorAll('[data-reveal],[data-reveal-item]').forEach(el=>el.classList.add('reveal-done'));return;}
  document.querySelectorAll('[data-reveal]').forEach(el=>{
    const y=parseInt(el.dataset.reveal||'40',10);
    const stop=inView(el,()=>{animate(el,{opacity:[0,1],y:[y,0]},{duration:0.7,ease:EASE});el.classList.add('reveal-done');stop();},{amount:0.2,margin:'0px 0px -60px 0px'});
  });
  document.querySelectorAll('[data-reveal-group]').forEach(group=>{
    const kids=group.querySelectorAll('[data-reveal-item]');
    if(!kids.length)return;
    const stop=inView(group,()=>{animate(kids,{opacity:[0,1],y:[24,0]},{duration:0.6,ease:EASE,delay:stagger(0.08)});kids.forEach(k=>k.classList.add('reveal-done'));stop();},{amount:0.15});
  });
}
reveal();

/* ============================================================
   HERO (responsive bg video + staged entrance)
============================================================ */
const heroVideo=document.getElementById('hero-video');
if(heroVideo){
  heroVideo.src = window.matchMedia('(max-width: 760px)').matches
    ? 'assets/videos/video-mobile.mp4'
    : 'assets/videos/video-desktop.mp4';
  if(REDUCE){ heroVideo.removeAttribute('autoplay'); heroVideo.addEventListener('loadeddata',()=>heroVideo.pause(),{once:true}); }
}
if(!REDUCE){
  animate('.hero-eyebrow',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.2,ease:EASE});
  animate('.hero-h1',{opacity:[0,1],y:[30,0]},{duration:0.9,delay:0.35,ease:EASE});
  animate('.hero-desc',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.55,ease:EASE});
  animate('.hero-actions',{opacity:[0,1],y:[20,0]},{duration:0.7,delay:0.7,ease:EASE});
}

/* ============================================================
   COUNT-UP (metrics)
============================================================ */
function countUp(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count;
    if(REDUCE){el.textContent=target;return;}
    const stop=inView(el,()=>{animate(0,target,{duration:1.4,ease:EASE,onUpdate:v=>el.textContent=Math.round(v)});stop();},{amount:0.6});
  });
}
countUp();

/* ============================================================
   PRESS FEEDBACK (accessible)
============================================================ */
if(!REDUCE)press('.btn-primary',el=>{animate(el,{scale:0.96},{duration:0.12});return()=>animate(el,{scale:1},{type:'spring',visualDuration:0.3,bounce:0.2});});

/* ============================================================
   GALERIA (bento scroller + lightbox)
   Imagens reais ainda não usadas em outras seções do projeto.
============================================================ */
/* Fotos de obras (pasta images) ainda não usadas em outras seções */
const GAL_FOTOS = [
  'assets/images/galery1.jpg','assets/images/produtos1.jpg','assets/images/galery2.jpg',
  'assets/images/galery3.jpg','assets/images/produtos2.jpg','assets/images/galery4.jpg','assets/images/galery5.jpg'
];
/* Imagens de products que NÃO são capa de card no catálogo (não aparecem na seção sem clicar).
   Round-robin por categoria para variar, intercalando as fotos de obra. */
const GALERIA = (()=>{
  const buckets = [
    Array.from({length:12},(_,i)=>`assets/products/fritadeira1-${i+2}.png`), // 2–13
    [3,5,6,9,10].map(n=>`assets/products/mobiliario1-${n}.png`),
    [2,3,4].map(n=>`assets/products/refrigeracao1-${n}.png`),
    [2,3,4].map(n=>`assets/products/fogao1-${n}.png`)
  ];
  const pool=[]; let more=true;
  while(more){ more=false; for(const b of buckets){ if(b.length){ pool.push(b.shift()); more=true; } } }
  const out=[]; let fi=0;
  pool.forEach((src,idx)=>{ out.push(src); if(idx%3===2 && fi<GAL_FOTOS.length) out.push(GAL_FOTOS[fi++]); });
  while(fi<GAL_FOTOS.length) out.push(GAL_FOTOS[fi++]);
  return out;
})();
const galTrack=document.getElementById('galeria-track');
const PAD=n=>String(n+1).padStart(2,'0');
const EXPAND_SVG='<span class="g-expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>';
function renderGaleria(){
  if(!galTrack)return;
  const pat=['tall','stack','wide','stack'];
  let i=0,p=0,html='';
  while(i<GALERIA.length){
    let kind=pat[p%pat.length];p++;
    if(kind==='stack'&&i+1>=GALERIA.length)kind='tall';
    if(kind==='stack'){
      html+=`<div class="g-cell g-cell--stack">
        <button class="g-sub" data-gidx="${i}" aria-label="Ampliar imagem ${PAD(i)}"><img src="${GALERIA[i]}" alt="Projeto NOX em aço inox ${PAD(i)}" loading="lazy"><span class="g-tag">${PAD(i)} / NOX</span>${EXPAND_SVG}</button>
        <button class="g-sub" data-gidx="${i+1}" aria-label="Ampliar imagem ${PAD(i+1)}"><img src="${GALERIA[i+1]}" alt="Projeto NOX em aço inox ${PAD(i+1)}" loading="lazy"><span class="g-tag">${PAD(i+1)} / NOX</span>${EXPAND_SVG}</button>
      </div>`;
      i+=2;
    }else{
      html+=`<button class="g-cell g-cell--${kind}" data-gidx="${i}" aria-label="Ampliar imagem ${PAD(i)}"><img src="${GALERIA[i]}" alt="Projeto NOX em aço inox ${PAD(i)}" loading="lazy"><span class="g-tag">${PAD(i)} / NOX</span>${EXPAND_SVG}</button>`;
      i++;
    }
  }
  galTrack.innerHTML=html;
  bindCursor(galTrack);
  if(!REDUCE)animate(galTrack.querySelectorAll('.g-cell'),{opacity:[0,1],x:[24,0]},{duration:0.5,ease:EASE,delay:stagger(0.06)});
}
renderGaleria();

/* setas do scroller */
const galPrev=document.getElementById('gal-prev'),galNext=document.getElementById('gal-next');
function galUpdateArrows(){
  if(!galTrack||!galPrev||!galNext)return;
  const max=galTrack.scrollWidth-galTrack.clientWidth-2;
  const noScroll=galTrack.scrollWidth<=galTrack.clientWidth+2;
  galPrev.disabled=noScroll||galTrack.scrollLeft<=2;
  galNext.disabled=noScroll||galTrack.scrollLeft>=max;
}
function galScroll(dir){if(galTrack)galTrack.scrollBy({left:dir*galTrack.clientWidth*0.82,behavior:'smooth'});}
if(galPrev)galPrev.addEventListener('click',()=>galScroll(-1));
if(galNext)galNext.addEventListener('click',()=>galScroll(1));
if(galTrack)galTrack.addEventListener('scroll',galUpdateArrows,{passive:true});
window.addEventListener('resize',galUpdateArrows,{passive:true});
galUpdateArrows();

/* lightbox */
const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lb-img'),lbCounter=document.getElementById('lb-counter');
const lbClose=document.getElementById('lb-close'),lbPrev=document.getElementById('lb-prev'),lbNext=document.getElementById('lb-next');
let lbIndex=0;
function lbShow(idx){
  lbIndex=(idx+GALERIA.length)%GALERIA.length;
  if(REDUCE){lbImg.src=GALERIA[lbIndex];}
  else{animate(lbImg,{opacity:[0.2,1],scale:[0.98,1]},{duration:0.3,ease:EASE});lbImg.src=GALERIA[lbIndex];}
  lbCounter.innerHTML=`<b>${PAD(lbIndex)}</b> / ${PAD(GALERIA.length-1)}`;
}
function lbOpen(idx){lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';lbShow(idx);}
function lbHide(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='auto';}
if(galTrack)galTrack.addEventListener('click',e=>{const b=e.target.closest('[data-gidx]');if(b)lbOpen(+b.dataset.gidx);});
if(lbClose)lbClose.addEventListener('click',lbHide);
if(lbPrev)lbPrev.addEventListener('click',()=>lbShow(lbIndex-1));
if(lbNext)lbNext.addEventListener('click',()=>lbShow(lbIndex+1));
if(lb)lb.addEventListener('click',e=>{if(e.target===lb)lbHide();});
document.addEventListener('keydown',e=>{
  if(!lb||!lb.classList.contains('open'))return;
  if(e.key==='Escape')lbHide();
  else if(e.key==='ArrowRight')lbShow(lbIndex+1);
  else if(e.key==='ArrowLeft')lbShow(lbIndex-1);
});

/* ============================================================
   ACORDEÃO — Manutenção & Limpeza (Guia Inox)
   Um item aberto por vez; expansão via CSS (grid-template-rows).
============================================================ */
const acc=document.getElementById('inox-accordion');
if(acc)acc.addEventListener('click',e=>{
  const head=e.target.closest('.acc-head'); if(!head)return;
  const item=head.parentElement;
  const wasOpen=item.classList.contains('open');
  acc.querySelectorAll('.acc-item').forEach(it=>{
    it.classList.remove('open');
    const h=it.querySelector('.acc-head'); if(h)h.setAttribute('aria-expanded','false');
  });
  if(!wasOpen){item.classList.add('open');head.setAttribute('aria-expanded','true');}
});
