/**
 * @file
 * api.js – Shared REST API client for TS Lodge.
 *
 * Fetches a fresh CSRF token from Drupal's session endpoint before
 * making any mutating requests (POST, PATCH, DELETE).
 */
(function (window) {

  'use strict';

  const settings = (typeof drupalSettings !== 'undefined' && drupalSettings.tsLodge)
    ? drupalSettings.tsLodge : {};
  const api = settings.api || {};

  // Cache the token once fetched.
  let _csrfToken = null;

  async function getCsrfToken() {
    if (_csrfToken) return _csrfToken;
    const resp = await fetch('/session/token', {
      credentials: 'same-origin',
    });
    _csrfToken = await resp.text();
    return _csrfToken;
  }

  async function request(method, url, body) {
    const opts = {
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // CSRF token required for all mutating requests.
    if (method !== 'GET') {
      opts.headers['X-CSRF-Token'] = await getCsrfToken();
    }

    if (body !== undefined) opts.body = JSON.stringify(body);

    const resp = await fetch(url, opts);
    if (resp.status === 204) return null;
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || resp.statusText);
    }
    return resp.json();
  }

  // ── Usagers ────────────────────────────────────────────────────
  window.TsApi = window.TsApi || {};

  TsApi.getUsagers    = ()        => request('GET',    api.usagers);
  TsApi.getUsager     = (id)      => request('GET',    api.usagers + '/' + id);
  TsApi.createUsager  = (data)    => request('POST',   api.usagers, data);
  TsApi.updateUsager  = (id, d)   => request('PATCH',  api.usagers + '/' + id, d);
  TsApi.deleteUsager  = (id)      => request('DELETE', api.usagers + '/' + id);

  // ── Bookings ───────────────────────────────────────────────────
  TsApi.getBookings   = ()        => request('GET',    api.bookings);
  TsApi.getBooking    = (id)      => request('GET',    api.bookings + '/' + id);
  TsApi.createBooking = (data)    => request('POST',   api.bookings, data);
  TsApi.updateBooking = (id, d)   => request('PATCH',  api.bookings + '/' + id, d);
  TsApi.deleteBooking = (id)      => request('DELETE', api.bookings + '/' + id);

  // ── Programmes ─────────────────────────────────────────────────
  TsApi.getProgrammes   = ()      => request('GET',    api.programmes);
  TsApi.getProgramme    = (id)    => request('GET',    api.programmes + '/' + id);
  TsApi.createProgramme = (data)  => request('POST',   api.programmes, data);
  TsApi.updateProgramme = (id, d) => request('PATCH',  api.programmes + '/' + id, d);
  TsApi.deleteProgramme = (id)    => request('DELETE', api.programmes + '/' + id);

})(window);
