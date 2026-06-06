(function () {
  'use strict';

  // Pre-fetch the Drupal CSRF token on page load so it is ready before
  // any write action fires. HTMX adds it to every non-GET request.
  let _token = null;
  fetch('/session/token', { credentials: 'same-origin' })
    .then(function (r) { return r.text(); })
    .then(function (t) { _token = t; });

  document.body.addEventListener('htmx:configRequest', function (e) {
    if (e.detail.verb !== 'get' && _token) {
      e.detail.headers['X-CSRF-Token'] = _token;
    }
  });

  // Surface server-side validation errors (HTTP 4xx) into #formError if present.
  document.body.addEventListener('htmx:responseError', function (e) {
    var el = document.getElementById('formError');
    if (el) {
      el.textContent = e.detail.xhr.responseText || 'Une erreur est survenue.';
      el.style.display = 'block';
    }
  });

})();
