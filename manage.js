
(() => {
  'use strict';

  const $ = s => document.querySelector(s);

  const esc = x => String(x ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );

  let items = [];
  let user;

  const status = s => {
    $('#status').textContent = s;
  };

  // API requests with improved error handling
  async function api(path, options = {}) {
    let response;

    try {
      response = await fetch('/api/' + path, {
        credentials: 'same-origin',
        cache: 'no-store',
        ...options
      });
    } catch {
      throw new Error(
        `Unable to connect to /api/${path}. Check your internet connection.`
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error(
        `API /api/${path} returned HTTP ${response.status} instead of JSON`
      );
    }

    let data;

    try {
      data = JSON.parse(body);
    } catch {
      throw new Error(
        `API /api/${path} returned invalid JSON (HTTP ${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error || `Request failed (HTTP ${response.status})`
      );
    }

    return data;
  }

  const post = (path, data) => api(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // Product management
  async function reload() {
    items = await api('products');

    $('#products').innerHTML = items.map(x => `
      <article>
        <div>
          <strong>${esc(x.name)}</strong>
          <br>
          <small>
            ${esc(x.category)} ·
            ${x.price == null ? 'Ask for price' : 'QAR ' + esc(x.price)} ·
            ${x.qty == null ? 'Stock unspecified' : esc(x.qty) + ' units'}
          </small>
        </div>
        <div>
          <button data-edit="${esc(x.id)}">Edit</button>
          <button data-delete="${esc(x.id)}">Delete</button>
        </div>
      </article>
    `).join('') || 'No products yet';
  }

  $('#products').onclick = async e => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-delete]');

    if (edit) {
      const x = items.find(
        x => String(x.id) === edit.dataset.edit
      );

      if (!x) return;

      for (const [key, value] of Object.entries(x)) {
        const field = $('#form').elements.namedItem(key);

        if (field) {
          field.value = value ?? '';
        }
      }

      window.scrollTo(0, 0);
    }

    if (del && confirm('Delete this product from the live website?')) {
      try {
        await api(
          'products/' + encodeURIComponent(del.dataset.delete),
          { method: 'DELETE' }
        );

        await reload();
        status('Product removed');
      } catch (error) {
        status(error.message);
      }
    }
  };

  $('#clear').onclick = () => {
    $('#form').reset();
  };

  $('#form').onsubmit = async e => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);

      const obj = Object.fromEntries(
        [...formData.entries()].filter(([key]) => key !== 'photo')
      );

      // Image upload remains disabled until a compatible
      // storage/upload endpoint is configured.
      const file = null;

      if (file) {
        status('Uploading image…');

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': file.type
          },
          body: file
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        obj.image = data.url;
      }

      status('Publishing…');

      await post('products', obj);

      $('#form').reset();

      await reload();

      status('Published to live storefront');
    } catch (error) {
      status(error.message);
    }
  };

  // Staff management
  async function loadStaff() {
    const rows = await api('staff');

    $('#staff').innerHTML = rows.map(x => `
      <article>
        <span>
          ${esc(x.email)} ·
          ${esc(x.role)} ·
          ${
            x.revoked
              ? 'Revoked'
              : x.expires_at
                ? 'Until ' + esc(x.expires_at)
                : 'Permanent'
          }
        </span>
        ${
          x.role === 'staff' && !x.revoked
            ? `<button data-revoke="${esc(x.email)}">Revoke</button>`
            : ''
        }
      </article>
    `).join('');

    const log = await api('activity');

    $('#activity').innerHTML = log.map(x => `
      <article>
        <small>
          ${esc(x.created_at)} ·
          ${esc(x.email)} ·
          ${esc(x.action)} ·
          ${esc(x.detail)}
        </small>
      </article>
    `).join('');
  }

  $('#staff').onclick = async e => {
    const button = e.target.closest('[data-revoke]');

    if (
      button &&
      confirm('Revoke this staff account immediately?')
    ) {
      try {
        await api(
          'staff/' + encodeURIComponent(button.dataset.revoke),
          { method: 'DELETE' }
        );

        await loadStaff();

        status('Access revoked');
      } catch (error) {
        status(error.message);
      }
    }
  };

  $('#invite').onsubmit = async e => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);

      const data = await post('staff', {
        email: formData.get('email'),
        password: formData.get('password'),
        days: Number(formData.get('days'))
      });

      await loadStaff();

      status(data.note || 'Staff account updated');
    } catch (error) {
      status(error.message);
    }
  };

  // Check authenticated session
  async function start() {
    try {
      user = await api('me');

      $('#who').textContent =
        'Signed in: ' + user.email + ' (' + user.role + ')';

      $('#app').hidden = false;
      $('#loginSection').hidden = true;
      $('#logout').hidden = false;

      if (user.role === 'owner') {
        $('#staffSection').hidden = false;
        await loadStaff();
      } else {
        $('#staffSection').hidden = true;
      }

      await reload();

      status('Ready');
    } catch (error) {
      if (!user) {
        $('#who').textContent = 'Sign in to manage BMT';
        $('#app').hidden = true;
        $('#loginSection').hidden = false;
        $('#logout').hidden = true;
      } else {
        status(error.message);
      }
    }
  }

  // Owner / staff login
  $('#loginForm').onsubmit = async e => {
    e.preventDefault();

    try {
      status('Signing in…');

      const formData = new FormData(e.target);

      await post('login', {
        email: formData.get('email'),
        password: formData.get('password')
      });

      $('#loginForm').reset();

      await start();
    } catch (error) {
      status(error.message);
    }
  };

  // Logout
  $('#logout').onclick = async () => {
    try {
      await api('logout', {
        method: 'POST'
      });

      location.reload();
    } catch (error) {
      status(error.message);
    }
  };

  start();
})();
