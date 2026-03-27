/**
 * @file
 * couches.js – Occupation des couchages (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('selectedDate');
    const couchesContainer = document.getElementById('couchesContainer');

    let currentDate = new Date();
    dateInput.value = currentDate.toISOString().split('T')[0];

    document.getElementById('prevDay').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      updateDate();
    });

    document.getElementById('nextDay').addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      updateDate();
    });

    dateInput.addEventListener('change', () => {
      currentDate = new Date(dateInput.value);
      renderCouches();
    });

    function updateDate() {
      dateInput.value = currentDate.toISOString().split('T')[0];
      renderCouches();
    }

    function renderCouches() {
      couchesContainer.innerHTML = '';

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const dateStr = dateInput.value;
      const dateCheck = new Date(dateStr);

      const activeBookings = bookings.filter(b => {
        const arrival = new Date(b.arrivalDate);
        const departure = new Date(b.departureDate);
        return arrival <= dateCheck && departure >= dateCheck;
      });

      if (activeBookings.length === 0) {
        couchesContainer.innerHTML = '<p>Aucun couchage occupé ce jour-là.</p>';
        return;
      }

      const couchesMap = {};
      activeBookings.forEach(b => {
        const couchName = b.couch || 'Non attribué';
        if (!couchesMap[couchName]) couchesMap[couchName] = [];
        const user = users.find(u => u.id === b.userId);
        if (user) couchesMap[couchName].push(user.firstName + ' ' + user.lastName);
      });

      Object.entries(couchesMap).forEach(([couch, occupants]) => {
        const div = document.createElement('div');
        div.classList.add('group');
        div.innerHTML = '<h3>' + couch + '</h3><p>' + occupants.join(', ') + '</p>';
        couchesContainer.appendChild(div);
      });
    }

    renderCouches();

    document.getElementById('closeBtn').addEventListener('click', function () {
      window.location.href = routes.users || '/ts-lodge/usagers';
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
