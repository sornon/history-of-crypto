/* UTF-8 */
const VERSION_DATE = "2025-08-23";

async function loadChapters() {
  const res = await fetch('chapters.json');
  const data = await res.json();
  return data;
}

function groupByPart(items) {
  const map = new Map();
  for (const item of items) {
    const arr = map.get(item.part) || [];
    arr.push(item);
    map.set(item.part, arr);
  }
  return map;
}

function renderList(groups) {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  for (const [part, items] of groups.entries()) {
    const h = document.createElement('div');
    h.className = 'section-title-shell';
    h.textContent = part;
    listEl.appendChild(h);
    for (const it of items) {
      const li = document.createElement('div');
      li.className = 'chapter-item-shell';
      li.innerHTML = `<a href="#read?file=${encodeURIComponent(it.file)}&title=${encodeURIComponent(it.title)}">${it.title.replace(/^第一编_/,'')}</a><small>· 版本 ${VERSION_DATE}</small>`;
      listEl.appendChild(li);
    }
  }
}

function attachSearch(all) {
  const input = document.getElementById('q');
  input.addEventListener('input', () => {
    const q = input.value.trim();
    const groups = groupByPart(all.filter(x => (x.title+x.part).includes(q)));
    renderList(groups);
  });
}

async function mountIndex() {
  const all = await loadChapters();
  const groups = groupByPart(all);
  renderList(groups);
  attachSearch(all);
}

async function mountReader(params) {
  const file = params.get('file');
  const title = decodeURIComponent(params.get('title')||'');
  const res = await fetch('chapters/'+file);
  const html = await res.text();
  document.getElementById('reader').innerHTML = html;
  document.getElementById('back').addEventListener('click', () => {
    history.pushState(null, '', '#');
    route();
  });
}

function route() {
  const hash = location.hash;
  if (!hash || hash === '#') {
    document.getElementById('index').style.display = 'block';
    document.getElementById('viewer').style.display = 'none';
    mountIndex();
  } else if (hash.startsWith('#read')) {
    document.getElementById('index').style.display = 'none';
    document.getElementById('viewer').style.display = 'block';
    const params = new URLSearchParams(hash.split('?')[1]);
    mountReader(params);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', async () => {
  route();
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch(e) { console.warn('sw fail', e); }
  }
});
