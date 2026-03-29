/**
 * @file
 * users.js – Liste des usagers (TS Lodge v2 – entity-backed)
 */
(function (drupalSettings) {
  'use strict';

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  // Format ISO date string (YYYY-MM-DD) to DD MMM YYYY.
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate().toString().padStart(2,'0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  let currentSortField = null;
  let sortAscending    = true;

  // In-memory cache loaded once per page.
  let _users    = [];
  let _bookings = [];

  // ── Boot ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    await loadAll();

    document.querySelectorAll('#usersTable thead th[data-field]').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-field');
        document.querySelectorAll('#usersTable thead th')
          .forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(currentSortField === field && sortAscending ? 'sort-desc' : 'sort-asc');
        sortAndRender(field);
      });
    });

    document.getElementById('addUserBtn').addEventListener('click', () => {
      window.location.href = routes.addUser;
    });
    document.getElementById('viewCouchBtn').addEventListener('click', () => {
      window.location.href = routes.couches;
    });
    document.getElementById('programsBtn').addEventListener('click', () => {
      window.location.href = routes.programs;
    });
  });

  // ── Data loading ───────────────────────────────────────────────
  async function loadAll() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '<tr><td colspan="7">Chargement...</td></tr>';
    try {
      [_users, _bookings] = await Promise.all([
        TsApi.getUsagers(),
        TsApi.getBookings(),
      ]);
    } catch (e) {
      console.error('TsLodge load error', e);
      tbody.innerHTML = '<tr><td colspan="7">Erreur de chargement : ' + e.message + '</td></tr>';
      return;
    }
    renderUsers();
  }

  // ── Sorting ────────────────────────────────────────────────────
  function sortAndRender(field) {
    if (currentSortField === field) {
      sortAscending = !sortAscending;
    } else {
      currentSortField = field;
      sortAscending    = true;
    }

    const sorted = [..._users].sort((a, b) => {
      let valA, valB;

      if (field === 'closestDate') {
        const now = new Date();
        const closest = (u) => {
          const bk = _bookings.find(b => b.userId === u.id);
          if (!bk) return new Date(8640000000000000);
          const arr = new Date(bk.arrivalDate);
          const dep = new Date(bk.departureDate);
          return Math.abs(arr - now) < Math.abs(dep - now) ? arr : dep;
        };
        valA = closest(a);
        valB = closest(b);
      } else if (field === 'lastName' || field === 'firstName' || field === 'gender') {
        valA = (a[field] || '').toLowerCase();
        valB = (b[field] || '').toLowerCase();
      } else if (field === 'birthDate') {
        valA = new Date(a.birthDate || 0);
        valB = new Date(b.birthDate || 0);
      } else {
        valA = a[field] || '';
        valB = b[field] || '';
      }

      if (!valA) return 1;
      if (!valB) return -1;
      return sortAscending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    _users = sorted;
    renderUsers();
  }

  // ── Render ─────────────────────────────────────────────────────
  function getAge(dateString) {
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function renderUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    _users.forEach(user => {
      const age      = getAge(user.birthDate);
      const status   = age >= 21 ? '+21' : '<21';
      const ageClass = age >= 21 ? 'age-ok' : 'age-low';
      const badge    = user.isCouple ? '<span class="couple-badge">&#10084;&#65039;</span>' : '';
      const booking  = _bookings.find(b => b.userId === user.id);

      const row = document.createElement('tr');
      row.classList.add('user-row');
      row.innerHTML =
        '<td>' + user.lastName  + '</td>' +
        '<td>' + user.firstName + '</td>' +
        '<td>' + user.gender + ' ' + badge + '</td>' +
        '<td>' + formatDate(user.birthDate) + '</td>' +
        '<td><span class="' + ageClass + '">' + status + '</span></td>' +
        '<td>' +
          '<button class="btn-edit"   data-id="' + user.id + '" data-action="edit">Edit</button>' +
          '<button class="btn-book"   data-id="' + user.id + '" data-action="book">Book</button>' +
          '<button class="btn-delete" data-id="' + user.id + '" data-action="delete">Supprimer</button>' +
        '</td>';
      tbody.appendChild(row);

      if (booking) {
        const brow = document.createElement('tr');
        brow.classList.add('booking-row');
        brow.innerHTML =
          '<td colspan="7"><div class="booking-details">' +
            '<strong>Programme :</strong> ' + (booking.programmeCode || booking.programmeId) + ' | ' +
            '<strong>Arrivée :</strong> '   + formatDate(booking.arrivalDate) + ' | ' +
            '<strong>Départ :</strong> '    + formatDate(booking.departureDate) + ' | ' +
            '<strong>Couchage :</strong> '  + (booking.couch         || 'Non attribué') +
            '<div style="margin-left:auto; display:flex; gap:5px;">' +
              '<button class="btn-edit-res"      data-id="' + user.id + '" data-bid="' + booking.id + '" data-action="editBooking">Edit</button>' +
              '<button class="btn-delete-booking" data-id="' + user.id + '" data-bid="' + booking.id + '" data-action="deleteBooking">X</button>' +
            '</div>' +
          '</div></td>';
        tbody.appendChild(brow);
      }
    });

    tbody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id     = parseInt(btn.dataset.id);
        const bid    = btn.dataset.bid ? parseInt(btn.dataset.bid) : null;
        const action = btn.dataset.action;
        if      (action === 'edit')          editUser(id);
        else if (action === 'book')          bookUser(id);
        else if (action === 'delete')        deleteUser(id);
        else if (action === 'editBooking')   editBooking(id, bid);
        else if (action === 'deleteBooking') deleteBooking(id, bid);
      });
    });
  }

  // ── Actions ────────────────────────────────────────────────────
  function editUser(id) {
    sessionStorage.setItem('editUserId', id);
    window.location.href = routes.editUser;
  }

  function bookUser(id) {
    sessionStorage.setItem('editUserId', id);
    sessionStorage.removeItem('editBookingId');
    window.location.href = routes.bookUser;
  }

  function editBooking(userId, bookingId) {
    sessionStorage.setItem('editUserId',   userId);
    sessionStorage.setItem('editBookingId', bookingId);
    window.location.href = routes.bookUser;
  }

  async function deleteUser(id) {
    const user = _users.find(u => u.id === id);
    if (!user) return;
    if (!confirm('Voulez-vous vraiment supprimer ' + user.firstName + ' ' + user.lastName + ' ?')) return;
    try {
      // Delete associated bookings first.
      const userBookings = _bookings.filter(b => b.userId === id);
      await Promise.all(userBookings.map(b => TsApi.deleteBooking(b.id)));
      await TsApi.deleteUsager(id);
      alert('Usager supprimé.');
      await loadAll();
    } catch (e) {
      alert('Erreur lors de la suppression : ' + e.message);
    }
  }

  async function deleteBooking(userId, bookingId) {
    if (!confirm('Supprimer cette réservation ?')) return;
    try {
      await TsApi.deleteBooking(bookingId);
      alert('Réservation supprimée.');
      await loadAll();
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  }

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
