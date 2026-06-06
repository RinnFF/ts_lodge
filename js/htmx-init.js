// Guard against double-init (e.g. if the Drupal htmx contrib module is also
// installed and aggregates its own init alongside ours).
if (!window._tsLodgeHtmxInit) {
  window._tsLodgeHtmxInit = true;

  let _token = null;
  fetch('/session/token', { credentials: 'same-origin' })
    .then(r => r.text())
    .then(t => { _token = t; });

  document.body.addEventListener('htmx:configRequest', e => {
    if (e.detail.verb !== 'get' && _token) {
      e.detail.headers['X-CSRF-Token'] = _token;
    }
  });

  // Surface server-side validation errors (HTTP 4xx) into #formError if present.
  document.body.addEventListener('htmx:responseError', e => {
    const el = document.getElementById('formError');
    if (el) {
      el.textContent = e.detail.xhr?.responseText || 'Une erreur est survenue.';
      el.style.display = 'block';
    }
  });
}
