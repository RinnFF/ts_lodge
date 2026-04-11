(function (window) {
  'use strict';

  // ── Shared cache ────────────────────────────────────────────────────────────
  // Stores resolved data for GET collection endpoints.
  // Write operations (POST, PATCH, DELETE) invalidate the relevant entry
  // so the next read fetches fresh data.
  const _cache = {};

  function invalidate(key) {
    delete _cache[key];
  }

  // ── API endpoint paths ───────────────────────────────────────────────────────
  const api = {
    usagers:    '/api/ts-lodge/usagers',
    bookings:   '/api/ts-lodge/bookings',
    programmes: '/api/ts-lodge/programmes',
  };

  // ── CSRF token ───────────────────────────────────────────────────────────────
  let _token = null;

  function getToken() {
    if (_token) return Promise.resolve(_token);
    return fetch('/session/token', {
      credentials: 'same-origin',
    })
      .then(r => r.text())
      .then(t => { _token = t; return t; });
  }

  // ── Core request helper ──────────────────────────────────────────────────────
  function request(method, url, data) {
    if (method === 'GET') {
      // Return cached collection responses
      if (_cache[url]) return Promise.resolve(_cache[url]);
      return fetch(url)
        .then(r => r.json())
        .then(d => {
          // Only cache collection endpoints (no trailing /<id>)
          const isCollection = Object.values(api).includes(url);
          if (isCollection) _cache[url] = d;
          return d;
        });
    }

    // Write operations — get CSRF token first
    return getToken().then(token =>
      fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: data ? JSON.stringify(data) : undefined,
      }).then(r => r.ok ? r.json().catch(() => ({})) : Promise.reject(r))
    );
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  window.TsApi = {

    // Usagers
    getUsagers:    ()        => request('GET',    api.usagers),
    getUsager:     (id)      => request('GET',    api.usagers + '/' + id),
    createUsager:  (data)    => request('POST',   api.usagers, data)
                                  .then(d => { invalidate(api.usagers); return d; }),
    updateUsager:  (id, d)   => request('PATCH',  api.usagers + '/' + id, d)
                                  .then(r => { invalidate(api.usagers); return r; }),
    deleteUsager:  (id)      => request('DELETE', api.usagers + '/' + id)
                                  .then(r => { invalidate(api.usagers); return r; }),

    // Bookings
    getBookings:    ()        => request('GET',    api.bookings),
    getBooking:     (id)      => request('GET',    api.bookings + '/' + id),
    createBooking:  (data)    => request('POST',   api.bookings, data)
                                   .then(d => { invalidate(api.bookings); return d; }),
    updateBooking:  (id, d)   => request('PATCH',  api.bookings + '/' + id, d)
                                   .then(r => { invalidate(api.bookings); return r; }),
    deleteBooking:  (id)      => request('DELETE', api.bookings + '/' + id)
                                   .then(r => { invalidate(api.bookings); return r; }),

    // Programmes
    getProgrammes:    ()        => request('GET',    api.programmes),
    getProgramme:     (id)      => request('GET',    api.programmes + '/' + id),
    createProgramme:  (data)    => request('POST',   api.programmes, data)
                                     .then(d => { invalidate(api.programmes); return d; }),
    updateProgramme:  (id, d)   => request('PATCH',  api.programmes + '/' + id, d)
                                     .then(r => { invalidate(api.programmes); return r; }),
    deleteProgramme:  (id)      => request('DELETE', api.programmes + '/' + id)
                                     .then(r => { invalidate(api.programmes); return r; }),

  };

})(window);
