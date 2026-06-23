/* ============================================================
   NOX — Painel de Leads · lógica (Supabase + render)
   Dados reais vêm das tabelas `leads` e `ad_spend`.
============================================================ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ---------- Supabase client ---------- */
const CFG=window.NOX_CONFIG||{};
if(!CFG.SUPABASE_URL||CFG.SUPABASE_URL.includes('SEU-PROJETO')){
  alert('Configure o config.js do painel com a URL e a anon key do Supabase.');
}
const sb=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY);

/* ---------- dicionários ---------- */
const STATUS={
  venda:{label:'Venda feita',cls:'s-venda'},
  negociacao:{label:'Em negociação',cls:'s-nego'},
  atendimento:{label:'Atendimento iniciado',cls:'s-aberto'},
  semresposta:{label:'Sem resposta',cls:'s-sem'},
  perdido:{label:'Perdido',cls:'s-perdido'}
};
const ORIG={
  pago:{label:'Pago',cls:'pago'}, organico:{label:'Orgânico',cls:'organico'},
  social:{label:'Social',cls:'social'}, direto:{label:'Direto',cls:'direto'}
};

/* ---------- helpers ---------- */
const brl=n=>n>0?n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}):'—';
const brl2=n=>(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
function esc(s){return (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function fmtData(iso){if(!iso)return '—';const d=new Date(iso);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})+' · '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
function isPago(o){return o==='pago';}
function monthKey(iso){return (iso||'').slice(0,7);}
function monthLabel(key){
  if(key==='all')return 'Todos os meses';
  const [y,m]=key.split('-').map(Number);
  const s=new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); // "junho de 2026"
  return s.charAt(0).toUpperCase()+s.slice(1).replace(' de ',' / ');
}

/* ---------- estado ---------- */
let LEADS=[];                 // mapeados p/ render
let spend={};                 // { 'YYYY-MM': valor }
let F={orig:'todos',status:'todos',q:'',month:''};
let openId=null;

function mapRow(r){
  const auto=r.origem||'direto';
  const eff=r.origem_manual||auto;
  return {
    id:r.id, data:r.created_at,
    nome:r.nome||'(sem nome)', empresa:r.empresa||'—',
    tel:r.telefone||'—', email:r.email||'',
    setor:r.setor||'—', produto:r.produto||'—', cidade:r.cidade||'—',
    desc:r.descricao||'(sem descrição)',
    origemAuto:auto, origem:eff,
    camp:r.utm_campaign||'—', land:r.landing_page||'—',
    status:r.status||'semresposta',
    orc:Number(r.orcamento)||0, ven:Number(r.venda)||0,
    obs:r.observacoes||''
  };
}

function inMonth(l){return F.month==='all'||monthKey(l.data)===F.month;}
function filtered(){
  return LEADS.filter(inMonth)
    .filter(l=>F.orig==='todos'||(F.orig==='pago'?l.origem==='pago':l.origem!=='pago'))
    .filter(l=>F.status==='todos'||l.status===F.status)
    .filter(l=>{if(!F.q)return true;const s=(l.nome+l.empresa+l.cidade+l.produto).toLowerCase();return s.includes(F.q.toLowerCase());});
}

/* ============================================================ AUTH */
const loginForm=$('#login-form'), lgErr=$('#lg-error'), lgBtn=$('#lg-btn');
loginForm.addEventListener('submit',async e=>{
  e.preventDefault(); lgErr.textContent=''; lgBtn.disabled=true; lgBtn.textContent='Entrando…';
  const {error}=await sb.auth.signInWithPassword({email:$('#lg-email').value.trim(),password:$('#lg-pass').value});
  lgBtn.disabled=false; lgBtn.textContent='Entrar →';
  if(error){lgErr.textContent='E-mail ou senha incorretos.';return;}
  enterApp();
});
$('#logout-btn').onclick=async()=>{await sb.auth.signOut();location.reload();};

async function enterApp(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user)return;
  $('#user-email').textContent=user.email;
  $('#login').classList.add('hidden');
  $('#app').classList.add('on');
  await loadData();
}

/* ============================================================ CARGA */
async function loadData(){
  const [{data:leadsData,error:e1},{data:spendData,error:e2}]=await Promise.all([
    sb.from('leads').select('*').order('created_at',{ascending:false}),
    sb.from('ad_spend').select('*')
  ]);
  if(e1){toast('Erro ao carregar leads: '+e1.message,true);return;}
  LEADS=(leadsData||[]).map(mapRow);
  spend={}; (spendData||[]).forEach(s=>{spend[s.month]=Number(s.amount)||0;});
  buildMonths();
  renderLeads();
}

function buildMonths(){
  const set=[...new Set(LEADS.map(l=>monthKey(l.data)).filter(Boolean))].sort().reverse();
  if(!set.length){const now=new Date();set.push(now.toISOString().slice(0,7));}
  F.month=set[0];
  const sel=$('#month-sel');
  sel.innerHTML=set.map(k=>`<option value="${k}">${monthLabel(k)}</option>`).join('')+`<option value="all">Todos os meses</option>`;
  sel.value=F.month;
  syncSpendInput();
}

/* ============================================================ NAV / FILTROS */
$$('.nav-item').forEach(b=>b.onclick=()=>{
  $$('.nav-item').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  const v=b.dataset.view;
  $$('.view').forEach(x=>x.classList.remove('on'));
  if(v==='leads'){$('#view-leads').classList.add('on');$('#top-title').innerHTML='Leads<span>.</span>';renderLeads();}
  else{$('#view-reports').classList.add('on');$('#top-title').innerHTML='Relatórios<span>.</span>';renderReports();}
});
$('#month-sel').onchange=e=>{F.month=e.target.value;syncSpendInput();renderLeads();if($('#view-reports').classList.contains('on'))renderReports();};
$('#q').oninput=e=>{F.q=e.target.value;renderLeads();};
$('#status-filter').onchange=e=>{F.status=e.target.value;renderLeads();};
$$('#orig-filter .chip').forEach(c=>c.onclick=()=>{$$('#orig-filter .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');F.orig=c.dataset.orig;renderLeads();});

/* ============================================================ TABELA */
function origBadge(o){const x=ORIG[o]||ORIG.direto;return `<span class="orig ${x.cls}">${x.label}</span>`;}
function renderLeads(){
  const rows=filtered(); const tb=$('#lead-rows');
  if(!rows.length){tb.innerHTML=`<tr><td colspan="10"><div class="empty">Nenhum lead com esses filtros.</div></td></tr>`;}
  else tb.innerHTML=rows.map(l=>{
    const st=STATUS[l.status]||STATUS.semresposta;
    return `<tr data-id="${l.id}">
      <td>${origBadge(l.origem)}</td>
      <td class="mono">${fmtData(l.data)}</td>
      <td><div class="c-name">${esc(l.nome)}</div><div class="c-sub">${esc(l.empresa)}</div></td>
      <td><div class="mono">${esc(l.tel)}</div><div class="c-sub mono">${esc(l.email)||'—'}</div></td>
      <td>${esc(l.setor)}</td>
      <td class="desc-cell" title="${esc(l.produto)}">${esc(l.produto)}</td>
      <td class="mono">${esc(l.cidade)}</td>
      <td><span class="status-sel ${st.cls}">${st.label}</span></td>
      <td class="money ${l.orc?'':'zero'}">${brl(l.orc)}</td>
      <td class="money ${l.ven?'':'zero'}">${brl(l.ven)}</td>
    </tr>`;
  }).join('');
  $$('#lead-rows tr[data-id]').forEach(tr=>tr.onclick=()=>openDrawer(Number(tr.dataset.id)));
  renderLeadKpis(rows);
}
function renderLeadKpis(rows){
  const total=rows.length;
  const vendas=rows.filter(l=>l.status==='venda');
  const conv=total?Math.round(vendas.length/total*100):0;
  const valVen=rows.reduce((s,l)=>s+l.ven,0), valOrc=rows.reduce((s,l)=>s+l.orc,0);
  $('#lead-kpis').innerHTML=`
    <div class="kpi"><div class="kpi-l">Leads no período</div><div class="kpi-n">${total}</div><div class="kpi-sub">${rows.filter(l=>isPago(l.origem)).length} pago · ${rows.filter(l=>!isPago(l.origem)).length} orgânico</div></div>
    <div class="kpi k-green"><div class="kpi-l">Vendas fechadas</div><div class="kpi-n">${vendas.length}</div><div class="kpi-sub"><b>${conv}%</b> de conversão</div></div>
    <div class="kpi k-orange"><div class="kpi-l">Em orçamentos</div><div class="kpi-n" style="font-size:1.7rem">${brl2(valOrc)}</div><div class="kpi-sub">valor total cotado</div></div>
    <div class="kpi k-green"><div class="kpi-l">Em vendas</div><div class="kpi-n" style="font-size:1.7rem">${brl2(valVen)}</div><div class="kpi-sub">faturamento fechado</div></div>`;
}

/* ============================================================ DRAWER */
function openDrawer(id){
  const l=LEADS.find(x=>x.id===id); if(!l)return; openId=id;
  $('#dr-orig').innerHTML=origBadge(l.origem);
  $('#dr-name').textContent=l.nome;
  $('#dr-comp').textContent=l.empresa;
  $('#dr-tel').textContent=l.tel;
  $('#dr-email').textContent=l.email||'—';
  $('#dr-cidade').textContent=l.cidade;
  $('#dr-setor').textContent=l.setor;
  $('#dr-produto').textContent=l.produto;
  $('#dr-data').textContent=fmtData(l.data);
  $('#dr-canal').textContent=(ORIG[l.origemAuto]||ORIG.direto).label;
  $('#dr-camp').textContent=l.camp;
  $('#dr-land').textContent=l.land;
  $('#dr-desc').textContent=l.desc;
  $('#e-status').value=l.status;
  $('#e-orig').value=l.origem;
  $('#e-orc').value=l.orc||'';
  $('#e-ven').value=l.ven||'';
  $('#e-obs').value=l.obs;
  $('#scrim').classList.add('on'); $('#drawer').classList.add('on');
}
function closeDrawer(){$('#scrim').classList.remove('on');$('#drawer').classList.remove('on');openId=null;}
$('#dr-close').onclick=closeDrawer; $('#dr-cancel').onclick=closeDrawer; $('#scrim').onclick=closeDrawer;

$('#dr-save').onclick=async()=>{
  const l=LEADS.find(x=>x.id===openId); if(!l)return;
  const btn=$('#dr-save'); btn.disabled=true; btn.textContent='Salvando…';
  const patch={
    status:$('#e-status').value,
    origem_manual:$('#e-orig').value,
    orcamento:Number($('#e-orc').value)||0,
    venda:Number($('#e-ven').value)||0,
    observacoes:$('#e-obs').value
  };
  const {error}=await sb.from('leads').update(patch).eq('id',l.id);
  btn.disabled=false; btn.textContent='Salvar alterações';
  if(error){toast('Erro ao salvar: '+error.message,true);return;}
  // reflete localmente
  l.status=patch.status; l.origem=patch.origem_manual;
  l.orc=patch.orcamento; l.ven=patch.venda; l.obs=patch.observacoes;
  const f=$('#save-flash'); f.classList.add('on'); setTimeout(()=>f.classList.remove('on'),1600);
  renderLeads();
  toast('Lead atualizado.');
};

/* ============================================================ RELATÓRIOS */
function syncSpendInput(){
  const inp=$('#spend-input');
  $('#spend-month-lbl').textContent=monthLabel(F.month);
  if(F.month==='all'){
    inp.value=Object.values(spend).reduce((a,b)=>a+b,0);
    inp.readOnly=true; inp.style.opacity=.5;
  }else{
    inp.value=spend[F.month]||0;
    inp.readOnly=false; inp.style.opacity=1;
  }
}
$('#spend-input').onchange=async e=>{
  if(F.month==='all')return;
  const amount=Number(e.target.value)||0;
  spend[F.month]=amount;
  const {error}=await sb.from('ad_spend').upsert({month:F.month,amount},{onConflict:'month'});
  if(error){toast('Erro ao salvar investimento: '+error.message,true);return;}
  renderReports(); toast('Investimento salvo.');
};
function curSpend(){return F.month==='all'?Object.values(spend).reduce((a,b)=>a+b,0):(spend[F.month]||0);}

function rowsForReports(){
  return LEADS.filter(inMonth).filter(l=>F.orig==='todos'||(F.orig==='pago'?l.origem==='pago':l.origem!=='pago'));
}
function renderReports(){
  const rows=rowsForReports();
  const total=rows.length;
  const vendas=rows.filter(l=>l.status==='venda');
  const valVen=rows.reduce((s,l)=>s+l.ven,0), valOrc=rows.reduce((s,l)=>s+l.orc,0);
  const conv=total?(vendas.length/total*100):0;
  const ticket=vendas.length?valVen/vendas.length:0;
  const sp=curSpend();
  const venPago=rows.filter(l=>isPago(l.origem)).reduce((s,l)=>s+l.ven,0);
  const leadsPago=rows.filter(l=>isPago(l.origem)).length;
  const roas=sp>0?venPago/sp:0;
  const roi=sp>0?((venPago-sp)/sp*100):0;
  const cpl=leadsPago>0?sp/leadsPago:0;

  $('#rep-kpis').innerHTML=`
    <div class="kpi"><div class="kpi-l">Total de leads</div><div class="kpi-n">${total}</div><div class="kpi-sub">${leadsPago} via Ads</div></div>
    <div class="kpi k-green"><div class="kpi-l">Taxa de conversão</div><div class="kpi-n">${conv.toFixed(0)}<small>%</small></div><div class="kpi-sub">${vendas.length} de ${total} leads</div></div>
    <div class="kpi k-orange"><div class="kpi-l">ROAS (pago)</div><div class="kpi-n">${sp>0?roas.toFixed(1):'—'}<small>${sp>0?'x':''}</small></div><div class="kpi-sub">retorno s/ Ads</div></div>
    <div class="kpi ${roi>=0?'k-green':''}"><div class="kpi-l">ROI (pago)</div><div class="kpi-n">${sp>0?(roi>=0?'+':'')+roi.toFixed(0):'—'}<small>${sp>0?'%':''}</small></div><div class="kpi-sub">${brl2(sp)} investido</div></div>`;

  // donut por origem
  const byOrig={pago:0,organico:0,social:0,direto:0};
  rows.forEach(l=>{byOrig[l.origem]=(byOrig[l.origem]||0)+1;});
  const colors={pago:'var(--orange)',organico:'var(--st-venda)',social:'var(--st-nego)',direto:'#a1a1aa'};
  let acc=0,segs=[];
  Object.entries(byOrig).forEach(([k,v])=>{if(v&&total){const pct=v/total*100;segs.push(`${colors[k]} ${acc}% ${acc+pct}%`);acc+=pct;}});
  $('#donut').style.background=`conic-gradient(${segs.join(',')||'#e4e4e7 0 100%'})`;
  $('#donut').innerHTML=`<div class="donut-c"><b>${total}</b><span>leads</span></div>`;
  $('#donut-legend').innerHTML=Object.entries(byOrig).filter(([,v])=>v).map(([k,v])=>
    `<div class="legend-row"><span class="legend-dot" style="background:${colors[k]}"></span>${(ORIG[k]||ORIG.direto).label}<span class="pct">${total?(v/total*100).toFixed(0):0}%</span><span class="n">${v}</span></div>`).join('')||'<div class="card-sub">Sem dados no período.</div>';

  // funil status
  const order=['atendimento','negociacao','venda','semresposta','perdido'];
  const byStatus={}; order.forEach(s=>byStatus[s]=rows.filter(l=>l.status===s).length);
  const maxS=Math.max(1,...Object.values(byStatus));
  const scolor={atendimento:'var(--st-aberto)',negociacao:'var(--st-nego)',venda:'var(--st-venda)',semresposta:'var(--st-sem)',perdido:'var(--st-perdido)'};
  $('#status-bars').innerHTML=order.map(s=>
    `<div class="bar-row"><div class="bar-lbl">${STATUS[s].label}</div><div class="bar-track"><div class="bar-fill" style="width:${byStatus[s]/maxS*100}%;background:${scolor[s]}"></div></div><div class="bar-n">${byStatus[s]}</div></div>`).join('');

  // orçado x vendido
  $('#vs-orc').textContent=brl2(valOrc);
  $('#vs-ven').textContent=brl2(valVen);
  const close=valOrc>0?valVen/valOrc*100:0;
  $('#close-bar').style.width=Math.min(100,close)+'%';
  $('#close-n').textContent=close.toFixed(0)+'%';

  // mídia paga
  $('#m-roas').textContent=sp>0?roas.toFixed(1)+'x':'—';
  $('#m-roi').textContent=sp>0?(roi>=0?'+':'')+roi.toFixed(0)+'%':'—';
  $('#m-roi').style.color=roi>=0?'var(--st-venda)':'var(--st-perdido)';
  $('#m-cpl').textContent=cpl>0?brl2(Math.round(cpl)):'—';
  $('#m-vpago').textContent=brl2(venPago);
  $('#m-ticket').textContent=brl2(Math.round(ticket));

  renderTimeline(rows);
}
function renderTimeline(rows){
  if(F.month==='all'){
    const by={}; rows.forEach(l=>{const m=monthKey(l.data);by[m]=(by[m]||0)+1;});
    const keys=Object.keys(by).sort(); const max=Math.max(1,...Object.values(by));
    $('#timeline').innerHTML=keys.map(k=>`<div class="tl-bar" style="height:${by[k]/max*100}%"><span>${by[k]}</span></div>`).join('')||'';
    $('#tl-axis').innerHTML=keys.map(k=>`<span>${k.slice(5)}/${k.slice(2,4)}</span>`).join('');
    return;
  }
  const [y,m]=F.month.split('-').map(Number);
  const days=new Date(y,m,0).getDate();
  const by=new Array(days+1).fill(0);
  rows.forEach(l=>{const d=Number((l.data||'').slice(8,10));if(d>=1&&d<=days)by[d]++;});
  const max=Math.max(1,...by);
  let html=''; for(let d=1;d<=days;d++)html+=`<div class="tl-bar" style="height:${by[d]/max*100}%"><span>${by[d]}</span></div>`;
  $('#timeline').innerHTML=html;
  $('#tl-axis').innerHTML='<span>01</span><span>08</span><span>15</span><span>22</span><span>'+days+'</span>';
}

/* ---------- toast ---------- */
let toastT;
function toast(msg,err){const t=$('#toast');t.textContent=msg;t.className='toast on'+(err?' err':'');clearTimeout(toastT);toastT=setTimeout(()=>t.className='toast',2600);}

/* ============================================================ BOOT */
(async function(){
  const {data:{session}}=await sb.auth.getSession();
  if(session)enterApp();
})();
