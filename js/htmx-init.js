// Fetch the Drupal CSRF token once so it is ready before any write fires.
// Routes currently enforce _permission checks rather than _csrf_token, but
// this header is sent as a precaution for any future routes that require it.
(() => {
  let _token = null;
  fetch('/session/token', { credentials: 'same-origin' })
    .then(r => r.text())
    .then(t => { _token = t; });

  document.body.addEventListener('htmx:configRequest', e => {
    if (e.detail.verb !== 'get' && _token) {
      e.detail.headers['X-CSRF-Token'] = _token;
    }
  });

  // Surface server-side validation errors (HTTP 4xx) into #formError.
  document.body.addEventListener('htmx:responseError', e => {
    const el = document.getElementById('formError');
    if (el) {
      el.textContent = e.detail.xhr?.responseText || 'Une erreur est survenue.';
      el.style.display = 'block';
    }
  });
})();
