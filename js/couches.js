/**
 * @file
 * couches.js – Occupation des couchages (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.addEventListener('DOMContentLoaded', async () => {
    const dateInput       = document.getElementById('selectedDate');
    const couchesContainer = document.getElementById('couchesContainer');
    let currentDate       = new Date();
    dateInput.value       = currentDate.toISOString().split('T')[0];

    let _users    = [];
    let _bookings = [];

    try {
      [_users, _bookings] = await Promise.all([
        TsApi.getUsagers(),
        TsApi.getBookings(),
      ]);
    } catch (e) {
      couchesContainer.innerHTML = '<p>Erreur de chargement : ' + e.message + '</p>';
      return;
    }

    function renderCouches() {
      couchesContainer.innerHTML = '';
      const dateCheck = new Date(dateInput.value);

      const active = _bookings.filter(b => {
        const arr = new Date(b.arrivalDate);
        const dep = new Date(b.departureDate);
        return arr <= dateCheck && dep >= dateCheck;
      });

      if (active.length === 0) {
        couchesContainer.innerHTML = '<p>Aucun couchage occupé ce jour-là.</p>';
        return;
      }

      const map = {};
      active.forEach(b => {
        const name = b.couch || 'Non attribué';
        if (!map[name]) map[name] = [];
        const u = _users.find(u => u.id === b.userId);
        if (u) map[name].push(u.firstName + ' ' + u.lastName);
      });

      Object.entries(map).forEach(([couch, occupants]) => {
        const div = document.createElement('div');
        div.classList.add('group');
        div.innerHTML = '<h3>' + couch + '</h3><p>' + occupants.join(', ') + '</p>';
        couchesContainer.appendChild(div);
      });
    }

    document.getElementById('prevDay').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      dateInput.value = currentDate.toISOString().split('T')[0];
      renderCouches();
    });
    document.getElementById('nextDay').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      dateInput.value = currentDate.toISOString().split('T')[0];
      renderCouches();
    });
    dateInput.addEventListener('change', () => {
      currentDate = new Date(dateInput.value);
      renderCouches();
    });

    renderCouches();

    document.getElementById('closeBtn').addEventListener('click', () => {
      window.location.href = routes.users;
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
