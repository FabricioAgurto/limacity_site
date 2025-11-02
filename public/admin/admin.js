// Simple editor for updates.json using GitHub API
const el = s => document.querySelector(s);
const list = el('#list');
let model = [];

function render(){
  list.innerHTML = '';
  const tpl = el('#tpl').content;
  model.forEach((item, idx) => {
    const node = document.importNode(tpl, true);
    node.querySelectorAll('[data-k]').forEach(inp => {
      const k = inp.getAttribute('data-k');
      inp.value = item[k] || '';
      inp.addEventListener('input', () => item[k] = inp.value);
    });
    node.querySelector('[data-act="del"]').onclick = () => { model.splice(idx,1); render(); };
    node.querySelector('[data-act="up"]').onclick = () => { if(idx>0){ [model[idx-1], model[idx]]=[model[idx], model[idx-1]]; render(); } };
    node.querySelector('[data-act="down"]').onclick = () => { if(idx<model.length-1){ [model[idx+1], model[idx]]=[model[idx], model[idx+1]]; render(); } };
    list.appendChild(node);
  });
}

el('#btnAdd').onclick = () => {
  model.unshift({date: new Date().toISOString().slice(0,10), author: 'Staff', title:'', summary:'', details:''});
  render();
};

el('#btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(model, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'updates.json';
  a.click();
};

async function loadFromGitHub(){
  const owner = el('#owner').value.trim();
  const repo = el('#repo').value.trim();
  const path = el('#path').value.trim();
  const branch = el('#branch').value.trim();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url);
  if(!res.ok){ el('#status').innerHTML = `<span class="err">No se pudo cargar (${res.status}). Revisa ruta/branch.</span>`; return; }
  const data = await res.json();
  const content = atob(data.content.replace(/\n/g,''));
  try{
    model = JSON.parse(content);
    render();
    sessionStorage.setItem('gh_sha', data.sha);
    el('#status').innerHTML = `<span class="ok">Cargado desde GitHub ✓ (${model.length} items)</span>`;
  }catch(e){
    el('#status').innerHTML = `<span class="err">JSON inválido.</span>`;
  }
}
el('#btnLoad').onclick = loadFromGitHub;
loadFromGitHub(); // intento inicial

async function saveToGitHub(){
  const token = el('#token').value.trim();
  if(!token){ el('#status').innerHTML = `<span class="err">Ingresa tu token de GitHub.</span>`; return; }
  const owner = el('#owner').value.trim();
  const repo = el('#repo').value.trim();
  const path = el('#path').value.trim();
  const branch = el('#branch').value.trim();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(model, null, 2))));
  const sha = sessionStorage.getItem('gh_sha') || undefined;
  const body = { message: "chore(admin): update updates.json via web panel", content, branch, sha };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if(res.status >= 200 && res.status < 300){
    sessionStorage.setItem('gh_sha', data.content.sha);
    el('#status').innerHTML = `<span class="ok">Guardado en GitHub ✓</span>`;
  }else{
    el('#status').innerHTML = `<span class="err">Error al guardar: ${res.status} ${data.message || ''}</span>`;
  }
}
el('#btnSave').onclick = saveToGitHub;
