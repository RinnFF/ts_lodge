/**
 * @file
 * api.js – Shared REST API client for TS Lodge.
 *
 * Replaces localStorage with Drupal entity REST endpoints.
 * All functions return Promises.
 */
(function (window) {

  'use strict';

  const settings = (typeof drupalSettings !== 'undefined' && drupalSettings.tsLodge) ? drupalSettings.tsLodge : {};
  const api      = settings.api    || {};
  const csrf     = settings.csrf   || '';

  function headers() {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    };
  }

  async function request(method, url, body) {
    const opts = {
      method,
      credentials: 'same-origin',
      headers: headers(),
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const resp = await fetch(url + '?_format=json', opts);
    if (resp.status === 204) return null;
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || resp.statusText);
    }
    return resp.json();
  }

  // ── Usagers ────────────────────────────────────────────────────
  window.TsApi = window.TsApi || {};

  TsApi.getUsagers    = ()       => request('GET',    api.usagers);
  TsApi.getUsager     = (id)     => request('GET',    api.usagers + '/' + id);
  TsApi.createUsager  = (data)   => request('POST',   api.usagers,          data);
  TsApi.updateUsager  = (id, d)  => request('PATCH',  api.usagers + '/' + id, d);
  TsApi.deleteUsager  = (id)     => request('DELETE', api.usagers + '/' + id);

  // ── Bookings ───────────────────────────────────────────────────
  TsApi.getBookings   = ()       => request('GET',    api.bookings);
  TsApi.getBooking    = (id)     => request('GET',    api.bookings + '/' + id);
  TsApi.createBooking = (data)   => request('POST',   api.bookings,           data);
  TsApi.updateBooking = (id, d)  => request('PATCH',  api.bookings + '/' + id, d);
  TsApi.deleteBooking = (id)     => request('DELETE', api.bookings + '/' + id);

  // ── Programmes ─────────────────────────────────────────────────
  TsApi.getProgrammes   = ()      => request('GET',    api.programmes);
  TsApi.getProgramme    = (id)    => request('GET',    api.programmes + '/' + id);
  TsApi.createProgramme = (data)  => request('POST',   api.programmes,            data);
  TsApi.updateProgramme = (id, d) => request('PATCH',  api.programmes + '/' + id, d);
  TsApi.deleteProgramme = (id)    => request('DELETE', api.programmes + '/' + id);

})(window);
