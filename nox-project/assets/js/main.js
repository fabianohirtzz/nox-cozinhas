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
const HOVER_SEL = 'a,button,.setor-tab,.prod-card,.filter-btn,.dif-item,.option-chip,.setor-prod-tag,.thumb';
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
  { id:'utensilios', cat:'Acessórios', pop:false, name:'Utensílios e Acessórios Profissionais', short:'Cubas GN, escorredores, panelas e recipientes de alto padrão.',
    features:['Cubas GN com bordas arredondadas e reforço contra deformação térmica','Escorredores de pratos suspensos para montagem em parede','Ganchos e barras de suspensão de utensílios de rápida instalação','Panelas gastronômicas de parede tripla para cocção rápida','Pegadores certificados pela ANVISA'],
    specs:{Material:'Aço Inox AISI 304 sanitário de qualidade alimentícia',Garantia:'6 meses contra defeitos de estampagem',Dimensões:'Padronização internacional Gastronorm (GN)',Acabamento:'Polimento espelhado brilhante interno e externo'},
    options:[{label:'Tipo',values:['Recipientes Gastronorm (GN)','Escorredor de Parede','Organizadores Sob Medida']}]
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

/* ============================================================
   SETORES
============================================================ */
function selectSetor(idx, el) {
  document.querySelectorAll('.setor-tab').forEach((t,i) => t.classList.toggle('active', i === idx));
  const s = SETORES[idx];
  const container = document.getElementById('setor-panel-container');
  container.innerHTML = `
    <div class="setor-panel open">
      <div class="setor-panel-grid">
        <div>
          <h3 class="setor-panel-name">${s.name}</h3>
          <p class="setor-panel-desc">${s.desc}</p>
          <div class="setor-prods">${s.prods.map(p=>`<span class="setor-prod-tag">${p}</span>`).join('')}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start">
          <p style="font-size:0.82rem;color:var(--muted);font-style:italic">${s.tagline}</p>
          <a href="#quote" class="btn-primary">Solicitar Projeto para este Setor →</a>
        </div>
      </div>
    </div>
  `;
}
selectSetor(0, null);

/* ============================================================
   PRODUTOS
============================================================ */
let activeProdId = null;

function renderProds(cat) {
  const grid = document.getElementById('prod-grid');
  const detail = document.getElementById('prod-detail');
  detail.innerHTML = '';
  activeProdId = null;
  const items = cat === 'all' ? PRODUTOS : PRODUTOS.filter(p => p.cat === cat);
  grid.innerHTML = items.map(p => `
    <div class="prod-card" onclick="openProd('${p.id}')">
      <div class="prod-cat">${p.cat}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-short">${p.short}</div>
      ${p.pop ? '<span class="prod-badge">★ Popular</span>' : ''}
      <div class="prod-arrow">↗</div>
    </div>
  `).join('');
}

function openProd(id) {
  const detail = document.getElementById('prod-detail');
  if (activeProdId === id) { detail.innerHTML=''; activeProdId=null; return; }
  activeProdId = id;
  const p = PRODUTOS.find(x => x.id === id);
  if (!p) return;
  const feats = p.features.map(f => `<li><span></span>${f}</li>`).join('');
  const specs = Object.entries(p.specs).map(([k,v]) => `
    <div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>
  `).join('');
  const opts = p.options ? p.options.map(o => `
    <div class="options-group">
      <div class="options-group-label">${o.label}</div>
      <div class="options-chips">${o.values.map(v=>`<button class="option-chip" onclick="this.classList.toggle('selected')">${v}</button>`).join('')}</div>
    </div>
  `).join('') : '';

  detail.innerHTML = `
    <div class="prod-detail-panel open">
      <div class="prod-detail-header">
        <div>
          <div class="prod-cat">${p.cat}</div>
          <h3 class="prod-detail-title">${p.name}</h3>
        </div>
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center">
          <a href="#quote" class="btn-primary">Solicitar Orçamento →</a>
          <button class="btn-outline" onclick="closeProd()">✕ Fechar</button>
        </div>
      </div>
      <div class="prod-detail-grid">
        <div>
          <div class="prod-features-title">Características Técnicas</div>
          <ul class="features-list">${feats}</ul>
          ${opts ? `<div class="prod-options"><div class="prod-options-title">Configurações Disponíveis</div>${opts}</div>` : ''}
        </div>
        <div>
          <div class="prod-specs-title">Especificações</div>
          <div class="specs-list">${specs}</div>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => detail.scrollIntoView({ behavior:'smooth', block:'nearest' }), 50);
}

function closeProd() {
  document.getElementById('prod-detail').innerHTML = '';
  activeProdId = null;
}

function filterProd(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProds(cat);
}

renderProds('all');

/* ============================================================
   FORM
============================================================ */
function submitForm(btn) {
  btn.textContent = '✓ Solicitação Enviada — Retorno em até 24h';
  btn.style.background = '#1a1a1a';
  btn.style.color = 'var(--accent)';
  btn.style.border = '1px solid var(--accent)';
  btn.disabled = true;
}

/* TEMP: expose handlers for inline onclick until Tasks 11/12/15 move them to addEventListener.
   These window.* assignments (and the inline onclick in index.html) are removed by those tasks. */
window.selectSetor = selectSetor;
window.renderProds = renderProds;
window.openProd    = openProd;
window.closeProd   = closeProd;
window.filterProd  = filterProd;
window.submitForm  = submitForm;
