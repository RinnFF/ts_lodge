/**
 * @file
 * bookUser.js – Réservation d'un usager (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes      = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};
  const editUserId  = parseInt(sessionStorage.getItem('editUserId'));
  const editBookingId = sessionStorage.getItem('editBookingId')
    ? parseInt(sessionStorage.getItem('editBookingId'))
    : null;

  let _user       = null;
  let _booking    = null;
  let _programmes = [];

  document.addEventListener('DOMContentLoaded', async () => {
    if (!editUserId) {
      alert('Utilisateur introuvable.');
      window.location.href = routes.users;
      return;
    }

    try {
      [_user, _programmes] = await Promise.all([
        TsApi.getUsager(editUserId),
        TsApi.getProgrammes(),
      ]);

      if (editBookingId) {
        _booking = await TsApi.getBooking(editBookingId);
      }
    } catch (e) {
      alert('Impossible de charger les données : ' + e.message);
      window.location.href = routes.users;
      return;
    }

    // Populate programme select.
    const select = document.getElementById('programme');
    select.innerHTML = '<option value="" disabled selected>Choisir un programme</option>';
    _programmes.forEach(p => {
      const opt = document.createElement('option');
      opt.value       = p.id;
      opt.textContent = p.category + ' - ' + p.name + ' (' + p.code + ')';
      select.appendChild(opt);
    });

    // Age badge.
    const birth  = new Date(_user.birthDate);
    const today  = new Date();
    let age      = today.getFullYear() - birth.getFullYear();
    const mDiff  = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    const ageCat = age >= 21 ? '+21' : '-21';
    const div    = document.getElementById('ageStatus');
    div.textContent = ageCat;
    div.className   = ageCat === '+21' ? 'age-ok' : 'age-low';

    document.getElementById('lastName').value  = _user.lastName  || '';
    document.getElementById('firstName').value = _user.firstName || '';

    if (_booking) {
      document.getElementById('arrivalDate').value   = _booking.arrivalDate   || '';
      document.getElementById('departureDate').value = _booking.departureDate || '';
      document.getElementById('programme').value     = _booking.programmeId   || '';
      document.getElementById('notes').value         = _booking.notes         || '';
    }

    // ── Save & go to find couch ───────────────────────────────────
    document.getElementById('findCouchBtn').addEventListener('click', async function () {
      const programmeId   = document.getElementById('programme').value;
      const arrivalDate   = document.getElementById('arrivalDate').value.trim();
      const departureDate = document.getElementById('departureDate').value.trim();
      const notes         = document.getElementById('notes').value.trim();

      if (!programmeId)                        { alert('Merci de choisir un programme.');    return; }
      if (!arrivalDate)                        { alert("Merci d'indiquer la date d'arrivée."); return; }
      if (!departureDate)                      { alert('Merci d\'indiquer la date de départ.'); return; }
      if (departureDate < arrivalDate)         { alert('La date de départ doit être postérieure.'); return; }

      try {
        let savedBooking;
        if (_booking) {
          savedBooking = await TsApi.updateBooking(_booking.id, {
            programmeId: parseInt(programmeId),
            arrivalDate,
            departureDate,
            notes,
          });
        } else {
          savedBooking = await TsApi.createBooking({
            userId:       editUserId,
            programmeId:  parseInt(programmeId),
            arrivalDate,
            departureDate,
            notes,
            couch: '',
          });
        }
        sessionStorage.setItem('editBookingId', savedBooking.id);
        window.location.href = routes.findCouch;
      } catch (e) {
        alert('Erreur lors de la sauvegarde : ' + e.message);
      }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.href = routes.users;
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
