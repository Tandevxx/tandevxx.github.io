// Helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const toast = (msg) => {
  const t = document.querySelector('.toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1400);
};

// Active tab highlight handled in HTML via active class.

// Journal
(function(){
  const form = $('#journal-form');
  if(!form) return;
  const list = $('#journal-list');
  const key = 'aura.journal';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const render = ()=>{
     if(!list) return;
     list.innerHTML = data.length? '' : '<div class="empty">No entries yet. Write your first cute thought ✨</div>';
     data.slice().reverse().forEach((d, idx)=>{
        const li = document.createElement('div');
        li.className='section';
        li.innerHTML = `<div class="small">${new Date(d.ts).toLocaleString()}</div><div>${d.text}</div>`;
        list.appendChild(li);
     });
  };
  render();
  form.addEventListener('submit', (e)=>{
     e.preventDefault();
     const txt = form.querySelector('textarea').value.trim();
     if(!txt) return;
     data.push({text: txt, ts: Date.now()});
     localStorage.setItem(key, JSON.stringify(data));
     form.reset(); render(); toast('Saved to Journal');
  });
})();

// Mood
(function(){
  const container = $('#mood-grid');
  if(!container) return;
  const key='aura.moods';
  const moods = JSON.parse(localStorage.getItem(key) || '[]');
  const btns = $$('#mood-grid button');
  const list = $('#mood-list');
  const render = ()=>{
    if(!list) return;
    list.innerHTML = moods.length? '' : '<div class="empty">No mood logs yet. Tap an emoji below 💖</div>';
    moods.slice().reverse().forEach(m => {
      const row = document.createElement('div');
      row.className='list-item';
      row.innerHTML = `<div class="section"><div class="kpi"><div class="chip"><div class="num">${m.emoji}</div><div class="small">${m.note||''}</div></div><div class="chip"><div class="small">Recorded</div><div class="num">${new Date(m.ts).toLocaleString()}</div></div></div></div>`;
      list.appendChild(row);
    });
  };
  render();
  btns.forEach(b=>{
     b.addEventListener('click', ()=>{
        const emoji = b.textContent.trim();
        const note = prompt('Add a quick note? (optional)') || '';
        moods.push({emoji, note, ts: Date.now()});
        localStorage.setItem(key, JSON.stringify(moods));
        render(); toast('Mood saved');
     });
  });
})();

// Period tracker (very simple next period estimate)
(function(){
  const form = $('#period-form');
  if(!form) return;
  const key='aura.period';
  const state = JSON.parse(localStorage.getItem(key) || '{"cycle":28,"last":null}');
  const lastEl = form.querySelector('input[name=last]');
  const cycleEl = form.querySelector('input[name=cycle]');
  if(state.last) lastEl.value = state.last;
  if(state.cycle) cycleEl.value = state.cycle;
  const out = $('#period-next');
  const calc = ()=>{
    const last = new Date(lastEl.value);
    const cycle = parseInt(cycleEl.value||'28',10);
    if(String(last) !== 'Invalid Date'){
      const next = new Date(last.getTime() + cycle*24*60*60*1000);
      out.textContent = next.toDateString();
    } else {
      out.textContent = '—';
    }
  };
  calc();
  form.addEventListener('input', ()=>{
     state.last = lastEl.value;
     state.cycle = parseInt(cycleEl.value||'28',10);
     localStorage.setItem(key, JSON.stringify(state));
     calc();
  });
})();

// Sport (simple log)
(function(){
  const form = $('#sport-form');
  if(!form) return;
  const key='aura.sport';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const tbody = $('#sport-rows');
  const render = ()=>{
    tbody.innerHTML = data.length? '' : '<tr><td colspan="3" class="small">No sessions yet. Log your first one 🏃‍♀️</td></tr>';
    data.slice().reverse().forEach(s=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.date}</td><td>${s.activity}</td><td>${s.mins}m</td>`;
      tbody.appendChild(tr);
    });
  };
  render();
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const d = form.querySelector('input[name=date]').value;
    const a = form.querySelector('input[name=activity]').value.trim();
    const m = parseInt(form.querySelector('input[name=mins]').value||'0',10);
    if(!d || !a || !m) return;
    data.push({date:d, activity:a, mins:m});
    localStorage.setItem(key, JSON.stringify(data));
    form.reset(); render(); toast('Workout saved');
  });
})();

// Routines (am/pm checklists)
(function(){
  const area = $('#routine-area');
  if(!area) return;
  const key='aura.routines';
  const defaults = { am:["Water","SPF","Make bed","10-min walk"], pm:["Skincare","Stretch","Plan tomorrow","Gratitude"] };
  const state = JSON.parse(localStorage.getItem(key) || JSON.stringify(defaults));
  const renderList = (arr, pref)=>{
    const ul = document.createElement('ul');
    ul.className='list';
    arr.forEach((t,i)=>{
      const id = `${pref}-${i}`;
      const li = document.createElement('li');
      li.innerHTML = `<label style="display:flex;gap:10px;align-items:center">
        <input type="checkbox" id="${id}">
        <span>${t}</span>
      </label>`;
      ul.appendChild(li);
    });
    return ul;
  };
  area.innerHTML = '';
  const am = document.createElement('div'); am.className='section'; am.innerHTML='<h2>AM Routine</h2>'; am.appendChild(renderList(state.am,'am'));
  const pm = document.createElement('div'); pm.className='section'; pm.innerHTML='<h2>PM Routine</h2>'; pm.appendChild(renderList(state.pm,'pm'));
  area.appendChild(am); area.appendChild(pm);

  // add item
  const form = $('#routine-form');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const when = form.querySelector('select').value;
    const txt = form.querySelector('input[name=item]').value.trim();
    if(!txt) return;
    state[when].push(txt);
    localStorage.setItem(key, JSON.stringify(state));
    toast('Routine item added'); location.reload();
  });
})();

// Glow shelf (simple saved links)
(function(){
  const form = $('#glow-form');
  if(!form) return;
  const key='aura.glow';
  const items = JSON.parse(localStorage.getItem(key) || '[]');
  const grid = $('#glow-grid');
  const render = ()=>{
    grid.innerHTML = items.length? '' : '<div class="empty">Add your fav products or inspo links 💗</div>';
    items.slice().reverse().forEach(it=>{
      const card = document.createElement('a');
      card.className='card'; card.href=it.url; card.target='_blank';
      card.innerHTML = `<div class="card-title">${it.title || new URL(it.url).hostname}</div><div class="small">${it.url}</div><div class="tag">${it.tag||'inspo'}</div>`;
      grid.appendChild(card);
    });
  };
  render();
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const url = form.querySelector('input[name=url]').value.trim();
    const title = form.querySelector('input[name=title]').value.trim();
    const tag = form.querySelector('input[name=tag]').value.trim();
    if(!url) return;
    items.push({url, title, tag, ts: Date.now()});
    localStorage.setItem(key, JSON.stringify(items));
    form.reset(); render(); toast('Added to Glow Shelf');
  });
})();
