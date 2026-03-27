/**
 * @file
 * users.js – Liste des usagers (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  let currentSortField = null;
  let sortAscending = true;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#usersTable thead th[data-field]').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-field');
        document.querySelectorAll('#usersTable thead th').forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });
        if (currentSortField === field && sortAscending) {
          th.classList.add('sort-desc');
        } else {
          th.classList.add('sort-asc');
        }
        sortUsers(field);
      });
    });

    loadUsers();

    document.getElementById('addUserBtn').addEventListener('click', () => {
      window.location.href = routes.addUser || '/ts-lodge/usagers/ajouter';
    });
    document.getElementById('viewCouchBtn').addEventListener('click', () => {
      window.location.href = routes.couches || '/ts-lodge/couchages';
    });
    document.getElementById('programsBtn').addEventListener('click', () => {
      window.location.href = routes.programs || '/ts-lodge/programmes';
    });
  });

  function sortUsers(field) {
    if (currentSortField === field) {
      sortAscending = !sortAscending;
    } else {
      currentSortField = field;
      sortAscending = true;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

    users.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'arrivalDate' || field === 'departureDate') {
        let bookingA = bookings.find(bk => bk.userId === a.id);
        let bookingB = bookings.find(bk => bk.userId === b.id);
        valA = bookingA ? bookingA[field] : '';
        valB = bookingB ? bookingB[field] : '';
      }

      if (!valA) return 1;
      if (!valB) return -1;

      if (field.includes('Date')) {
        valA = new Date(valA);
        valB = new Date(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      return sortAscending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    if (field === 'closestDate') {
      users.sort((a, b) => {
        const bookingA = bookings.find(bk => bk.userId === a.id);
        const bookingB = bookings.find(bk => bk.userId === b.id);
        const now = new Date();
        const getClosestDate = (booking) => {
          if (!booking) return new Date(8640000000000000);
          const arrival = new Date(booking.arrivalDate);
          const departure = new Date(booking.departureDate);
          return (Math.abs(arrival - now) < Math.abs(departure - now)) ? arrival : departure;
        };
        const dateA = getClosestDate(bookingA);
        const dateB = getClosestDate(bookingB);
        return sortAscending ? dateA - dateB : dateB - dateA;
      });
      localStorage.setItem('users', JSON.stringify(users));
      loadUsers();
      return;
    }

    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
  }

  function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = '';

    users.forEach(user => {
      const age = getAge(user.birthDate);
      const status = age >= 21 ? '+21' : '<21';
      const ageClass = age >= 21 ? 'age-ok' : 'age-low';
      const coupleBadge = user.isCouple ? '<span class="couple-badge">&#10084;&#65039;</span>' : '';
      const booking = bookings.find(b => b.userId === user.id);

      const row = document.createElement('tr');
      row.classList.add('user-row');
      row.innerHTML =
        '<td>' + user.lastName + '</td>' +
        '<td>' + user.firstName + '</td>' +
        '<td>' + user.gender + ' ' + coupleBadge + '</td>' +
        '<td>' + user.birthDate + '</td>' +
        '<td><span class="' + ageClass + '">' + status + '</span></td>' +
        '<td>' +
          '<button class="btn-edit" data-id="' + user.id + '" data-action="edit">Edit</button>' +
          '<button class="btn-book" data-id="' + user.id + '" data-action="book">Book</button>' +
          '<button class="btn-delete" data-id="' + user.id + '" data-action="delete">Supprimer</button>' +
        '</td>';
      tableBody.appendChild(row);

      if (booking) {
        const bookingRow = document.createElement('tr');
        bookingRow.classList.add('booking-row');
        bookingRow.innerHTML =
          '<td colspan="7"><div class="booking-details">' +
            '<strong>Programme :</strong> ' + booking.programme + ' | ' +
            '<strong>Arrivée :</strong> ' + booking.arrivalDate + ' | ' +
            '<strong>Départ :</strong> ' + booking.departureDate + ' | ' +
            '<strong>Couchage :</strong> ' + (booking.couch || 'Non attribué') +
            '<div style="margin-left:auto; display:flex; gap:5px;">' +
              '<button class="btn-edit-res" data-id="' + user.id + '" data-action="editBooking">Edit</button>' +
              '<button class="btn-delete-booking" data-id="' + user.id + '" data-action="deleteBooking">X</button>' +
            '</div>' +
          '</div></td>';
        tableBody.appendChild(bookingRow);
      }
    });

    tableBody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        if (action === 'edit') editUser(id);
        else if (action === 'book') bookUser(id);
        else if (action === 'delete') deleteUser(id);
        else if (action === 'editBooking') editBooking(id);
        else if (action === 'deleteBooking') deleteBooking(id);
      });
    });
  }

  function editUser(id) {
    localStorage.setItem('editUserId', id);
    window.location.href = routes.editUser || '/ts-lodge/usagers/modifier';
  }

  function bookUser(id) {
    localStorage.setItem('editUserId', id);
    localStorage.removeItem('editBookingMode');
    window.location.href = routes.bookUser || '/ts-lodge/reservation';
  }

  function editBooking(id) {
    localStorage.setItem('editUserId', id);
    localStorage.setItem('editBookingMode', 'true');
    window.location.href = routes.bookUser || '/ts-lodge/reservation';
  }

  function deleteUser(id) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (!confirm('Voulez-vous vraiment supprimer ' + user.firstName + ' ' + user.lastName + ' ?')) return;
    const updatedUsers = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings = bookings.filter(b => b.userId !== id);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    alert('Usager supprimé.');
    loadUsers();
  }

  function deleteBooking(userId) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings = bookings.filter(b => b.userId !== userId);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    alert('Réservation supprimée.');
    loadUsers();
  }

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
