/* ============================================================
   GEN Z CALENDAR — SYSTEM DEFINITION
   14 months. Months 1–13 = 25 days. Month 14 (Comeback) = 40 days.
   5-day week: Grind, Skill, Creator, Vibe, Bunk.
   ============================================================ */

const MONTHS = [
  {n:1,  name:"Ignite",      tag:"Start Strong, Build Momentum", icon:"🔥", accent:"var(--pink)",   days:25},
  {n:2,  name:"Focus",       tag:"Stay Focused, Build Habits",   icon:"🎯", accent:"var(--cyan)",   days:25},
  {n:3,  name:"Learn",       tag:"Learn Something New",          icon:"📗", accent:"var(--purple)", days:25},
  {n:4,  name:"Create",      tag:"Create, Think, Innovate",      icon:"💡", accent:"var(--orange)", days:25},
  {n:5,  name:"Grow",        tag:"Grow Daily, Level Up",         icon:"🌱", accent:"var(--lime)",   days:25},
  {n:6,  name:"Connect",     tag:"Connect More, Build Bonds",    icon:"🤝", accent:"var(--cyan)",   days:25},
  {n:7,  name:"Balance",     tag:"Balance Work & Life",          icon:"⚖️", accent:"var(--purple)", days:25},
  {n:8,  name:"Discipline",  tag:"Discipline Today, Freedom Tomorrow", icon:"✅", accent:"var(--pink)", days:25},
  {n:9,  name:"Action",      tag:"Take Action, No Excuses",      icon:"🚀", accent:"var(--orange)", days:25},
  {n:10, name:"Hustle",      tag:"Keep Hustling, Keep Moving",   icon:"⚡", accent:"var(--yellow)", days:25},
  {n:11, name:"Health",      tag:"Health is Wealth",             icon:"❤️", accent:"var(--pink)",   days:25},
  {n:12, name:"Gratitude",   tag:"Be Thankful, Stay Humble",     icon:"🙏", accent:"var(--lime)",   days:25},
  {n:13, name:"Reflect",     tag:"Reflect, Evaluate, Prepare",   icon:"📝", accent:"var(--cyan)",   days:25},
  {n:14, name:"Comeback Month", tag:"Reset, Recharge, Comeback Stronger", icon:"🔄", accent:"var(--teal)", days:40},
];

const DAYTYPES = [
  {key:"grind",   name:"Grind Day",   short:"Grind",   icon:"💼", accent:"var(--grind)",   focus:"Plan · Work Deep · Get Things Done · Build Value"},
  {key:"skill",   name:"Skill Day",   short:"Skill",   icon:"📗", accent:"var(--skill)",   focus:"Study · Learn New Things · Build Skills · Grow Knowledge"},
  {key:"creator", name:"Creator Day", short:"Creator", icon:"✏️", accent:"var(--creator)", focus:"Work on Projects · Create Content · Build Something · Innovate"},
  {key:"vibe",    name:"Vibe Day",    short:"Vibe",    icon:"👥", accent:"var(--vibe)",    focus:"Meet People · Help Others · Build Relationships · Teamwork"},
  {key:"bunk",    name:"Bunk Day",    short:"Bunk",    icon:"😎", accent:"var(--bunk)",    focus:"Relax · Do What You Love · No Pressure · Enjoy Life"},
];

const CHECKLIST_ITEMS = [
  "8+ Hours Sleep","Workout / Walk / Yoga","Learn Something New",
  "Eat Healthy","No Procrastination","Gratitude","Plan Tomorrow"
];

const WHEEL_AXES = ["Mind","Body","Skills","Focus","Relationships","Fun","Growth"];

const NAV = [
  {id:"today",    label:"Today",    icon:"☀️"},
  {id:"calendar", label:"Calendar", icon:"📅"},
  {id:"habits",   label:"Habits",   icon:"📊"},
  {id:"tasks",    label:"Tasks",    icon:"📋"},
  {id:"review",   label:"Review",   icon:"🪞"},
  {id:"goals",    label:"Goals",    icon:"🎯"},
];

/* ---------- Date math: map real calendar day-of-year -> custom system ---------- */
function dayOfYear(d){
  const start = new Date(d.getFullYear(),0,1);
  return Math.floor((d - start)/864e5) + 1;
}
function isLeap(y){ return (y%4===0 && y%100!==0) || y%400===0; }

function customDateFromReal(d){
  let doy = dayOfYear(d);
  const totalDays = isLeap(d.getFullYear()) ? 366 : 365;
  // compress leap day into last month so system always totals to 13*25+40
  if(doy > 365) doy = 365;
  let remaining = doy;
  for(const m of MONTHS){
    if(remaining <= m.days){
      return {month:m, dayInMonth:remaining, dayOfYear:doy};
    }
    remaining -= m.days;
  }
  return {month:MONTHS[13], dayInMonth:40, dayOfYear:doy};
}

function dayTypeForDayInMonth(dayInMonth){
  const idx = (dayInMonth - 1) % 5;
  return DAYTYPES[idx];
}

function setAccent(accent){
  const root = document.documentElement;
  root.style.setProperty('--accent-current', accent);
  if(accent === 'var(--rainbow)'){
    root.style.setProperty('--accent', getComputedStyle(root).getPropertyValue('--comeback') || '#A855F7');
    root.style.setProperty('--accent-gradient', getComputedStyle(root).getPropertyValue('--rainbow'));
  } else {
    root.style.setProperty('--accent', accent);
    root.style.removeProperty('--accent-gradient');
  }
}

let activeDate = new Date();
let todayDate = new Date();

function getActiveKeys() {
  const cdActive = customDateFromReal(activeDate);
  const key = `${activeDate.getFullYear()}-${cdActive.month.n}-${cdActive.dayInMonth}`;
  const wIndex = Math.floor((cdActive.dayInMonth - 1) / 5) + 1;
  const wKey = `${activeDate.getFullYear()}-m${cdActive.month.n}-w${wIndex}`;
  return { cd: cdActive, key, wIndex, wKey };
}

function realDateFromCustom(monthNum, dayNum) {
  let doy = 0;
  if (monthNum <= 13) {
    doy = (monthNum - 1) * 25 + dayNum;
  } else {
    doy = 325 + dayNum;
  }
  const yr = todayDate.getFullYear();
  const date = new Date(yr, 0, 1);
  date.setDate(doy);
  return date;
}

/* ============================================================
   STORAGE — persisted via window.storage (personal, per-user)
   ============================================================ */
const Store = {
  async get(key, fallback){
    try{
      if (window.storage) {
        const r = await window.storage.get(key, false);
        return r ? JSON.parse(r.value) : fallback;
      } else {
        const r = localStorage.getItem(key);
        return r ? JSON.parse(r) : fallback;
      }
    }catch(e){ return fallback; }
  },
  async set(key, value){
    try{ 
      if (window.storage) {
        await window.storage.set(key, JSON.stringify(value), false); 
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
    catch(e){ console.error("storage set failed", e); }
  }
};

let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 1400);
}

function normalizeChecklistItems(raw){
  if (Array.isArray(raw)) {
    if (raw.length && raw.every(item => typeof item === 'string')) {
      return raw.map((text, index) => ({ id: `item-${index + 1}`, text, done: false }));
    }
    return raw
      .filter(item => item && typeof item === 'object')
      .map((item, index) => ({
        id: item.id || `item-${index + 1}`,
        text: String(item.text || item.label || '').trim(),
        done: Boolean(item.done)
      }))
      .filter(item => item.text);
  }

  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([key, done], index) => ({
      id: `legacy-${index + 1}`,
      text: CHECKLIST_ITEMS[Number(key)] || `Item ${index + 1}`,
      done: Boolean(done)
    }));
  }

  return CHECKLIST_ITEMS.map((text, index) => ({ id: `item-${index + 1}`, text, done: false }));
}

function getDefaultChecklistItems(){
  return CHECKLIST_ITEMS.map((text, index) => ({ id: `default-${index + 1}`, text, done: false }));
}

function countChecklistDone(items){
  return items.filter(item => item.done).length;
}

function escapeHtml(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function formatReminderDate(value){
  if(!value) return 'No date';
  const dt = new Date(value);
  if(Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString(undefined, {dateStyle:'medium', timeStyle:'short'});
}

/* ============================================================
   NAV
   ============================================================ */
function renderNav(){
  const nav = document.getElementById('bottomnav');
  nav.innerHTML = NAV.map(n=>`
    <button class="navbtn" data-view="${n.id}">
      <span class="ic">${n.icon}</span><span>${n.label}</span>
    </button>`).join('');
  nav.querySelectorAll('.navbtn').forEach(btn=>{
    btn.addEventListener('click', ()=>switchView(btn.dataset.view));
  });
}
function switchView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+id).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.view===id));
  window.scrollTo({top:0,behavior:'instant'});
}

/* ============================================================
   TODAY VIEW
   ============================================================ */
function renderHero(){
  const { cd } = getActiveKeys();
  const type = dayTypeForDayInMonth(cd.dayInMonth);
  const monthAccent = cd.month.accent;
  
  setAccent(monthAccent);
  document.getElementById('heroDate').textContent = activeDate.toLocaleDateString(undefined,{weekday:'long', month:'long', day:'numeric'});
  document.getElementById('heroDayType').textContent = type.name;
  document.getElementById('heroDayFocus').textContent = type.focus;
  document.getElementById('heroBadge').textContent = type.icon;
  document.getElementById('heroMonth').textContent = `${cd.month.n}. ${cd.month.name}`;
  document.getElementById('heroDayNum').textContent = `${cd.dayInMonth} / ${cd.month.days}`;
  document.getElementById('heroDayOfYear').textContent = `${cd.dayOfYear} / 365`;

  const strip = document.getElementById('weekStrip');
  strip.innerHTML = DAYTYPES.map((dt,i)=>{
    const isToday = i === (cd.dayInMonth-1)%5;
    return `<div class="wd ${isToday?'today':''}" style="${isToday?`background:${monthAccent}; color:#0a0a0f;` : ''}">${dt.short}</div>`;
  }).join('');
}

async function getChecklistData(key){
  const mode = await Store.get('checklistMode:'+key, 'automatic');
  const manualItems = normalizeChecklistItems(await Store.get('checklist-manual:'+key, []));
  const autoItems = normalizeChecklistItems(await Store.get('checklist-auto:'+key, getDefaultChecklistItems()));
  return {
    mode,
    items: mode === 'manual' ? manualItems : autoItems,
    manualItems,
    autoItems
  };
}

async function saveChecklistData(key, mode, items){
  if (mode === 'manual') {
    await Store.set('checklist-manual:'+key, items);
  } else {
    await Store.set('checklist-auto:'+key, items);
  }
}

async function renderChecklist(){
  const { key } = getActiveKeys();
  const { mode, items: initialItems } = await getChecklistData(key);
  let items = initialItems;
  const ul = document.getElementById('checklist');
  const composer = document.getElementById('checklistComposer');
  const modeButtons = document.querySelectorAll('.mode-btn');

  modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  composer?.classList.toggle('hidden', mode !== 'manual');

  // Guard: only bind mode-btn listeners once per session
  modeButtons.forEach(btn => {
    if (btn.dataset.modeBound === 'true') return;
    btn.dataset.modeBound = 'true';
    btn.addEventListener('click', async () => {
      const nextMode = btn.dataset.mode;
      const { key: currentKey } = getActiveKeys();
      await Store.set('checklistMode:'+currentKey, nextMode);
      await renderChecklist();
      toast(nextMode === 'manual' ? 'Manual mode enabled' : 'Automatic mode enabled');
    });
  });

  ul.innerHTML = items.map(item=>`
    <li data-id="${item.id}" tabindex="0" class="${item.done?'done':''}">
      <div class="checkbox">${item.done?'✓':''}</div>
      <div class="cl-label">${escapeHtml(item.text)}</div>
      ${mode === 'manual' ? `
      <div class="checklist-actions">
        <button class="checklist-action" data-action="edit" aria-label="Edit checklist item">✎</button>
        <button class="checklist-action" data-action="delete" aria-label="Delete checklist item">×</button>
      </div>` : ''}
    </li>`).join('');

  function updateProgress(){
    const done = countChecklistDone(items);
    const pct = items.length ? Math.round(done / items.length * 100) : 0;
    document.getElementById('clProgress').style.width = pct+'%';
  }
  updateProgress();

  ul.querySelectorAll('li').forEach(li=>{
    const itemId = li.dataset.id;
    const toggle = async ()=>{
      items = items.map(item => item.id === itemId ? { ...item, done: !item.done } : item);
      await saveChecklistData(key, mode, items);
      const isDone = items.find(item => item.id === itemId).done;
      li.classList.toggle('done', isDone);
      li.querySelector('.checkbox').textContent = isDone ? '✓' : '';
      updateProgress();
      await updateStreak();
      renderSmartInsights();
      await renderTrend();
    };

    li.addEventListener('click', async (e)=>{
      if (mode !== 'manual') {
        await toggle();
        return;
      }
      const actionBtn = e.target.closest('.checklist-action');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'delete') {
          const updated = items.filter(item => item.id !== itemId);
          await saveChecklistData(key, mode, updated);
          await renderChecklist();
          await updateStreak();
          renderSmartInsights();
          toast('Item removed');
          return;
        }
        if (action === 'edit') {
          // Inline edit — no prompt()
          if (li.classList.contains('editing')) return;
          const current = items.find(item => item.id === itemId);
          li.classList.add('editing');

          const labelEl = li.querySelector('.cl-label');
          const editInput = document.createElement('input');
          editInput.type = 'text';
          editInput.value = current?.text || '';
          editInput.className = 'inline-edit-input';
          labelEl.replaceWith(editInput);
          editInput.focus();
          editInput.select();

          const actionsEl = li.querySelector('.checklist-actions');
          actionsEl.innerHTML = `
            <button class="checklist-action crud-save" title="Save (Enter)">✓</button>
            <button class="checklist-action crud-cancel" title="Cancel (Esc)">✕</button>
          `;

          const doSave = async () => {
            const text = editInput.value.trim();
            let updated;
            if (!text) {
              updated = items.filter(item => item.id !== itemId);
              toast('Item removed');
            } else {
              updated = items.map(item => item.id === itemId ? { ...item, text } : item);
              toast('Saved ✓');
            }
            await saveChecklistData(key, mode, updated);
            await updateStreak();
            await renderSmartInsights();
            await renderChecklist();
          };

          actionsEl.querySelector('.crud-save').addEventListener('click', (e) => { e.stopPropagation(); doSave(); });
          actionsEl.querySelector('.crud-cancel').addEventListener('click', (e) => { e.stopPropagation(); renderChecklist(); });
          editInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); doSave(); }
            if (e.key === 'Escape') { e.preventDefault(); renderChecklist(); }
          });
          editInput.addEventListener('click', e => e.stopPropagation());
          return;
        }
      }
      await toggle();
    });
    li.addEventListener('keydown', async e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); await toggle(); } });
  });

  const input = document.getElementById('newChecklistInput');
  const addBtn = document.getElementById('addChecklistBtn');
  if (input && addBtn && input.dataset.bound !== 'true') {
    const addItem = async ()=>{
      const text = input.value.trim();
      if (!text) return;
      const updated = [...items, { id: `item-${Date.now()}`, text, done: false }];
      await saveChecklistData(key, 'manual', updated);
      input.value = '';
      await renderChecklist();
      await updateStreak();
      renderSmartInsights();
      toast('Item added');
    };
    input.dataset.bound = 'true';
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addItem(); } });
  }

  // (mode-btn listeners bound above, not here)

  await renderTrend();
}

async function updateStreak(){
  // Build all keys first, then batch-read in parallel (fast)
  let streak = 0;
  const cursors = [];
  const c0 = new Date(todayDate);
  for(let i=0;i<365;i++){
    const d = new Date(c0);
    d.setDate(c0.getDate() - i);
    cursors.push(d);
  }
  // Read all at once in parallel batches of 10 to avoid hammering storage
  for(let i=0;i<cursors.length;i++){
    const cursor = cursors[i];
    const c = customDateFromReal(cursor);
    const key = `${cursor.getFullYear()}-${c.month.n}-${c.dayInMonth}`;
    const { mode, items } = await getChecklistData(key);
    const done = countChecklistDone(items);
    const target = Math.max(1, Math.ceil(items.length / 2));
    if(done >= target){ streak++; }
    else break;
  }
  document.getElementById('streakCount').textContent = streak;
}

async function renderTrend(){
  const trendGrid = document.getElementById('trendGrid');
  if(!trendGrid) return;

  // Build all keys and fetch in parallel for speed
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - (6 - i));
    return d;
  });

  const results = await Promise.all(days.map(async (d) => {
    const c = customDateFromReal(d);
    const key = `${d.getFullYear()}-${c.month.n}-${c.dayInMonth}`;
    const { items } = await getChecklistData(key);
    const done = countChecklistDone(items);
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    const letter = d.toLocaleDateString(undefined, { weekday: 'short' })[0];
    return { done, items, pct, letter };
  }));

  trendGrid.innerHTML = results.map(({ done, items, pct, letter }, i) => {
    const isToday = i === 6;
    return `
      <div class="trend-col ${isToday ? 'active' : ''}">
        <div class="trend-track" title="${done}/${items.length} completed">
          <div class="trend-fill" style="height: ${pct}%;"></div>
        </div>
        <div class="trend-label">${letter}</div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   CALENDAR VIEW
   ============================================================ */
let activeCalMonth = customDateFromReal(activeDate).month.n;

function renderMonthScroll(){
  const wrap = document.getElementById('monthScroll');
  wrap.innerHTML = MONTHS.map(m=>`
    <button class="month-pill ${m.n===activeCalMonth?'active':''}" data-m="${m.n}">
      <span class="num">${String(m.n).padStart(2,'0')}</span> ${m.name}
    </button>`).join('');
  wrap.querySelectorAll('.month-pill').forEach(p=>{
    p.addEventListener('click', ()=>{ activeCalMonth = parseInt(p.dataset.m); renderMonthScroll(); renderMonthDetail(); });
  });
}

function renderMonthDetail(){
  const m = MONTHS.find(x=>x.n===activeCalMonth);
  setAccent(m.accent);
  document.getElementById('calMonthIcon').textContent = m.icon;
  document.getElementById('calMonthIcon').style.setProperty('--accent', m.accent);
  document.getElementById('calMonthTitle').textContent = `${m.n}. ${m.name}`;
  document.getElementById('calMonthTag').textContent = m.tag + (m.n===14 ? ' · 40 days' : ' · 25 days');

  document.getElementById('calWeekdayLabels').innerHTML = DAYTYPES.map(dt=>`<span>${dt.short}</span>`).join('');

  const cdToday = customDateFromReal(todayDate);
  const cdActive = customDateFromReal(activeDate);
  const monthAccent = m.accent;

  const cells = [];
  for(let d=1; d<=m.days; d++){
    const isRealToday = (m.n === cdToday.month.n) && (d === cdToday.dayInMonth);
    const isSelected = (m.n === cdActive.month.n) && (d === cdActive.dayInMonth);
    const dt = dayTypeForDayInMonth(d);
    
    let style = `color:${monthAccent}; cursor:pointer;`;
    let classes = 'daycell';
    
    if (isRealToday) {
      classes += ' today';
      style = `background:${monthAccent}; color:#0a0a0f; cursor:pointer;`;
    } else if (isSelected) {
      classes += ' selected';
      style = `border: 2px solid ${monthAccent}; color:${monthAccent}; cursor:pointer; font-weight:800; transform:scale(1.05);`;
    }
    
    cells.push(`<div class="${classes}" style="${style}" data-day="${d}" title="${dt.name}">${d}</div>`);
  }
  
  const grid = document.getElementById('calDayGrid');
  grid.innerHTML = cells.join('');

  grid.querySelectorAll('.daycell').forEach(cell => {
    cell.addEventListener('click', async () => {
      const d = parseInt(cell.dataset.day);
      const targetDate = realDateFromCustom(m.n, d);
      activeDate = targetDate;
      
      renderMonthDetail();
      renderHero();
      await renderChecklist();
      await renderHabits();
      await renderWheel();
      await renderReview();
      await renderGoals();
      await renderSmartInsights();
      
      switchView('today');
      toast(`Selected Month ${m.n}, Day ${d}`);
    });
  });

  document.getElementById('calLegend').innerHTML = DAYTYPES.map(dt=>
    `<div class="lg"><span class="dot" style="background:${dt.accent}"></span>${dt.name}</div>`).join('');
}

/* ============================================================
   TASKS / TO-DO LIST
   ============================================================ */
async function renderTasks() {
  const ul = document.getElementById('taskList');
  const input = document.getElementById('newTaskInput');
  const addBtn = document.getElementById('addTaskBtn');
  
  if (!ul) return;
  
  let tasks = await Store.get('master-tasks', []);
  
  const draw = () => {
    ul.innerHTML = tasks.map(item => `
      <li data-id="${item.id}" tabindex="0" class="${item.done?'done':''}">
        <div class="checkbox">${item.done?'✓':''}</div>
        <div class="cl-label">${escapeHtml(item.text)}</div>
        <div class="checklist-actions">
          <button class="checklist-action" data-action="edit" aria-label="Edit task">✎</button>
          <button class="checklist-action" data-action="delete" aria-label="Delete task">×</button>
        </div>
      </li>
    `).join('') || '<div class="empty-note">All caught up! No tasks here.</div>';
    
    ul.querySelectorAll('li').forEach(li => {
      const itemId = li.dataset.id;
      const toggle = async () => {
        tasks = tasks.map(t => t.id === itemId ? {...t, done: !t.done} : t);
        await Store.set('master-tasks', tasks);
        draw();
      };
      
      li.addEventListener('click', async (e) => {
        const actionBtn = e.target.closest('.checklist-action');
        if (actionBtn) {
          const action = actionBtn.dataset.action;
          if (action === 'delete') {
            tasks = tasks.filter(t => t.id !== itemId);
            await Store.set('master-tasks', tasks);
            draw();
            toast('Task removed');
            return;
          }
          if (action === 'edit') {
            // Inline edit — no prompt()
            if (li.classList.contains('editing')) return;
            const current = tasks.find(t => t.id === itemId);
            li.classList.add('editing');

            const labelEl = li.querySelector('.cl-label');
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = current?.text || '';
            editInput.className = 'inline-edit-input';
            labelEl.replaceWith(editInput);
            editInput.focus();
            editInput.select();

            const actionsEl = li.querySelector('.checklist-actions');
            actionsEl.innerHTML = `
              <button class="checklist-action crud-save" title="Save (Enter)">✓</button>
              <button class="checklist-action crud-cancel" title="Cancel (Esc)">✕</button>
            `;

            const doSave = async () => {
              const text = editInput.value.trim();
              if (!text) {
                tasks = tasks.filter(t => t.id !== itemId);
                toast('Task removed');
              } else {
                tasks = tasks.map(t => t.id === itemId ? { ...t, text } : t);
                toast('Saved ✓');
              }
              await Store.set('master-tasks', tasks);
              draw();
            };

            actionsEl.querySelector('.crud-save').addEventListener('click', (e) => { e.stopPropagation(); doSave(); });
            actionsEl.querySelector('.crud-cancel').addEventListener('click', (e) => { e.stopPropagation(); draw(); });
            editInput.addEventListener('keydown', e => {
              if (e.key === 'Enter') { e.preventDefault(); doSave(); }
              if (e.key === 'Escape') { e.preventDefault(); draw(); }
            });
            editInput.addEventListener('click', e => e.stopPropagation());
            return;
          }
        }
        await toggle();
      });
      li.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
    });
  };
  
  draw();
  
  if (addBtn && addBtn.dataset.bound !== 'true') {
    const addTask = async () => {
      const text = input.value.trim();
      if (!text) return;
      tasks.push({ id: `task-${Date.now()}`, text, done: false });
      await Store.set('master-tasks', tasks);
      input.value = '';
      draw();
      toast('Task added');
    };
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', addTask);
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); addTask(); } });
  }
}

/* ============================================================
   HABITS + BALANCE WHEEL
   ============================================================ */
const WEEK_DAY_LABELS = DAYTYPES.map(d=>d.short[0]);

async function renderHabits(){
  const { wKey } = getActiveKeys();
  let habits = await Store.get('habits:'+wKey, null);
  if(!habits){
    habits = {"Workout":[false,false,false,false,false], "Reading":[false,false,false,false,false]};
  }

  document.getElementById('habitHead').innerHTML =
    '<span></span>' + WEEK_DAY_LABELS.map(l=>`<span>${l}</span>`).join('');

  function draw(){
    const rows = document.getElementById('habitRows');
    rows.innerHTML = Object.entries(habits).map(([name, arr])=>`
      <div class="habit-row" data-name="${name}">
        <div class="habit-name">${name}<button data-del="${name}" title="Remove habit" aria-label="Remove ${name}">✕</button></div>
        ${arr.map((v,i)=>`<div class="habit-dot ${v?'on':''}" data-i="${i}">${v?'✓':''}</div>`).join('')}
      </div>`).join('') || `<div class="empty-note">No habits yet — add your first one below.</div>`;

    rows.querySelectorAll('.habit-dot').forEach(dot=>{
      dot.addEventListener('click', async ()=>{
        const name = dot.closest('.habit-row').dataset.name;
        const i = parseInt(dot.dataset.i);
        habits[name][i] = !habits[name][i];
        await Store.set('habits:'+wKey, habits);
        draw();
        renderSmartInsights();
      });
    });
    rows.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        delete habits[btn.dataset.del];
        await Store.set('habits:'+wKey, habits);
        draw();
        renderSmartInsights();
      });
    });
  }
  draw();

  document.getElementById('addHabitBtn').onclick = async ()=>{
    const input = document.getElementById('newHabitInput');
    const name = input.value.trim();
    if(!name) return;
    if(habits[name]) { toast('Already tracking that'); return; }
    habits[name] = [false,false,false,false,false];
    input.value = '';
    await Store.set('habits:'+wKey, habits);
    draw();
    toast('Habit added');
    renderSmartInsights();
  };
}

function polarPoint(cx,cy,r,angle){
  return [cx + r*Math.cos(angle), cy + r*Math.sin(angle)];
}

async function renderWheel(){
  let vals = await Store.get('balance', {});
  WHEEL_AXES.forEach(a=>{ if(vals[a]===undefined) vals[a]=5; });

  const cx=130, cy=130, maxR=95, n=WHEEL_AXES.length;
  const svg = document.getElementById('wheelSvg');

  function draw(){
    let rings = '';
    for(let ring=1; ring<=4; ring++){
      const r = maxR*ring/4;
      let pts = [];
      for(let i=0;i<n;i++){
        const ang = -Math.PI/2 + i*2*Math.PI/n;
        pts.push(polarPoint(cx,cy,r,ang).join(','));
      }
      rings += `<polygon points="${pts.join(' ')}" fill="none" stroke="#2a2a3a" stroke-width="1"/>`;
    }
    let spokes = '';
    let labels = '';
    let dataPts = [];
    for(let i=0;i<n;i++){
      const ang = -Math.PI/2 + i*2*Math.PI/n;
      const [ex,ey] = polarPoint(cx,cy,maxR,ang);
      spokes += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#2a2a3a" stroke-width="1"/>`;
      const [lx,ly] = polarPoint(cx,cy,maxR+18,ang);
      labels += `<text x="${lx}" y="${ly}" fill="#9494a8" font-size="10" font-family="Inter" text-anchor="middle" dominant-baseline="middle">${WHEEL_AXES[i]}</text>`;
      const val = vals[WHEEL_AXES[i]];
      const [dx,dy] = polarPoint(cx,cy, maxR*val/10, ang);
      dataPts.push(`${dx},${dy}`);
    }
    const dataPoly = `<polygon points="${dataPts.join(' ')}" fill="rgba(255,61,154,.28)" stroke="#ff3d9a" stroke-width="2"/>`;

    svg.innerHTML = rings + spokes + dataPoly + labels;
  }
  draw();

  const sliderWrap = document.getElementById('wheelSliders');
  sliderWrap.innerHTML = WHEEL_AXES.map(a=>`
    <div class="slider-row">
      <div class="sr-top"><span>${a}</span><span class="mono" id="wv-${a}">${vals[a]}</span></div>
      <input type="range" min="0" max="10" step="1" value="${vals[a]}" data-axis="${a}">
    </div>`).join('');

  sliderWrap.querySelectorAll('input[type=range]').forEach(inp=>{
    inp.addEventListener('input', async ()=>{
      const a = inp.dataset.axis;
      vals[a] = parseInt(inp.value);
      document.getElementById('wv-'+a).textContent = vals[a];
      draw();
      await Store.set('balance', vals);
      renderSmartInsights();
    });
  });
}

/* ============================================================
   WEEKLY REVIEW
   ============================================================ */
async function renderReview(){
  const { cd, wIndex, wKey } = getActiveKeys();
  document.getElementById('reviewWeekLabel').textContent = `${cd.month.name} · Week ${wIndex}`;
  const data = await Store.get('review:'+wKey, {well:'', improve:'', grateful:'', rating:0});

  document.getElementById('revWell').value = data.well || '';
  document.getElementById('revImprove').value = data.improve || '';
  document.getElementById('revGrateful').value = data.grateful || '';

  const starsWrap = document.getElementById('revStars');
  function drawStars(){
    starsWrap.innerHTML = Array.from({length:10}).map((_,i)=>
      `<button class="${i<data.rating?'on':''}" data-v="${i+1}" aria-label="${i+1} stars">★</button>`).join('');
    starsWrap.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', async ()=>{
        data.rating = parseInt(b.dataset.v);
        drawStars();
        await Store.set('review:'+wKey, data);
        await renderSmartInsights();
      });
    });
  }
  drawStars();

  // Remove any previous listeners before adding new ones (prevents accumulation)
  ['revWell','revImprove','revGrateful'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });

  let saveTimer;
  function debSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async ()=>{
      data.well = document.getElementById('revWell').value;
      data.improve = document.getElementById('revImprove').value;
      data.grateful = document.getElementById('revGrateful').value;
      await Store.set('review:'+wKey, data);
      toast('Saved');
      await renderSmartInsights();
    }, 500);
  }
  ['revWell','revImprove','revGrateful'].forEach(id=>{
    document.getElementById(id).addEventListener('input', debSave);
  });
}

/* ============================================================
   GOALS + NOTES + REMINDERS
   ============================================================ */
async function renderReminders(){
  const list = document.getElementById('reminderList');
  if(!list) return;

  const reminders = await Store.get('reminders', []);
  const sorted = [...reminders].sort((a,b)=> (a.when || '').localeCompare(b.when || ''));

  if(!sorted.length){
    list.innerHTML = '<div class="reminder-empty">No reminders yet. Add one and keep your plans visible.</div>';
    return;
  }

  list.innerHTML = sorted.map(item=>`
    <div class="reminder-item ${item.done ? 'done' : ''}">
      <div class="reminder-top">
        <div class="reminder-title">${escapeHtml(item.what)}</div>
        <div class="reminder-actions">
          <button class="reminder-action-btn" data-action="edit" data-id="${item.id}" title="Edit reminder">✎</button>
          <button class="reminder-action-btn" data-action="delete" data-id="${item.id}" title="Delete reminder">🗑</button>
          <button class="reminder-done-btn" data-action="toggle" data-id="${item.id}" aria-label="Toggle reminder">${item.done ? '↺' : '✓'}</button>
        </div>
      </div>
      <div class="reminder-meta">
        <span>🗓 ${escapeHtml(formatReminderDate(item.when))}</span>
        ${item.where ? `<span>📍 ${escapeHtml(item.where)}</span>` : ''}
      </div>
      ${item.notes ? `<div class="reminder-notes">${escapeHtml(item.notes)}</div>` : ''}
    </div>
  `).join('');

  list.querySelectorAll('.reminder-action-btn, .reminder-done-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const remindersData = await Store.get('reminders', []);
      if(action === 'delete'){
        const updated = remindersData.filter(item => item.id !== id);
        await Store.set('reminders', updated);
        await renderReminders();
        renderSmartInsights();
        toast('Reminder deleted');
        return;
      }
      if(action === 'edit'){
        const item = remindersData.find(x => x.id === id);
        if(!item) return;
        document.getElementById('reminderWhat').value = item.what || '';
        document.getElementById('reminderWhen').value = item.when || '';
        document.getElementById('reminderWhere').value = item.where || '';
        document.getElementById('reminderNotes').value = item.notes || '';
        document.getElementById('addReminderBtn').dataset.editId = id;
        document.getElementById('addReminderBtn').textContent = 'Save changes';
        document.getElementById('cancelReminderEditBtn').style.display = 'inline-block';
        document.getElementById('reminderWhat').focus();
        return;
      }
      const updated = remindersData.map(item => item.id === id ? {...item, done: !item.done} : item);
      await Store.set('reminders', updated);
      await renderReminders();
      renderSmartInsights();
      toast('Reminder updated');
    });
  });
}

function setupReminderForm(){
  const addBtn = document.getElementById('addReminderBtn');
  const cancelBtn = document.getElementById('cancelReminderEditBtn');
  if(!addBtn || addBtn.dataset.bound === 'true') return;
  addBtn.dataset.bound = 'true';

  const resetForm = ()=>{
    const reminderWhat = document.getElementById('reminderWhat');
    const reminderWhen = document.getElementById('reminderWhen');
    const reminderWhere = document.getElementById('reminderWhere');
    const reminderNotes = document.getElementById('reminderNotes');
    if (reminderWhat) reminderWhat.value = '';
    if (reminderWhen) reminderWhen.value = '';
    if (reminderWhere) reminderWhere.value = '';
    if (reminderNotes) reminderNotes.value = '';
    addBtn.dataset.editId = '';
    addBtn.textContent = 'Add to list';
    if (cancelBtn) cancelBtn.style.display = 'none';
  };

  if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

  addBtn.addEventListener('click', async ()=>{
    const reminderWhat = document.getElementById('reminderWhat');
    const reminderWhen = document.getElementById('reminderWhen');
    const reminderWhere = document.getElementById('reminderWhere');
    const reminderNotes = document.getElementById('reminderNotes');
    const what = reminderWhat ? reminderWhat.value.trim() : '';
    const when = reminderWhen ? reminderWhen.value : '';
    const where = reminderWhere ? reminderWhere.value.trim() : '';
    const notes = reminderNotes ? reminderNotes.value.trim() : '';

    if(!what){
      toast('Add a task name first');
      return;
    }

    const reminders = await Store.get('reminders', []);
    const editId = addBtn.dataset.editId;

    if(editId){
      const updated = reminders.map(item => item.id === editId ? { ...item, what, when, where, notes } : item);
      await Store.set('reminders', updated);
      toast('Reminder updated');
    } else {
      reminders.push({
        id: `rem-${Date.now()}`,
        what,
        when,
        where,
        notes,
        done: false
      });
      await Store.set('reminders', reminders);
      toast('Added to your list');
    }

    resetForm();
    await renderReminders();
    renderSmartInsights();
  });
}

async function renderGoals(){
  const { cd } = getActiveKeys();
  const m = cd.month;
  document.getElementById('goalsMonthName').textContent = `${m.n}. ${m.name}`;
  const [goals, notes] = await Promise.all([
    Store.get('goals:'+m.n, ['','','','','']),
    Store.get('notes:'+m.n, '')
  ]);

  document.getElementById('goalRows').innerHTML = goals.map((g,i)=>`
    <div class="goal-row">
      <div class="goal-num">${i+1}</div>
      <input type="text" data-i="${i}" value="${g.replace(/"/g,'&quot;')}" placeholder="A goal for ${m.name}…">
    </div>`).join('');

  // Clone notesArea to remove stale listeners, then re-assign
  const oldNotes = document.getElementById('notesArea');
  const newNotes = oldNotes.cloneNode(true);
  newNotes.value = notes;
  oldNotes.parentNode.replaceChild(newNotes, oldNotes);

  let gTimer;
  document.querySelectorAll('#goalRows input').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      goals[inp.dataset.i] = inp.value;
      clearTimeout(gTimer);
      gTimer = setTimeout(async ()=>{ 
        await Store.set('goals:'+m.n, goals); 
        toast('Saved'); 
        await renderSmartInsights();
      }, 500);
    });
  });

  let nTimer;
  document.getElementById('notesArea').addEventListener('input', (e)=>{
    clearTimeout(nTimer);
    nTimer = setTimeout(async ()=>{ 
      await Store.set('notes:'+m.n, e.target.value); 
      toast('Saved'); 
      await renderSmartInsights();
    }, 500);
  });

  await renderReminders();
}

/* ============================================================
   INIT
   ============================================================ */
// Command Console keydown event listener
function setupCommandConsole() {
  const cmdInput = document.getElementById("smart-command-input");
  if (cmdInput) {
    cmdInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = e.target.value.trim();
        if (cmd) {
          executeSmartCommand(cmd);
          e.target.value = "";
        }
      }
    });
  }
}

// Command Console Execution Parser
async function executeSmartCommand(cmdString) {
  const clean = cmdString.toLowerCase().trim();
  
  if (clean.startsWith("/help")) {
    showCommandFeedback(
      `Commands List:\n` +
      `/month [1-14] - Switch calendar view month\n` +
      `/day [1-40] - Go to day in active month (e.g. /day 12)\n` +
      `/check [index/name] - Check today's checklist item\n` +
      `/uncheck [index/name] - Uncheck item\n` +
      `/goal [1-5] [text...] - Set goal (e.g. /goal 1 read book)\n` +
      `/note [text...] - Append to note text\n` +
      `/today - Jump back to current real-world date`, 
      "help"
    );
    return;
  }
  
  if (clean === "/today") {
    activeDate = new Date(todayDate);
    const { cd } = getActiveKeys();
    activeCalMonth = cd.month.n;
    renderMonthScroll();
    renderMonthDetail();
    renderHero();
    await renderChecklist();
    await renderHabits();
    await renderWheel();
    await renderReview();
    await renderGoals();
    await renderSmartInsights();
    switchView('today');
    showCommandFeedback("Jumped back to today!", "success");
    return;
  }
  
  if (clean.startsWith("/month ")) {
    const val = parseInt(clean.substring(7));
    if (val >= 1 && val <= 14) {
      activeCalMonth = val;
      renderMonthScroll();
      renderMonthDetail();
      switchView('calendar');
      showCommandFeedback(`Navigated calendar view to Month ${val}`, "success");
    } else {
      showCommandFeedback("Error: Month must be between 1 and 14", "error");
    }
    return;
  }

  if (clean.startsWith("/day ")) {
    const val = parseInt(clean.substring(5));
    const m = MONTHS.find(x=>x.n===activeCalMonth);
    if (val >= 1 && val <= m.days) {
      activeDate = realDateFromCustom(m.n, val);
      renderMonthDetail();
      renderHero();
      await renderChecklist();
      await renderHabits();
      await renderWheel();
      await renderReview();
      await renderGoals();
      await renderSmartInsights();
      switchView('today');
      showCommandFeedback(`Navigated to Month ${m.n}, Day ${val}`, "success");
    } else {
      showCommandFeedback(`Error: Day must be between 1 and ${m.days} for Month ${m.n}`, "error");
    }
    return;
  }

  if (clean.startsWith("/check ")) {
    const query = clean.substring(7).trim();
    const { key } = getActiveKeys();
    const { mode, items } = await getChecklistData(key);
    let foundIndex = -1;
    
    const num = parseInt(query);
    if (!isNaN(num) && num >= 1 && num <= items.length) {
      foundIndex = num - 1;
    } else {
      foundIndex = items.findIndex(item => item.text.toLowerCase().includes(query));
    }

    if (foundIndex !== -1) {
      items[foundIndex].done = true;
      await saveChecklistData(key, mode, items);
      await renderChecklist();
      await updateStreak();
      renderSmartInsights();
      showCommandFeedback(`Checked "${items[foundIndex].text}"`, "success");
    } else {
      showCommandFeedback(`Error: Could not find checklist item matching "${query}"`, "error");
    }
    return;
  }

  if (clean.startsWith("/uncheck ")) {
    const query = clean.substring(9).trim();
    const { key } = getActiveKeys();
    const { mode, items } = await getChecklistData(key);
    let foundIndex = -1;
    
    const num = parseInt(query);
    if (!isNaN(num) && num >= 1 && num <= items.length) {
      foundIndex = num - 1;
    } else {
      foundIndex = items.findIndex(item => item.text.toLowerCase().includes(query));
    }

    if (foundIndex !== -1) {
      items[foundIndex].done = false;
      await saveChecklistData(key, mode, items);
      await renderChecklist();
      await updateStreak();
      renderSmartInsights();
      showCommandFeedback(`Unchecked "${items[foundIndex].text}"`, "success");
    } else {
      showCommandFeedback(`Error: Could not find checklist item matching "${query}"`, "error");
    }
    return;
  }

  if (clean.startsWith("/goal ")) {
    const { cd } = getActiveKeys();
    const body = cmdString.substring(6).trim();
    const firstSpace = body.indexOf(" ");
    if (firstSpace === -1) {
      showCommandFeedback("Error: Goal format is /goal [1-5] [text...]", "error");
      return;
    }
    const numStr = body.substring(0, firstSpace);
    const goalText = body.substring(firstSpace + 1).trim();
    const num = parseInt(numStr);
    if (num >= 1 && num <= 5) {
      const goals = await Store.get('goals:'+cd.month.n, ['','','','','']);
      goals[num - 1] = goalText;
      await Store.set('goals:'+cd.month.n, goals);
      await renderGoals();
      renderSmartInsights();
      showCommandFeedback(`Set Goal ${num} to "${goalText}"`, "success");
    } else {
      showCommandFeedback("Error: Goal number must be between 1 and 5", "error");
    }
    return;
  }

  if (clean.startsWith("/note ")) {
    const { cd } = getActiveKeys();
    const noteText = cmdString.substring(6).trim();
    let notes = await Store.get('notes:'+cd.month.n, '');
    notes = notes ? (notes + "\n" + noteText) : noteText;
    await Store.set('notes:'+cd.month.n, notes);
    await renderGoals();
    renderSmartInsights();
    showCommandFeedback("Appended to Month Notes!", "success");
    return;
  }

  showCommandFeedback(`Unrecognized command: "${cmdString}". Type /help.`, "error");
}

let feedbackTimeout = null;
function showCommandFeedback(msg, type) {
  const box = document.getElementById("command-feedback");
  if (!box) return;
  
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  box.className = "command-feedback";
  box.classList.add(type);
  box.textContent = msg;
  box.classList.remove("hidden");
  
  const duration = type === "help" ? 10000 : 3000;
  feedbackTimeout = setTimeout(() => {
    box.classList.add("hidden");
  }, duration);
}

// Dynamic Rule-Based Smart Balance Insights Generator
async function renderSmartInsights() {
  const { cd, key, wKey } = getActiveKeys();
  const contentEl = document.getElementById("smart-insights-content");
  if (!contentEl) return;

  const { items: checklistItems } = await getChecklistData(key);
  let checklistCompleted = countChecklistDone(checklistItems);

  const habits = await Store.get('habits:'+wKey, {});
  let habitsCompleted = 0;
  Object.values(habits).forEach(arr => {
    arr.forEach(v => { if (v) habitsCompleted++; });
  });

  const balanceVals = await Store.get('balance', {});
  const reminders = await Store.get('reminders', []);
  const pendingReminders = reminders.filter(item => !item.done).length;
  
  const insights = [];

  if (checklistItems.length && checklistCompleted === checklistItems.length) {
    insights.push("🔥 perfection status: You checked off 100% of your list today. Absolute beast mode!");
  } else if (checklistCompleted >= Math.max(1, Math.ceil(checklistItems.length / 2))) {
    insights.push("⚡ momentum check: Solid habits today, you are tracking way above average!");
  }

  const sleepItem = checklistItems.find(item => item.text.toLowerCase().includes('sleep'));
  if (sleepItem && !sleepItem.done) {
    insights.push("💤 sleep alert: Sleep is unchecked. Aim for 8+ hours tonight for optimal mood and focus.");
  }

  if (pendingReminders > 0) {
    insights.push(`🗓 ${pendingReminders} reminder${pendingReminders === 1 ? '' : 's'} still waiting — your plan is looking sharp.`);
  }
  
  const learningItem = checklistItems.find(item => item.text.toLowerCase().includes('learn') || item.text.toLowerCase().includes('study'));
  if (learningItem && learningItem.done) {
    insights.push("🧠 skill boost: Excellent learning streak. Keep up the high intellectual stamina!");
  } else if (learningItem) {
    insights.push("🌱 growth tip: Keep your learning task on the list and complete it to boost your skills axis.");
  } else if (habitsCompleted <= 2) {
    insights.push("🌱 growth tip: Log some study sessions or check 'Learn Something New' to boost your skills axis.");
  }
  if (balanceVals["Mind"] && balanceVals["Mind"] < 4) {
    insights.push("🧘 meditation time: Mind rating is lagging. Consider taking a 10 min break without screens.");
  }

  if (insights.length === 0) {
    insights.push("💡 stats: Checking items, logging weekly habits, and scoring reviews feeds real-time balance advice!");
  }

  contentEl.innerHTML = insights.slice(0, 3).map(ins => `<div style='color:var(--text);font-size:13px;line-height:1.7;padding:3px 0;'>${ins}</div>`).join('');
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function initTheme(){
  const saved = localStorage.getItem('genz-theme') || 'light';
  applyTheme(saved);
  document.getElementById('themeToggle').addEventListener('click', ()=>{
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('genz-theme', next);
  });
}
function applyTheme(theme){
  if(theme === 'light'){
    document.documentElement.setAttribute('data-theme','light');
    document.getElementById('themeToggle').textContent = '☀️';
    document.querySelector('meta[name=theme-color]').content = '#f4f4f8';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeToggle').textContent = '🌙';
    document.querySelector('meta[name=theme-color]').content = '#06060b';
  }
}

/* ============================================================
   DATA EXPORT / IMPORT
   ============================================================ */
function initDataManagement(){
  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const allData = {};
    for(let i=0; i<localStorage.length; i++){
      const k = localStorage.key(i);
      allData[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genz-calendar-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📤 Data exported!');
  });

  document.getElementById('importBtn').addEventListener('click', ()=>{
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      Object.entries(data).forEach(([k,v])=>{
        localStorage.setItem(k, v);
      });
      toast('📥 Data imported! Refreshing…');
      setTimeout(()=> location.reload(), 1200);
    }catch(err){
      toast('❌ Invalid backup file');
    }
    e.target.value = '';
  });
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function notifyUser(title, body){
  if(!('Notification' in window) || Notification.permission !== 'granted') return false;
  new Notification(title, {
    body,
    icon: './icon.png',
    badge: './icon.png'
  });
  return true;
}

function showCheckinModal(){
  const modal = document.getElementById('checkinModal');
  if(!modal) return;
  modal.classList.remove('hidden');
}

function hideCheckinModal(){
  const modal = document.getElementById('checkinModal');
  if(!modal) return;
  modal.classList.add('hidden');
}

function initNotifications(){
  const toggle = document.getElementById('notifToggle');
  const status = document.getElementById('notifStatus');
  const enabled = localStorage.getItem('genz-notif') === 'on';
  const modal = document.getElementById('checkinModal');
  const openBtn = document.getElementById('checkinOpenBtn');
  const laterBtn = document.getElementById('checkinLaterBtn');

  if(!toggle || !status) return;

  if(openBtn) openBtn.addEventListener('click', ()=>{
    hideCheckinModal();
    switchView('today');
    toast('Daily check-in opened');
  });

  if(laterBtn) laterBtn.addEventListener('click', ()=>{
    hideCheckinModal();
    toast('Reminder snoozed');
  });

  const permissionGranted = Notification && Notification.permission === 'granted';
  if(enabled){
    toggle.classList.add('on');
    toggle.setAttribute('aria-pressed', 'true');
    status.textContent = permissionGranted ? 'Reminders are active.' : 'Reminders are enabled (in-app reminder mode).';
  } else if (window.location.protocol === 'file:') {
    status.textContent = 'Tap to enable daily reminders. Browser notifications may be blocked on file pages.';
  } else {
    status.textContent = 'Tap to enable daily reminders.';
  }

  toggle.addEventListener('click', async ()=>{
    const setToggleState = (state) => {
      if(state){
        toggle.classList.add('on');
        toggle.setAttribute('aria-pressed', 'true');
      } else {
        toggle.classList.remove('on');
        toggle.setAttribute('aria-pressed', 'false');
      }
    };

    if(toggle.classList.contains('on')){
      setToggleState(false);
      localStorage.setItem('genz-notif','off');
      status.textContent = 'Reminders disabled.';
      return;
    }

    const enableInAppReminder = () => {
      setToggleState(true);
      localStorage.setItem('genz-notif','on');
      status.textContent = 'Daily reminder enabled. You can open the checklist when prompted.';
      showCheckinModal();
      scheduleNotificationCheck();
    };

    if(!('Notification' in window)){
      enableInAppReminder();
      return;
    }

    let perm;
    try {
      perm = await Notification.requestPermission();
    } catch (err) {
      perm = 'default';
    }

    if(perm === 'granted'){
      setToggleState(true);
      localStorage.setItem('genz-notif','on');
      status.textContent = 'Reminders are active! You\'ll get a daily check-in nudge.';
      notifyUser('Gen Z Calendar ⚡', 'Daily reminders are now on. You will get a gentle check-in soon.');
      showCheckinModal();
      scheduleNotificationCheck();
    } else {
      enableInAppReminder();
    }
  });

  if(enabled) {
    scheduleNotificationCheck();
  }
}

function scheduleNotificationCheck(){
  const check = ()=>{
    if(localStorage.getItem('genz-notif') !== 'on') return;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const todayKey = `notif-sent-${now.toISOString().slice(0,10)}`;

    if(!localStorage.getItem(todayKey) && h >= 8 && h <= 10){
      localStorage.setItem(todayKey, '1');
      notifyUser('Gen Z Calendar ⚡', 'Time to check in! Review your day and keep the streak going 🔥');
      showCheckinModal();
    }
  };

  check();
  setInterval(check, 60000 * 5);
}

(async function init(){
  initTheme();
  renderNav();
  switchView('today');
  renderHero();
  await renderChecklist();
  await updateStreak();
  renderMonthScroll();
  renderMonthDetail();
  await renderHabits();
  await renderWheel();
  await renderReview();
  setupReminderForm();
  await renderReminders();
  await renderGoals();
  await renderTasks();
  setupCommandConsole();
  await renderSmartInsights();
  initDataManagement();
  initNotifications();

  // Haptic feedback on checklist toggle
  document.getElementById('checklist').addEventListener('click', ()=>{
    if(navigator.vibrate) navigator.vibrate(15);
  });

  // Register PWA service worker — only works on http/https, not file://
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }
})();
