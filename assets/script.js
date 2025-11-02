// Lima City RP simple JS for menu & updates
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const burger = document.getElementById('hamburger');
if (burger){
  burger.addEventListener('click', ()=> document.body.classList.toggle('menu-open'));
}

// Fetch novedades (short) and updates (timeline)
async function loadUpdates(){
  try{
    const res = await fetch('content/updates.json?cache=' + Date.now());
    const data = await res.json();
    const ul = document.getElementById('novedades-list');
    const tl = document.getElementById('updates');
    if (ul){
      ul.innerHTML = data.slice(0,4).map(it => `
        <li>
          <b>${it.title}</b>
          <div class="mini muted">${it.date} · ${it.author}</div>
          <div>${it.summary}</div>
        </li>`).join('');
    }
    if (tl){
      tl.innerHTML = data.map(it => `
        <div class="item">
          <div class="meta">${it.date} · ${it.author}</div>
          <h4>${it.title}</h4>
          <p>${it.details}</p>
        </div>`).join('');
    }
  }catch(e){
    console.warn('No se pudo cargar updates.json', e);
  }
}
loadUpdates();
