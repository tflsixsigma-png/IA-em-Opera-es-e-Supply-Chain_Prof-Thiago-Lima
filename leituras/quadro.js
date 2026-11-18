/* Quadro do grupo · Mapa da IA na sua empresa (Sessão 1)
   Preenchimento no navegador, salvamento local e exportação (PDF, Markdown, JSON, texto para o Assistente ELO). */
(function () {
  const root = document.getElementById('qz');
  if (!root) return;

  const PROC = ['Planejar', 'Suprir', 'Produzir', 'Entregar', 'Retornar', 'Habilitar'];
  const MAT = [
    ['Agêntica', 'faz, sozinha'],
    ['Prescritiva', 'o que fazer?'],
    ['Preditiva', 'o que vai acontecer?'],
    ['Diagnóstica', 'por quê?'],
    ['Descritiva', 'o que aconteceu?']
  ];
  const FUNC = {
    medido: 'Sim, medido',
    acha: 'Achamos que sim',
    naosabe: 'Não sabemos',
    nao: 'Não funciona'
  };
  const MECS = ['Adoção e momento', 'Alcance e barreira de execução', 'Ajustes de julgamento', 'Deriva de dados',
    'Percepção diverge da medida', 'Proxy no lugar do objetivo', 'Ganho realocado'];
  const USA = { sim: 'Já usamos', nao: 'Não usamos', ns: 'Não sabemos se usamos' };
  /* Tipos de problema por processo SCOR × tipo de análise: [problema, decisão apoiada] */
  const CAT = {
    Planejar: {
      Descritiva: [['Painel de vendas, estoque e ruptura', 'onde olhar primeiro'], ['Erro da previsão por item', 'em que itens confiar na previsão']],
      'Diagnóstica': [['Causa de ruptura ou de excesso de estoque', 'o que corrigir no planejamento'], ['Por que a previsão errou (promoção, clima, preço)', 'que informação falta no plano']],
      Preditiva: [['Previsão de demanda por item e local', 'quanto comprar, produzir e estocar'], ['Previsão de ruptura ou de vencimento', 'onde agir antes de faltar ou perder']],
      Prescritiva: [['Pedido sugerido de reposição', 'quanto pedir, de que item, para onde'], ['Estoque de segurança por item', 'quanto estoque manter'], ['Plano de vendas e operações (S&OP) otimizado', 'que plano equilibra demanda e capacidade']],
      'Agêntica': [['Reposição automática, sem aprovação a cada pedido', 'o sistema emite o pedido dentro de limites']]
    },
    Suprir: {
      Descritiva: [['Gasto por fornecedor e categoria', 'onde está o dinheiro das compras'], ['Atrasos e não conformidades por fornecedor', 'que fornecedor acompanhar']],
      'Diagnóstica': [['Causa de atraso de fornecedor', 'o que renegociar ou mudar'], ['Por que o preço pago variou', 'onde há perda na compra']],
      Preditiva: [['Risco de atraso ou de quebra de fornecedor', 'quando acionar um plano B'], ['Previsão de preço de insumo', 'quando comprar']],
      Prescritiva: [['Que fornecedor escolher e quanto comprar de cada um', 'como dividir o volume'], ['Quando antecipar ou adiar a compra', 'momento e lote da compra']],
      'Agêntica': [['Negociação automatizada com fornecedores de menor valor', 'o sistema negocia e fecha dentro de limites']]
    },
    Produzir: {
      Descritiva: [['Painel de eficiência das linhas (OEE)', 'que linha precisa de atenção'], ['Refugo e retrabalho por linha e turno', 'onde está a perda']],
      'Diagnóstica': [['Causa raiz de defeito ou de parada', 'o que corrigir no processo']],
      Preditiva: [['Previsão de falha de equipamento (manutenção preditiva)', 'quando intervir antes da quebra'], ['Detecção de defeito por imagem', 'que peça rejeitar']],
      Prescritiva: [['Sequenciamento da produção', 'o que produzir, em que ordem, em que máquina'], ['Quando parar a máquina para manutenção', 'janela de parada de menor custo']],
      'Agêntica': [['Ajuste automático de parâmetros do processo', 'o sistema regula a máquina sem o operador']]
    },
    Entregar: {
      Descritiva: [['Entregas no prazo e completas (OTIF)', 'que cliente ou rota está falhando'], ['Rastreamento de cargas', 'onde está cada entrega']],
      'Diagnóstica': [['Causa de atraso de entrega', 'o que mudar na operação de transporte']],
      Preditiva: [['Previsão de horário de chegada', 'quando preparar doca, equipe e cliente'], ['Previsão de volume por rota ou doca', 'quanta capacidade reservar']],
      Prescritiva: [['Roteirização', 'que rota, em que ordem'], ['Alocação de docas e de frota', 'que veículo e que doca para cada carga']],
      'Agêntica': [['Redirecionamento automático de cargas diante de imprevistos', 'o sistema troca rota ou transportadora sozinho']]
    },
    Retornar: {
      Descritiva: [['Taxa e motivo de devolução por produto', 'que produto olhar']],
      'Diagnóstica': [['Por que o cliente devolve (tamanho, defeito, descrição)', 'o que corrigir no produto ou na venda']],
      Preditiva: [['Previsão de devolução por pedido', 'onde agir antes do envio'], ['Detecção de fraude em devoluções', 'que devolução conferir']],
      Prescritiva: [['Destino do item devolvido', 'revender, reparar ou descartar']],
      'Agêntica': [['Autorização automática de troca ou reembolso', 'o sistema aprova sem atendente']]
    },
    Habilitar: {
      Descritiva: [['Indicadores de pessoas, custos e conformidade', 'onde olhar primeiro']],
      'Diagnóstica': [['Causa de hora extra ou de absenteísmo', 'o que mudar na gestão da equipe']],
      Preditiva: [['Previsão de necessidade de pessoal', 'quanta gente, quando'], ['Risco de fraude ou de não conformidade', 'o que auditar']],
      Prescritiva: [['Escala de turnos', 'quem trabalha quando'], ['Dimensionamento de equipe', 'quantas pessoas por operação']],
      'Agêntica': [['Assistente de IA que responde e executa pedidos internos', 'o sistema resolve sem pessoa']]
    }
  };
  const KEY = 'quadro-ia-sessao1-v1';

  const blank = () => ({ grupo: '', integrantes: '', notes: [], an: { concentra: '', vazio: '', naosabe: '', escolhido: '', porque: '', caso: '', mec: '', mecOutro: '', pergunta: '' } });
  let S = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); S.an = Object.assign(blank().an, S.an || {}); } catch (e) { /* sem armazenamento: segue em memória */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } flash('Salvo neste navegador'); };

  const $ = (s, el) => (el || root).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  let flashT;
  function flash(msg) { const f = $('#qz-flash'); if (!f) return; f.textContent = msg; clearTimeout(flashT); flashT = setTimeout(() => { f.textContent = ''; }, 2200); }

  /* ---------- estrutura ---------- */
  root.innerHTML = `
  <div class="qz-top">
    <label>Grupo <select id="qz-grupo"><option value="">—</option>${[1, 2, 3, 4, 5, 6].map(n => `<option>${n}</option>`).join('')}</select></label>
    <label class="qz-grow">Integrantes <input id="qz-integ" type="text" placeholder="nomes, separados por vírgula"></label>
  </div>
  <p class="qz-help">Clique em <b>+</b> em uma célula para ver os tipos de problema daquele processo e daquele tipo de análise. Escolha um e marque se a empresa de alguém do grupo já usa. Clique no post-it para editar. Tudo fica salvo neste navegador; use <b>Salvar arquivo</b> para levar o quadro para outro computador.</p>
  <div class="qz-boardw"><table class="qz-board" id="qz-board"></table></div>
  <div class="qz-auto" id="qz-auto"></div>
  <div class="qz-an">
    <h3>Leitura do quadro</h3>
    <label>1 · Onde se concentram os post-its, e por quê?<textarea id="an-concentra" rows="2"></textarea></label>
    <label>2 · Que células vazias chamam atenção?<textarea id="an-vazio" rows="2"></textarea></label>
    <label>3 · O que vocês usam sem saber se funciona? O que isso diz sobre como a empresa mede?<textarea id="an-naosabe" rows="2"></textarea></label>
    <h3>Escolha do grupo</h3>
    <label>4 · Problema escolhido para as Sessões 2 e 3<select id="an-escolhido"></select></label>
    <label>Por que esse?<textarea id="an-porque" rows="2"></textarea></label>
    <label>5 · Caso real parecido no mapa conceitual<input id="an-caso" type="text" placeholder="ex.: Zara, ECCO, M5, Instacart…"></label>
    <label>6 · Mecanismo de falha que ameaça a escolha<select id="an-mec"><option value="">—</option>${MECS.map(m => `<option>${esc(m)}</option>`).join('')}<option value="outro">Outro</option></select></label>
    <label id="an-mecOutro-w" hidden>Qual?<input id="an-mecOutro" type="text"></label>
    <label>7 · A pergunta que o grupo ainda não sabe responder<textarea id="an-pergunta" rows="2"></textarea></label>
  </div>
  <div class="qz-exp">
    <button type="button" class="qz-b" id="qz-pdf">Baixar PDF</button>
    <button type="button" class="qz-b" id="qz-md">Baixar Markdown</button>
    <button type="button" class="qz-b" id="qz-copy">Copiar para o Assistente ELO</button>
    <button type="button" class="qz-b ghost" id="qz-json">Salvar arquivo</button>
    <label class="qz-b ghost" tabindex="0">Abrir arquivo<input id="qz-open" type="file" accept=".json,application/json" hidden></label>
    <button type="button" class="qz-b danger" id="qz-clear">Limpar quadro</button>
    <span id="qz-flash" role="status" aria-live="polite"></span>
  </div>
  <dialog id="qz-dlg" aria-labelledby="qz-dlg-t">
    <form method="dialog" id="qz-form" novalidate>
      <h3 id="qz-dlg-t">Post-it</h3>
      <div class="qz-2"><label>Processo<select id="f-proc">${PROC.map(p => `<option>${p}</option>`).join('')}</select></label>
      <label>Tipo de análise<select id="f-mat">${MAT.map(m => `<option value="${m[0]}">${m[0]} · ${m[1]}</option>`).join('')}</select></label></div>
      <fieldset><legend>Tipo de problema</legend><div id="f-cat"></div>
        <label class="qz-r qz-outro"><input type="radio" name="f-tipo" value="outro"> Outro: <input id="f-outro" type="text" placeholder="descreva em uma linha"></label></fieldset>
      <fieldset><legend>Na empresa de alguém do grupo?</legend>${Object.entries(USA).map(([k, v]) => `<label class="qz-r"><input type="radio" name="f-usa" value="${k}"> ${v}</label>`).join('')}</fieldset>
      <div id="f-uso">
        <label>Quem decide com ela <small>opcional</small><input id="f-quem" type="text" placeholder="ex.: comprador, toda segunda"></label>
        <fieldset><legend>Funciona?</legend>${Object.entries(FUNC).map(([k, v]) => `<label class="qz-r"><input type="radio" name="f-func" value="${k}"> ${v}</label>`).join('')}</fieldset>
      </div>
      <p class="qz-err" id="f-err" hidden>Escolha um tipo de problema ou descreva em “Outro”.</p>
      <div class="qz-dbtn"><button type="button" class="qz-b danger" id="f-del">Excluir</button><span></span><button type="button" class="qz-b ghost" id="f-cancel">Cancelar</button><button type="submit" class="qz-b" id="f-ok">Colar no quadro</button></div>
    </form>
  </dialog>`;

  const report = document.createElement('div');
  report.id = 'qz-report';
  document.body.appendChild(report);

  /* ---------- quadro ---------- */
  function renderBoard() {
    const cnt = {};
    S.notes.forEach(n => { const k = n.mat + '|' + n.proc; cnt[k] = (cnt[k] || 0) + 1; });
    let h = '<thead><tr><th></th>' + PROC.map(p => `<th scope="col">${p}</th>`).join('') + '<th scope="col" class="tot">Total</th></tr></thead><tbody>';
    MAT.forEach(([m, q]) => {
      h += `<tr><th scope="row"><b>${m}</b><span>${q}</span></th>`;
      PROC.forEach(p => {
        const ns = S.notes.filter(n => n.proc === p && n.mat === m);
        h += `<td>${ns.map(n => noteHTML(n)).join('')}<button type="button" class="qz-add" data-p="${p}" data-m="${m}" aria-label="Colar post-it em ${p} × ${m}">+</button></td>`;
      });
      h += `<td class="tot">${S.notes.filter(n => n.mat === m).length}</td></tr>`;
    });
    h += '<tr class="tot"><th scope="row"><b>Total</b></th>' + PROC.map(p => `<td>${S.notes.filter(n => n.proc === p).length}</td>`).join('') + `<td>${S.notes.length}</td></tr></tbody>`;
    $('#qz-board').innerHTML = h;
  }
  const usaOf = n => n.usa || 'sim';
  function tagOf(n) { const u = usaOf(n); return u === 'sim' ? ['f-' + (n.func || 'naosabe'), 'Usamos · ' + (FUNC[n.func] || 'Não sabemos').toLowerCase()] : ['u-' + u, USA[u]]; }
  function noteHTML(n) {
    const star = S.an.escolhido === n.id, tg = tagOf(n);
    return `<button type="button" class="qz-note u-${usaOf(n)}${star ? ' star' : ''}" data-id="${n.id}">
      ${star ? '<i>★ escolhido</i>' : ''}<b>${esc(n.oque)}</b>${n.dec ? `<span>Decisão: ${esc(n.dec)}</span>` : ''}${usaOf(n) === 'sim' && n.quem ? `<span>Quem decide: ${esc(n.quem)}</span>` : ''}<em class="${tg[0]}">${tg[1]}</em></button>`;
  }

  /* ---------- leitura automática ---------- */
  function stats() {
    const byP = PROC.map(p => [p, S.notes.filter(n => n.proc === p).length]);
    const byM = MAT.map(([m]) => [m, S.notes.filter(n => n.mat === m).length]);
    const cells = new Set(S.notes.map(n => n.mat + '|' + n.proc));
    const top = arr => { const mx = Math.max(...arr.map(a => a[1])); return mx ? arr.filter(a => a[1] === mx).map(a => a[0]).join(', ') + ` (${mx})` : '—'; };
    const used = S.notes.filter(n => usaOf(n) === 'sim');
    const fc = k => used.filter(n => (n.func || 'naosabe') === k).length;
    return { n: S.notes.length, occ: cells.size, empty: 30 - cells.size, topP: top(byP), topM: top(byM), usa: used.length, nusa: S.notes.filter(n => usaOf(n) === 'nao').length, ns: S.notes.filter(n => usaOf(n) === 'ns').length, medido: fc('medido'), acha: fc('acha'), naosabe: fc('naosabe'), nao: fc('nao') };
  }
  function renderAuto() {
    const s = stats();
    $('#qz-auto').innerHTML = `<div><b>${s.n}</b><span>post-its</span></div><div><b>${s.occ}/30</b><span>células ocupadas</span></div><div><b>${s.usa}</b><span>já usamos</span></div><div><b>${s.naosabe}</b><span>usamos sem saber se funciona</span></div><div><b>${s.medido}</b><span>medidos</span></div><p>Processo com mais post-its: <b>${esc(s.topP)}</b> · Tipo de análise com mais: <b>${esc(s.topM)}</b></p>`;
  }
  function renderChoice() {
    const sel = $('#an-escolhido');
    sel.innerHTML = '<option value="">—</option>' + S.notes.map(n => `<option value="${n.id}">${esc(n.proc + ' × ' + n.mat + ' · ' + n.oque)}</option>`).join('');
    sel.value = S.notes.some(n => n.id === S.an.escolhido) ? S.an.escolhido : '';
  }
  function renderAll() { renderBoard(); renderAuto(); renderChoice(); }

  /* ---------- campos ---------- */
  $('#qz-grupo').value = S.grupo; $('#qz-integ').value = S.integrantes;
  $('#qz-grupo').addEventListener('change', e => { S.grupo = e.target.value; save(); });
  $('#qz-integ').addEventListener('input', e => { S.integrantes = e.target.value; save(); });
  ['concentra', 'vazio', 'naosabe', 'porque', 'caso', 'mecOutro', 'pergunta'].forEach(k => {
    const el = $('#an-' + k); el.value = S.an[k] || '';
    el.addEventListener('input', () => { S.an[k] = el.value; save(); });
  });
  const mec = $('#an-mec');
  mec.value = S.an.mec || '';
  const syncMec = () => { $('#an-mecOutro-w').hidden = mec.value !== 'outro'; };
  syncMec();
  mec.addEventListener('change', () => { S.an.mec = mec.value; syncMec(); save(); });
  $('#an-escolhido').addEventListener('change', e => { S.an.escolhido = e.target.value; save(); renderBoard(); });

  /* ---------- post-it ---------- */
  const dlg = $('#qz-dlg'); let editing = null;
  function fillCat(sel) {
    const p = $('#f-proc').value, m = $('#f-mat').value, list = (CAT[p] && CAT[p][m]) || [];
    $('#f-cat').innerHTML = list.map((c, i) => `<label class="qz-cat"><input type="radio" name="f-tipo" value="${i}"><span><b>${esc(c[0])}</b><small>Decisão: ${esc(c[1])}</small></span></label>`).join('');
    let hit = false;
    root.querySelectorAll('input[name="f-tipo"]').forEach(r => { if (r.value !== 'outro' && sel && list[r.value][0] === sel) { r.checked = true; hit = true; } });
    const o = root.querySelector('input[name="f-tipo"][value="outro"]');
    o.checked = !!sel && !hit; $('#f-outro').value = sel && !hit ? sel : '';
  }
  const syncUso = () => { const u = root.querySelector('input[name="f-usa"]:checked'); $('#f-uso').hidden = !u || u.value !== 'sim'; };
  function openNote(n, p, m) {
    editing = n ? n.id : null;
    $('#f-proc').value = n ? n.proc : p; $('#f-mat').value = n ? n.mat : m;
    $('#qz-dlg-t').textContent = n ? 'Editar post-it' : 'Novo post-it';
    fillCat(n ? n.oque : '');
    root.querySelectorAll('input[name="f-usa"]').forEach(r => { r.checked = r.value === (n ? usaOf(n) : 'sim'); });
    $('#f-quem').value = n ? n.quem || '' : '';
    root.querySelectorAll('input[name="f-func"]').forEach(r => { r.checked = r.value === ((n && n.func) || 'naosabe'); });
    syncUso();
    $('#f-del').hidden = !n; $('#f-err').hidden = true;
    $('#f-ok').textContent = n ? 'Salvar' : 'Colar no quadro';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  const closeDlg = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  $('#f-proc').addEventListener('change', () => fillCat(''));
  $('#f-mat').addEventListener('change', () => fillCat(''));
  root.querySelectorAll('input[name="f-usa"]').forEach(r => r.addEventListener('change', syncUso));
  $('#f-outro').addEventListener('input', () => { root.querySelector('input[name="f-tipo"][value="outro"]').checked = true; });
  root.addEventListener('click', e => {
    const add = e.target.closest('.qz-add'); if (add) return openNote(null, add.dataset.p, add.dataset.m);
    const nt = e.target.closest('.qz-note'); if (nt) return openNote(S.notes.find(n => n.id === nt.dataset.id));
  });
  $('#f-cancel').addEventListener('click', closeDlg);
  $('#f-del').addEventListener('click', () => {
    S.notes = S.notes.filter(n => n.id !== editing); if (S.an.escolhido === editing) S.an.escolhido = '';
    save(); renderAll(); closeDlg();
  });
  $('#qz-form').addEventListener('submit', e => {
    e.preventDefault();
    const p = $('#f-proc').value, m = $('#f-mat').value, tr = root.querySelector('input[name="f-tipo"]:checked');
    let oque = '', dec = '';
    if (tr && tr.value === 'outro') oque = $('#f-outro').value.trim();
    else if (tr) { const c = CAT[p][m][tr.value]; oque = c[0]; dec = c[1]; }
    if (!oque) { $('#f-err').hidden = false; return; }
    const ur = root.querySelector('input[name="f-usa"]:checked'), fr = root.querySelector('input[name="f-func"]:checked');
    const usa = ur ? ur.value : 'sim';
    const d = { proc: p, mat: m, oque, dec, usa, quem: usa === 'sim' ? $('#f-quem').value.trim() : '', func: usa === 'sim' && fr ? fr.value : 'naosabe' };
    if (editing) Object.assign(S.notes.find(n => n.id === editing), d);
    else S.notes.push(Object.assign({ id: uid() }, d));
    save(); renderAll(); closeDlg();
  });

  /* ---------- exportação ---------- */
  const chosen = () => S.notes.find(n => n.id === S.an.escolhido);
  const mecTxt = () => S.an.mec === 'outro' ? (S.an.mecOutro || 'Outro') : S.an.mec;
  const today = () => new Date().toLocaleDateString('pt-BR');
  const fname = ext => `quadro-grupo-${S.grupo || 'x'}-sessao1.${ext}`;
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const funcTxt = n => usaOf(n) === 'sim' ? (FUNC[n.func] || 'Não sabemos') : '—';
  const cl = s => String(s || '').replace(/\|/g, '/');
  function md() {
    const s = stats(), c = chosen();
    let t = `# Mapa da IA na sua empresa · Grupo ${S.grupo || '—'}\n\nSessão 1 · Seminário IA em Operações · COPPEAD/UFRJ · ${today()}\n`;
    if (S.integrantes) t += `\nIntegrantes: ${S.integrantes}\n`;
    t += `\n## Post-its (${s.n})\n\n| Processo | Tipo de análise | Tipo de problema | Decisão apoiada | Na empresa? | Quem decide | Funciona? |\n|---|---|---|---|---|---|---|\n`;
    MAT.forEach(([m]) => PROC.forEach(p => S.notes.filter(n => n.proc === p && n.mat === m).forEach(n => {
      t += `| ${p} | ${m} | ${cl(n.oque)}${n.id === S.an.escolhido ? ' ★' : ''} | ${cl(n.dec)} | ${USA[usaOf(n)]} | ${cl(n.quem)} | ${funcTxt(n)} |\n`;
    })));
    t += `\n## Leitura automática\n\n- Células ocupadas: ${s.occ} de 30 (${s.empty} vazias)\n- Processo com mais post-its: ${s.topP}\n- Tipo de análise com mais post-its: ${s.topM}\n- Na empresa: já usamos ${s.usa} · não usamos ${s.nusa} · não sabemos se usamos ${s.ns}\n- Entre os que usamos, funciona? Sim, medido: ${s.medido} · Achamos que sim: ${s.acha} · Não sabemos: ${s.naosabe} · Não: ${s.nao}\n`;
    t += `\n## Leitura do grupo\n\n1. Onde se concentram: ${S.an.concentra || '—'}\n2. Células vazias que chamam atenção: ${S.an.vazio || '—'}\n3. O que usamos sem saber se funciona: ${S.an.naosabe || '—'}\n`;
    t += `\n## Escolha\n\n4. Problema escolhido: ${c ? `${c.proc} × ${c.mat} · ${c.oque}` : '—'}\n   - Decisão apoiada: ${c && c.dec ? c.dec : '—'}\n   - Na empresa: ${c ? USA[usaOf(c)] : '—'}\n   - Quem decide com ela: ${c && c.quem ? c.quem : '—'}\n   - Funciona? ${c ? funcTxt(c) : '—'}\n   - Por que esse: ${S.an.porque || '—'}\n5. Caso real parecido: ${S.an.caso || '—'}\n6. Mecanismo de falha: ${mecTxt() || '—'}\n7. Pergunta em aberto: ${S.an.pergunta || '—'}\n`;
    return t;
  }
  function assistantText() {
    const c = chosen();
    return `Somos o Grupo ${S.grupo || '[n]'} e vamos começar a Sessão 2. Problema escolhido no quadro da Sessão 1:\n` +
      `- Processo e tipo de análise: ${c ? c.proc + ' × ' + c.mat : '—'}\n- Tipo de problema: ${c ? c.oque : '—'}\n- Decisão apoiada: ${c && c.dec ? c.dec : '—'}\n- Na empresa: ${c ? USA[usaOf(c)] : '—'}\n- Quem decide com ela: ${c && c.quem ? c.quem : '—'}\n- Funciona? ${c ? funcTxt(c) : '—'}\n` +
      `- Caso real parecido: ${S.an.caso || '—'}\n- Mecanismo de falha que ameaça: ${mecTxt() || '—'}\n- Pergunta em aberto: ${S.an.pergunta || '—'}`;
  }
  function buildReport() {
    const s = stats(), c = chosen();
    let b = '<table class="rb"><thead><tr><th></th>' + PROC.map(p => `<th>${p}</th>`).join('') + '</tr></thead><tbody>';
    MAT.forEach(([m]) => {
      b += `<tr><th>${m}</th>` + PROC.map(p => '<td>' + S.notes.filter(n => n.proc === p && n.mat === m).map(n =>
        `<div class="rn u-${usaOf(n)}${n.id === S.an.escolhido ? ' star' : ''}"><b>${n.id === S.an.escolhido ? '★ ' : ''}${esc(n.oque)}</b>${n.quem ? `<span>${esc(n.quem)}</span>` : ''}<em>${tagOf(n)[1]}</em></div>`).join('') + '</td>').join('') + '</tr>';
    });
    b += '</tbody></table>';
    const row = (k, v) => `<tr><td>${k}</td><td>${esc(v || '—')}</td></tr>`;
    report.innerHTML = `<section class="rp1"><div class="rh"><span>Mapa da IA na sua empresa · Sessão 1</span><b>Grupo ${esc(S.grupo || '—')}</b><span>${today()}</span></div>
      ${S.integrantes ? `<p class="ri">Integrantes: ${esc(S.integrantes)}</p>` : ''}${b}
      <p class="rs">${s.n} post-its · ${s.occ} de 30 células ocupadas · processo com mais: ${esc(s.topP)} · tipo de análise com mais: ${esc(s.topM)} · já usamos ${s.usa}, não usamos ${s.nusa}, não sabemos ${s.ns} · entre os usados: medido ${s.medido}, achamos que sim ${s.acha}, não sabemos se funciona ${s.naosabe}, não funciona ${s.nao}</p></section>
      <section class="rp2"><div class="rh"><span>Leitura do quadro e escolha</span><b>Grupo ${esc(S.grupo || '—')}</b><span>${today()}</span></div><table class="ra">
      ${row('1 · Onde se concentram', S.an.concentra)}${row('2 · Células vazias', S.an.vazio)}${row('3 · Usamos sem saber se funciona', S.an.naosabe)}
      ${row('4 · Problema escolhido', c ? `${c.proc} × ${c.mat} · ${c.oque}` : '')}${row('Decisão apoiada', c && c.dec)}${row('Na empresa', c ? USA[usaOf(c)] : '')}${row('Quem decide com ela', c && c.quem)}${row('Funciona?', c ? funcTxt(c) : '')}
      ${row('Por que esse', S.an.porque)}${row('5 · Caso real parecido', S.an.caso)}${row('6 · Mecanismo de falha', mecTxt())}${row('7 · Pergunta em aberto', S.an.pergunta)}</table>
      <p class="rs">Seminário IA aplicada a Operações, Processos e Supply Chain · COPPEAD/UFRJ · Prof. Dr. Thiago Lima</p></section>`;
  }
  $('#qz-pdf').addEventListener('click', () => {
    buildReport(); document.body.classList.add('qz-printing');
    const done = () => { document.body.classList.remove('qz-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { window.print(); setTimeout(done, 1500); }, 50);
  });
  $('#qz-md').addEventListener('click', () => download(fname('md'), md(), 'text/markdown;charset=utf-8'));
  $('#qz-json').addEventListener('click', () => download(fname('json'), JSON.stringify(S, null, 2), 'application/json'));
  $('#qz-copy').addEventListener('click', async () => {
    const t = assistantText();
    try { await navigator.clipboard.writeText(t); flash('Copiado: cole no Assistente ELO na Sessão 2'); }
    catch (e) { download(fname('txt'), t, 'text/plain;charset=utf-8'); flash('Sem acesso à área de transferência: baixei um .txt'); }
  });
  $('#qz-open').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result); if (!Array.isArray(d.notes)) throw 0;
        S = Object.assign(blank(), d); S.an = Object.assign(blank().an, d.an || {});
        $('#qz-grupo').value = S.grupo; $('#qz-integ').value = S.integrantes;
        ['concentra', 'vazio', 'naosabe', 'porque', 'caso', 'mecOutro', 'pergunta'].forEach(k => { $('#an-' + k).value = S.an[k] || ''; });
        mec.value = S.an.mec || ''; syncMec(); save(); renderAll(); flash('Quadro aberto');
      } catch (x) { flash('Arquivo inválido: use um .json salvo por este quadro'); }
      e.target.value = '';
    };
    r.readAsText(f);
  });
  let armed = false;
  $('#qz-clear').addEventListener('click', e => {
    if (!armed) { armed = true; e.target.textContent = 'Clique de novo para apagar tudo'; setTimeout(() => { armed = false; e.target.textContent = 'Limpar quadro'; }, 3000); return; }
    armed = false; e.target.textContent = 'Limpar quadro';
    S = blank(); $('#qz-grupo').value = ''; $('#qz-integ').value = '';
    ['concentra', 'vazio', 'naosabe', 'porque', 'caso', 'mecOutro', 'pergunta'].forEach(k => { $('#an-' + k).value = ''; });
    mec.value = ''; syncMec(); save(); renderAll(); flash('Quadro limpo');
  });
  root.querySelector('label.qz-b').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#qz-open').click(); } });

  renderAll();
})();
