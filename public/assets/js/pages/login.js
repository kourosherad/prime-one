/**
 * Prime One — login page.
 */
import { api } from '../api.js';
import { store } from '../bootstrap.js';
import { url } from '../config.js';

const redirect = new URLSearchParams(location.search).get('redirect') || url('');

async function init() {
  // Already logged in?
  const u = await store.refreshUser();
  if (u) {
    location.href = redirect;
    return;
  }

  const form = document.getElementById('login-form');
  const msg = document.getElementById('form-msg');

  document.getElementById('toggle-pwd').addEventListener('click', () => {
    const p = document.getElementById('pwd');
    p.type = p.type === 'password' ? 'text' : 'password';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ورود...';
    try {
      await api.post('/api/auth/login', { email: data.email, password: data.password });
      store.toast('ورود موفق بود ✅', 'success');
      await store.refreshUser();
      location.href = redirect;
    } catch (err) {
      msg.innerHTML = `<span class="text-red-500"><i class="fa-solid fa-circle-xmark"></i> ${err.message}</span>`;
      btn.disabled = false;
      btn.innerHTML = 'ورود';
    }
  });
}

init();
