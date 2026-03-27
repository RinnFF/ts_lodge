/**
 * @file
 * bookUser.js – Réservation d'un usager (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.addEventListener('DOMContentLoaded', () => {
    const editUserId = localStorage.getItem('editUserId');
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.userId == editUserId);

    // Populate programme select from saved programs
    const programs = JSON.parse(localStorage.getItem('programs')) || [];
    const programmeSelect = document.getElementById('programme');
    programmeSelect.innerHTML = '<option value="" disabled selected>Choisir un programme</option>';
    programs.forEach(prog => {
      const option = document.createElement('option');
      option.value = prog.code;
      option.textContent = prog.category + ' - ' + prog.name + ' (' + prog.code + ')';
      programmeSelect.appendChild(option);
    });

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id == editUserId);

    if (!user) {
      alert('Utilisateur introuvable');
      window.location.href = routes.users || '/ts-lodge/usagers';
      return;
    }

    // Age display
    const ageStatusDiv = document.getElementById('ageStatus');
    const birthDate = new Date(user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    const ageCat = age >= 21 ? '+21' : '-21';
    ageStatusDiv.textContent = ageCat;
    ageStatusDiv.className = ageCat === '+21' ? 'age-ok' : 'age-low';

    document.getElementById('lastName').value = user.lastName;
    document.getElementById('firstName').value = user.firstName;

    if (booking) {
      document.getElementById('arrivalDate').value = booking.arrivalDate;
      document.getElementById('departureDate').value = booking.departureDate;
      document.getElementById('programme').value = booking.programme;
      document.getElementById('notes').value = booking.notes || '';
    }

    document.getElementById('findCouchBtn').addEventListener('click', function () {
      const programme = document.getElementById('programme').value.trim();
      const arrivalDate = document.getElementById('arrivalDate').value.trim();
      const departureDate = document.getElementById('departureDate').value.trim();
      const notes = document.getElementById('notes').value.trim();

      if (!programme) { alert('Merci de choisir un programme'); return; }
      if (!arrivalDate) { alert("Merci de choisir une date d'arrivée"); return; }
      if (!departureDate) { alert('Merci de choisir une date de départ'); return; }
      if (departureDate < arrivalDate) { alert("La date de départ doit être postérieure à la date d'arrivée"); return; }

      const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const index = allBookings.findIndex(b => b.userId == user.id);

      if (index !== -1) {
        allBookings[index].programme = programme;
        allBookings[index].arrivalDate = arrivalDate;
        allBookings[index].departureDate = departureDate;
        allBookings[index].notes = notes;
      } else {
        allBookings.push({
          id: Date.now(),
          userId: user.id,
          programme,
          arrivalDate,
          departureDate,
          notes
        });
      }

      localStorage.setItem('bookings', JSON.stringify(allBookings));
      window.location.href = routes.findCouch || '/ts-lodge/choisir-couchage';
    });

    document.getElementById('backBtn').addEventListener('click', function () {
      window.location.href = routes.users || '/ts-lodge/usagers';
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
