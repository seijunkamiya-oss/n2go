
// === 工具 ===
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// 高亮当前导航
(function(){
  const cur = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(a => { if (a.getAttribute('href') === cur) a.classList.add('active'); });
})();

// === Grammar ===
async function initGrammar() {
  const data = await fetch('data/grammar.json').then(r => r.json());
  const mastered = new Set(store.get('mastered_grammar', []));
  const list = $('#grammar-list');

  function render() {
    const q = ($('#g-search')?.value || '').toLowerCase();
    const hideMastered = $('#g-mastered')?.checked;
    const filtered = data.filter(g => {
      if (q && !(g.pattern.toLowerCase().includes(q) || (g.meaning||'').includes(q) || (g.category||'').includes(q))) return false;
      if (hideMastered && mastered.has(g.id)) return false;
      return true;
    });

    // 按 category 分组
    const groups = {};
    filtered.forEach(g => {
      (groups[g.category] = groups[g.category] || []).push(g);
    });

    list.innerHTML = Object.entries(groups).map(([cat, items]) => `
      <h2 style="margin-top:24px">🏷️ ${escapeHtml(cat)} <span style="font-size:14px;color:#9CA3AF">（${items.length}）</span></h2>
      ${items.map(g => {
        const checked = mastered.has(g.id);
        return `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <h3 style="margin:0;color:#DB2777">${escapeHtml(g.pattern)}</h3>
            <label><input type="checkbox" data-gid="${g.id}" ${checked?'checked':''}> ✅ 已掌握</label>
          </div>
          <p style="margin-top:8px"><span class="badge badge-pink">意思</span> ${escapeHtml(g.meaning||'')}</p>
          <p style="margin-top:6px"><span class="badge badge-orange">例文</span> ${escapeHtml(g.example_jp||'')}</p>
          <p style="margin-top:4px;color:#6B7280;padding-left:8px;border-left:3px solid #FBCFE8">${escapeHtml(g.example_cn||'')}</p>
        </div>`;
      }).join('')}
    `).join('') || '<p style="text-align:center;color:#9CA3AF;padding:24px">🔍 没有匹配的内容</p>';

    $('#g-count').textContent = mastered.size;
    $('#g-progress').style.width = (mastered.size / data.length * 100) + '%';
    list.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', e => {
      const id = +e.target.dataset.gid;
      if (e.target.checked) mastered.add(id); else mastered.delete(id);
      store.set('mastered_grammar', [...mastered]);
      $('#g-count').textContent = mastered.size;
      $('#g-progress').style.width = (mastered.size / data.length * 100) + '%';
    }));
  }
  ['g-search','g-mastered'].forEach(id => $('#'+id)?.addEventListener('input', render));
  render();
}


// === Vocab ===
async function initVocab() {
  const raw = await fetch('data/vocab.json').then(r => r.json());
  let data = [...raw];
  const mastered = new Set(store.get('mastered_vocab', []));
  let hideKana = false, hideMean = false;
  const list = $('#vocab-list');

  function render() {
    const q = ($('#v-search')?.value || '').toLowerCase();
    const filtered = data.filter(v =>
      !q || (v.word||'').includes(q) || (v.kana||'').includes(q) || (v.meaning||'').includes(q) || (v.category||'').includes(q));
    list.innerHTML = `<p style="color:#6B7280;font-size:13px;margin-bottom:8px">共 ${filtered.length} / ${data.length} 个 · 点击右侧 ✓ 标记已掌握</p>
      <table>
        <tr>
          <th>汉字</th>
          <th>假名 ${hideKana?'<button class="btn btn-sm" id="v-showK">显示</button>':''}</th>
          <th>中文 ${hideMean?'<button class="btn btn-sm" id="v-showM">显示</button>':''}</th>
          <th>分类</th>
          <th>✓</th>
        </tr>` +
      filtered.map(v => {
        const checked = mastered.has(v.id);
        return `<tr>
          <td><b style="color:#DB2777;font-size:16px">${escapeHtml(v.word||'')}</b></td>
          <td>${hideKana?'<span style="color:#D1D5DB">●●●●</span>':'<span style="color:#6366F1">'+escapeHtml(v.kana||'')+'</span>'}</td>
          <td>${hideMean?'<span style="color:#D1D5DB">●●●●</span>':escapeHtml(v.meaning||'')}</td>
          <td><span class="badge badge-purple" style="font-size:11px">${escapeHtml(v.category||'')}</span></td>
          <td><input type="checkbox" data-vid="${v.id}" ${checked?'checked':''}></td>
        </tr>`;
      }).join('') + '</table>';
    $('#v-count').textContent = mastered.size;
    list.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', e => {
      const id = +e.target.dataset.vid;
      if (e.target.checked) mastered.add(id); else mastered.delete(id);
      store.set('mastered_vocab', [...mastered]);
      $('#v-count').textContent = mastered.size;
    }));
    $('#v-showK')?.addEventListener('click', () => { hideKana = false; render(); });
    $('#v-showM')?.addEventListener('click', () => { hideMean = false; render(); });
  }
  $('#v-search')?.addEventListener('input', render);
  $('#v-hideKana')?.addEventListener('click', () => { hideKana = !hideKana; render(); });
  $('#v-hideMean')?.addEventListener('click', () => { hideMean = !hideMean; render(); });
  $('#v-shuffle')?.addEventListener('click', () => { data.sort(() => Math.random() - 0.5); render(); });
  render();
}


// === Kanji ===
async function initKanji() {
  const data = await fetch('data/kanji.json').then(r => r.json());
  const list = $('#kanji-list');
  let showAll = true;

  function render() {
    const q = ($('#k-search')?.value || '').toLowerCase();
    const filtered = data.filter(k =>
      !q || k.kanji.includes(q) || k.reading.includes(q) || (k.mean||'').includes(q));
    list.innerHTML = filtered.map(k => `
      <div class="card" data-kid="${k.id}" style="cursor:pointer">
        <div style="font-size:32px;color:#DB2777;font-weight:700;text-align:center">${escapeHtml(k.kanji)}</div>
        <div class="kana-line" style="text-align:center;color:#6366F1;font-size:18px;margin:8px 0;${showAll?'':'visibility:hidden'}">${escapeHtml(k.reading)}</div>
        <div style="color:#6B7280;text-align:center;margin-bottom:6px">${escapeHtml(k.mean)}</div>
        <div style="background:#FEE2E2;padding:6px 10px;border-radius:8px;font-size:13px;color:#B91C1C;margin-top:6px">${escapeHtml(k.trap)}</div>
        <div style="background:#D1FAE5;padding:6px 10px;border-radius:8px;font-size:13px;color:#047857;margin-top:4px">💡 ${escapeHtml(k.tip)}</div>
      </div>
    `).join('') || '<p style="text-align:center;color:#9CA3AF;padding:24px">🔍 没有匹配的内容</p>';

    list.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const line = card.querySelector('.kana-line');
        line.style.visibility = line.style.visibility === 'hidden' ? 'visible' : 'hidden';
      });
    });
  }
  $('#k-search')?.addEventListener('input', render);
  $('#k-toggleAll')?.addEventListener('click', () => { showAll = !showAll; render(); });
  render();
}

// === Reading ===
async function initReading() {
  const data = await fetch('data/reading.json').then(r => r.json());
  const list = $('#reading-list');
  function render() {
    const f = $('#r-filter').value;
    const filtered = data.filter(d => !f || d.level === f);
    list.innerHTML = filtered.map(d => {
      const qhtml = d.questions.map((q, qi) => `
        <div style="margin-top:14px">
          <p><b>Q${qi+1}. ${escapeHtml(q.q)}</b></p>
          ${q.options.map((o, oi) => `
            <div class="option" data-rid="${d.id}" data-qi="${qi}" data-oi="${oi}" data-ans="${q.answer}">${oi+1}. ${escapeHtml(o)}</div>
          `).join('')}
          <div class="explain hidden" data-eid="${d.id}-${qi}">💡 ${escapeHtml(q.explain)} （答案：${q.answer+1}）</div>
        </div>
      `).join('');
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <h3 style="margin:0">📖 ${escapeHtml(d.title)}</h3>
          <span class="badge badge-blue">${escapeHtml(d.level)}</span>
        </div>
        <div class="passage" style="margin-top:12px">${escapeHtml(d.passage)}</div>
        ${qhtml}
      </div>`;
    }).join('');

    list.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => {
        const rid = opt.dataset.rid, qi = opt.dataset.qi;
        const ans = +opt.dataset.ans, oi = +opt.dataset.oi;
        list.querySelectorAll(`.option[data-rid="${rid}"][data-qi="${qi}"]`).forEach(o => {
          o.classList.remove('selected','correct','wrong');
          if (+o.dataset.oi === ans) o.classList.add('correct');
        });
        if (oi !== ans) opt.classList.add('wrong');
        $(`.explain[data-eid="${rid}-${qi}"]`)?.classList.remove('hidden');
      });
    });
  }
  $('#r-filter').addEventListener('change', render);
  render();
}

// === Listening ===
async function initListening() {
  const data = await fetch('data/listening.json').then(r => r.json());
  const list = $('#listening-list');
  function render() {
    const f = $('#l-filter').value;
    const filtered = data.filter(d => !f || d.level === f);
    list.innerHTML = filtered.map(d => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <h3 style="margin:0">🎧 ${d.id}. ${escapeHtml(d.title)}</h3>
          <span class="badge badge-orange">${escapeHtml(d.level)}</span>
        </div>
        <button class="btn btn-sm btn-secondary" style="margin-top:10px" onclick="this.nextElementSibling.classList.toggle('hidden')">👁️ 显示/隐藏 听力文本</button>
        <div class="passage hidden" style="margin-top:8px">${escapeHtml(d.script)}</div>
        <p style="margin-top:10px"><b>❓ ${escapeHtml(d.question)}</b></p>
        ${d.options.map((o, oi) => `
          <div class="option" data-lid="${d.id}" data-oi="${oi}" data-ans="${d.answer}">${oi+1}. ${escapeHtml(o)}</div>
        `).join('')}
        <div class="explain hidden" data-leid="${d.id}">💡 ${escapeHtml(d.explain)} （答案：${d.answer+1}）</div>
      </div>
    `).join('');

    list.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => {
        const lid = opt.dataset.lid, ans = +opt.dataset.ans, oi = +opt.dataset.oi;
        list.querySelectorAll(`.option[data-lid="${lid}"]`).forEach(o => {
          o.classList.remove('selected','correct','wrong');
          if (+o.dataset.oi === ans) o.classList.add('correct');
        });
        if (oi !== ans) opt.classList.add('wrong');
        $(`.explain[data-leid="${lid}"]`)?.classList.remove('hidden');
      });
    });
  }
  $('#l-filter').addEventListener('change', render);
  render();
}

// === Exam ===
async function initExam() {
  const data = await fetch('data/exam.json').then(r => r.json());
  $('#start-exam')?.addEventListener('click', () => {
    $('#exam-status').classList.add('hidden');
    const area = $('#exam-area');
    area.classList.remove('hidden');
    area.innerHTML = data.map((q, i) => `
      <div class="card">
        <span class="badge badge-purple">${escapeHtml(q.section)}</span>
        <p style="margin-top:8px"><b>${i+1}. ${escapeHtml(q.q)}</b></p>
        ${q.options.map((o, oi) => `
          <label class="option"><input type="radio" name="q${i}" value="${oi}" style="margin-right:8px">${oi+1}. ${escapeHtml(o)}</label>
        `).join('')}
      </div>
    `).join('') + `<button class="btn btn-success" id="submit-exam" style="font-size:18px;padding:14px 36px">📊 提交评分</button>`;

    $('#submit-exam').addEventListener('click', () => {
      let score = 0;
      const details = data.map((q, i) => {
        const sel = document.querySelector(`input[name="q${i}"]:checked`);
        const my = sel ? +sel.value : -1;
        const ok = my === q.answer;
        if (ok) score++;
        return { i, q: q.q, my, ans: q.answer, options: q.options, explain: q.explain, ok };
      });
      const pct = Math.round(score / data.length * 100);
      const est = Math.round(pct * 1.8);  // 粗略换算 180 分制
      const res = $('#exam-result');
      res.classList.remove('hidden');
      res.innerHTML = `
        <div class="hero" style="background:linear-gradient(135deg,${pct>=60?'#10B981':'#F43F5E'},${pct>=60?'#34D399':'#FB923C'})">
          <span class="emoji">${pct>=60?'🎉':'💪'}</span>
          <h1>${score} / ${data.length} 题正确</h1>
          <p>正确率 ${pct}% · 估算 N2 等价分 ≈ ${est}/180</p>
        </div>
        <h3>📋 答题详情</h3>
        ${details.map(d => `
          <div class="card" style="border-left:6px solid ${d.ok?'#10B981':'#EF4444'}">
            <p>${d.ok?'✅':'❌'} <b>${d.i+1}.</b> ${escapeHtml(d.q)}</p>
            <p style="font-size:13px;color:#6B7280">你的答案：${d.my>=0?(d.my+1)+'. '+escapeHtml(d.options[d.my]):'未作答'} ｜ 正确：${d.ans+1}. ${escapeHtml(d.options[d.ans])}</p>
            <div class="explain">💡 ${escapeHtml(d.explain)}</div>
          </div>
        `).join('')}
        <button class="btn" onclick="location.reload()">🔄 再来一次</button>
      `;
      res.scrollIntoView({behavior:'smooth'});
    });
  });
}

// === Plan ===
function initPlan() {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = [
    { id: 1, name: '📝 学语法 5 条' },
    { id: 2, name: '📚 背单词 30 个' },
    { id: 3, name: '🈷️ 复习汉字 10 个' },
    { id: 4, name: '📰 读解 1 篇' },
    { id: 5, name: '🎧 听解 3 题' },
    { id: 6, name: '✍️ 错题复盘' },
  ];
  let progress = store.get('plan_progress', {});
  progress[today] = progress[today] || [];

  function render() {
    const today = new Date().toISOString().slice(0, 10);
    const done = new Set(progress[today] || []);
    $('#today-tasks').innerHTML = tasks.map(t => `
      <div style="display:flex;align-items:center;padding:10px 14px;background:${done.has(t.id)?'#D1FAE5':'#F9FAFB'};border-radius:10px;margin:6px 0;cursor:pointer" data-tid="${t.id}">
        <span style="font-size:22px;margin-right:12px">${done.has(t.id)?'✅':'⭕'}</span>
        <span style="${done.has(t.id)?'text-decoration:line-through;color:#9CA3AF':''}">${t.name}</span>
      </div>
    `).join('');
    $('#today-tasks').querySelectorAll('[data-tid]').forEach(el => {
      el.addEventListener('click', () => {
        const id = +el.dataset.tid;
        progress[today] = progress[today] || [];
        const idx = progress[today].indexOf(id);
        if (idx >= 0) progress[today].splice(idx, 1);
        else progress[today].push(id);
        store.set('plan_progress', progress);
        render();
      });
    });
    const pct = done.size / tasks.length * 100;
    $('#today-progress').style.width = pct + '%';

    // streak
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if ((progress[k]||[]).length > 0) streak++; else break;
    }
    $('#streak-days').textContent = streak;
    // total
    const total = Object.values(progress).reduce((s, a) => s + a.length, 0);
    $('#total-done').textContent = total;

    // 7 days
    const days = ['日','月','火','水','木','金','土'];
    let weekHtml = '';
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const cnt = (progress[k]||[]).length;
      const isToday = k === today;
      weekHtml += `<div style="text-align:center;padding:8px;background:${cnt>0?'linear-gradient(135deg,#10B981,#34D399)':'#F3F4F6'};color:${cnt>0?'#fff':'#9CA3AF'};border-radius:10px;${isToday?'border:3px solid #F43F5E':''}">
        <div style="font-size:12px">${days[d.getDay()]}</div>
        <div style="font-size:18px;font-weight:700;margin-top:4px">${d.getDate()}</div>
        <div style="font-size:11px;margin-top:4px">${cnt>0?cnt+'/6':'—'}</div>
      </div>`;
    }
    $('#week-grid').innerHTML = weekHtml;
  }

  $('#checkin-btn')?.addEventListener('click', () => {
    progress[today] = tasks.map(t => t.id);  // 一键全打卡
    store.set('plan_progress', progress);
    const btn = $('#checkin-btn');
    btn.textContent = '🎉 打卡成功！';
    btn.classList.add('celebrate');
    setTimeout(() => btn.textContent = '🌱 今日打卡', 2000);
    render();
  });
  $('#reset-btn')?.addEventListener('click', () => {
    if (confirm('确定重置所有进度吗？')) {
      localStorage.clear();
      location.reload();
    }
  });
  render();
}

// === 自动初始化 ===
const page = location.pathname.split('/').pop() || 'index.html';
const initMap = {
  'grammar.html': initGrammar,
  'vocab.html': initVocab,
  'kanji.html': initKanji,
  'reading.html': initReading,
  'listening.html': initListening,
  'exam.html': initExam,
  'plan.html': initPlan,
};
initMap[page]?.();
