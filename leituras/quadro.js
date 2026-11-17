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
  const CEN = [
    ['FarmaSul', 'Planejar', 'Preditiva', 'Previsão de demanda por item e CD (proposta de fornecedor)', '6 compradores, revisão toda segunda', 'Só o fornecedor: "erro de previsão 35% menor em outro distribuidor"'],
    ['Mercado Bom Dia', 'Planejar', 'Prescritiva', 'Pedido sugerido de perecíveis por loja (proposta de fornecedor)', 'Encarregado de cada loja, pedido até as 14h', 'Só o fornecedor: "92% de acurácia" e "até 30% menos perdas"'],
    ['Lumen Higiene', 'Suprir', 'Preditiva', 'Alerta de risco de atraso de fornecedor (proposta de fornecedor)', '9 compradores, reunião semanal de riscos', 'Só o fornecedor: "antecipa 80% dos atrasos com 2 semanas"'],
    ['TransLog', 'Entregar', 'Preditiva', 'Previsão de chegada de caminhões e janelas de doca (proposta de fornecedor)', '2 controladores de pátio por turno', 'Só o fornecedor: "erro médio de 12 minutos"'],
    ['Serra Alta', 'Produzir', 'Preditiva', 'Previsão de falha de rolamentos das correias (proposta de fornecedor)', '14 técnicos por turno, paradas planejadas semanais', 'Só o fornecedor: "detecta 85% das falhas com 7 dias de antecedência"'],
    ['Hospital Santa Clara', 'Habilitar', 'Preditiva', 'Previsão de ocupação de leitos para a escala de enfermagem (proposta de fornecedor)', 'Reunião diária de leitos; escala fechada com 30 dias', 'Só o fornecedor: "95% de acurácia"'],
    ['Veste Já', 'Retornar', 'Agêntica', 'Assistente de IA que atende e autoriza devoluções (proposta de fornecedor)', 'O próprio assistente; política definida pelo comercial', 'Só o fornecedor: "resolve 70% dos atendimentos sem humano"'],
    ['Precisa Autopeças', 'Produzir', 'Preditiva', 'Inspeção visual de defeitos por câmera (proposta de fornecedor)', '12 inspetores por turno', 'Só o fornecedor: "detecta 99% dos defeitos em laboratório"']
  ];
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
  <p class="qz-help">Clique em <b>+</b> na célula do processo e do degrau para colar um post-it. Clique no post-it para editar. Tudo fica salvo neste navegador; use <b>Salvar arquivo</b> para levar o quadro para outro computador.</p>
  <div class="qz-boardw"><table class="qz-board" id="qz-board"></table></div>
  <div class="qz-auto" id="qz-auto"></div>
  <div class="qz-an">
    <h3>Leitura do quadro</h3>
    <label>1 · Onde se concentram os post-its, e por quê?<textarea id="an-concentra" rows="2"></textarea></label>
    <label>2 · Que células vazias chamam atenção?<textarea id="an-vazio" rows="2"></textarea></label>
    <label>3 · Onde a resposta foi “não sabemos”? O que isso diz sobre como a empresa mede a IA?<textarea id="an-naosabe" rows="2"></textarea></label>
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
      <label id="qz-cen-w">Sem exemplo? Use um cenário do seminário<select id="f-cen"><option value="">—</option>${CEN.map((c, i) => `<option value="${i}">${esc(c[0])}</option>`).join('')}</select></label>
      <div class="qz-2"><label>Processo<select id="f-proc">${PROC.map(p => `<option>${p}</option>`).join('')}</select></label>
      <label>Degrau<select id="f-mat">${MAT.map(m => `<option>${m[0]}</option>`).join('')}</select></label></div>
      <label>O quê <small>o que a ferramenta entrega</small><input id="f-oque" type="text" required></label>
      <label>Quem decide com ela <small>quem usa o resultado, e quando</small><input id="f-quem" type="text" required></label>
      <fieldset><legend>Funciona?</legend>${Object.entries(FUNC).map(([k, v]) => `<label class="qz-r"><input type="radio" name="f-func" value="${k}"> ${v}</label>`).join('')}</fieldset>
      <label>Quem mediu, e contra o quê? <small>opcional</small><input id="f-mediu" type="text"></label>
      <label>Autor <small>opcional</small><input id="f-autor" type="text"></label>
      <p class="qz-err" id="f-err" hidden>Preencha “O quê” e “Quem decide com ela”: sem quem decide, o post-it não entra.</p>
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
  function noteHTML(n) {
    const star = S.an.escolhido === n.id;
    return `<button type="button" class="qz-note${star ? ' star' : ''}${n.cen ? ' cen' : ''}" data-id="${n.id}">
      ${star ? '<i>★ escolhido</i>' : ''}<b>${esc(n.oque)}</b><span>${esc(n.quem)}</span><em class="f-${n.func || 'naosabe'}">${FUNC[n.func] || 'Não sabemos'}</em></button>`;
  }

  /* ---------- leitura automática ---------- */
  function stats() {
    const byP = PROC.map(p => [p, S.notes.filter(n => n.proc === p).length]);
    const byM = MAT.map(([m]) => [m, S.notes.filter(n => n.mat === m).length]);
    const cells = new Set(S.notes.map(n => n.mat + '|' + n.proc));
    const top = arr => { const mx = Math.max(...arr.map(a => a[1])); return mx ? arr.filter(a => a[1] === mx).map(a => a[0]).join(', ') + ` (${mx})` : '—'; };
    const fc = k => S.notes.filter(n => (n.func || 'naosabe') === k).length;
    return { n: S.notes.length, occ: cells.size, empty: 30 - cells.size, topP: top(byP), topM: top(byM), medido: fc('medido'), acha: fc('acha'), naosabe: fc('naosabe'), nao: fc('nao'), cen: S.notes.filter(n => n.cen).length };
  }
  function renderAuto() {
    const s = stats();
    $('#qz-auto').innerHTML = `<div><b>${s.n}</b><span>post-its</span></div><div><b>${s.occ}/30</b><span>células ocupadas</span></div><div><b>${s.naosabe}</b><span>“não sabemos”</span></div><div><b>${s.medido}</b><span>medidos</span></div><p>Processo com mais post-its: <b>${esc(s.topP)}</b> · Degrau com mais: <b>${esc(s.topM)}</b></p>`;
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
  function openNote(n, p, m) {
    editing = n ? n.id : null;
    $('#qz-dlg-t').textContent = n ? 'Editar post-it' : 'Novo post-it';
    $('#qz-cen-w').hidden = !!n; $('#f-cen').value = '';
    $('#f-proc').value = n ? n.proc : p; $('#f-mat').value = n ? n.mat : m;
    $('#f-oque').value = n ? n.oque : ''; $('#f-quem').value = n ? n.quem : '';
    $('#f-mediu').value = n ? n.mediu || '' : ''; $('#f-autor').value = n ? n.autor || '' : '';
    root.querySelectorAll('input[name="f-func"]').forEach(r => { r.checked = r.value === ((n && n.func) || 'naosabe'); });
    $('#f-del').hidden = !n; $('#f-err').hidden = true;
    $('#f-ok').textContent = n ? 'Salvar' : 'Colar no quadro';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    $('#f-oque').focus();
  }
  const closeDlg = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  $('#f-cen').addEventListener('change', e => {
    const c = CEN[e.target.value]; if (!c) return;
    $('#f-proc').value = c[1]; $('#f-mat').value = c[2]; $('#f-oque').value = c[0] + ': ' + c[3]; $('#f-quem').value = c[4]; $('#f-mediu').value = c[5];
    root.querySelectorAll('input[name="f-func"]').forEach(r => { r.checked = r.value === 'naosabe'; });
  });
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
    const oque = $('#f-oque').value.trim(), quem = $('#f-quem').value.trim();
    if (!oque || !quem) { $('#f-err').hidden = false; return; }
    const fr = root.querySelector('input[name="f-func"]:checked');
    const d = { proc: $('#f-proc').value, mat: $('#f-mat').value, oque, quem, func: fr ? fr.value : 'naosabe', mediu: $('#f-mediu').value.trim(), autor: $('#f-autor').value.trim() };
    if (editing) Object.assign(S.notes.find(n => n.id === editing), d);
    else S.notes.push(Object.assign({ id: uid(), cen: $('#f-cen').value !== '' }, d));
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
  function md() {
    const s = stats(), c = chosen();
    let t = `# Mapa da IA na sua empresa · Grupo ${S.grupo || '—'}\n\nSessão 1 · Seminário IA em Operações · COPPEAD/UFRJ · ${today()}\n`;
    if (S.integrantes) t += `\nIntegrantes: ${S.integrantes}\n`;
    t += `\n## Post-its (${s.n})\n\n| Processo | Degrau | O quê | Quem decide com ela | Funciona? | Quem mediu |\n|---|---|---|---|---|---|\n`;
    MAT.forEach(([m]) => PROC.forEach(p => S.notes.filter(n => n.proc === p && n.mat === m).forEach(n => {
      t += `| ${p} | ${m} | ${(n.oque + (n.id === S.an.escolhido ? ' ★' : '')).replace(/\|/g, '/')} | ${n.quem.replace(/\|/g, '/')} | ${FUNC[n.func] || 'Não sabemos'} | ${(n.mediu || '').replace(/\|/g, '/')} |\n`;
    })));
    t += `\n## Leitura automática\n\n- Células ocupadas: ${s.occ} de 30 (${s.empty} vazias)\n- Processo com mais post-its: ${s.topP}\n- Degrau com mais post-its: ${s.topM}\n- Funciona? Sim, medido: ${s.medido} · Achamos que sim: ${s.acha} · Não sabemos: ${s.naosabe} · Não: ${s.nao}\n`;
    t += `\n## Leitura do grupo\n\n1. Onde se concentram: ${S.an.concentra || '—'}\n2. Células vazias que chamam atenção: ${S.an.vazio || '—'}\n3. Onde foi "não sabemos": ${S.an.naosabe || '—'}\n`;
    t += `\n## Escolha\n\n4. Problema escolhido: ${c ? `${c.proc} × ${c.mat} · ${c.oque}` : '—'}\n   - Quem decide com ela: ${c ? c.quem : '—'}\n   - Funciona? ${c ? (FUNC[c.func] || 'Não sabemos') + (c.mediu ? ` (${c.mediu})` : '') : '—'}\n   - Por que esse: ${S.an.porque || '—'}\n5. Caso real parecido: ${S.an.caso || '—'}\n6. Mecanismo de falha: ${mecTxt() || '—'}\n7. Pergunta em aberto: ${S.an.pergunta || '—'}\n`;
    return t;
  }
  function assistantText() {
    const c = chosen();
    return `Somos o Grupo ${S.grupo || '[n]'} e vamos começar a Sessão 2. Problema escolhido no quadro da Sessão 1:\n` +
      `- Célula: ${c ? c.proc + ' × ' + c.mat : '—'}\n- O quê: ${c ? c.oque : '—'}\n- Quem decide com ela: ${c ? c.quem : '—'}\n- Funciona? ${c ? (FUNC[c.func] || 'Não sabemos') + (c.mediu ? ' (' + c.mediu + ')' : '') : '—'}\n` +
      `- Caso real parecido: ${S.an.caso || '—'}\n- Mecanismo de falha que ameaça: ${mecTxt() || '—'}\n- Pergunta em aberto: ${S.an.pergunta || '—'}`;
  }
  function buildReport() {
    const s = stats(), c = chosen();
    let b = '<table class="rb"><thead><tr><th></th>' + PROC.map(p => `<th>${p}</th>`).join('') + '</tr></thead><tbody>';
    MAT.forEach(([m]) => {
      b += `<tr><th>${m}</th>` + PROC.map(p => '<td>' + S.notes.filter(n => n.proc === p && n.mat === m).map(n =>
        `<div class="rn${n.id === S.an.escolhido ? ' star' : ''}"><b>${n.id === S.an.escolhido ? '★ ' : ''}${esc(n.oque)}</b><span>${esc(n.quem)}</span><em>${FUNC[n.func] || 'Não sabemos'}</em></div>`).join('') + '</td>').join('') + '</tr>';
    });
    b += '</tbody></table>';
    const row = (k, v) => `<tr><td>${k}</td><td>${esc(v || '—')}</td></tr>`;
    report.innerHTML = `<section class="rp1"><div class="rh"><span>Mapa da IA na sua empresa · Sessão 1</span><b>Grupo ${esc(S.grupo || '—')}</b><span>${today()}</span></div>
      ${S.integrantes ? `<p class="ri">Integrantes: ${esc(S.integrantes)}</p>` : ''}${b}
      <p class="rs">${s.n} post-its · ${s.occ} de 30 células ocupadas · processo com mais: ${esc(s.topP)} · degrau com mais: ${esc(s.topM)} · Funciona? medido ${s.medido} · achamos que sim ${s.acha} · não sabemos ${s.naosabe} · não ${s.nao}</p></section>
      <section class="rp2"><div class="rh"><span>Leitura do quadro e escolha</span><b>Grupo ${esc(S.grupo || '—')}</b><span>${today()}</span></div><table class="ra">
      ${row('1 · Onde se concentram', S.an.concentra)}${row('2 · Células vazias', S.an.vazio)}${row('3 · “Não sabemos”', S.an.naosabe)}
      ${row('4 · Problema escolhido', c ? `${c.proc} × ${c.mat} · ${c.oque}` : '')}${row('Quem decide com ela', c && c.quem)}${row('Funciona?', c ? (FUNC[c.func] || 'Não sabemos') + (c.mediu ? ' (' + c.mediu + ')' : '') : '')}
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
