/**
 * @file
 * findCouch.js – Choisir un couchage (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes      = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};
  const editUserId  = parseInt(sessionStorage.getItem('editUserId'));
  const editBookingId = parseInt(sessionStorage.getItem('editBookingId'));

  let _users    = [];
  let _bookings = [];
  let _user     = null;
  let _booking  = null;

  document.addEventListener('DOMContentLoaded', async () => {
    if (!editUserId || !editBookingId) {
      alert('Erreur : aucun utilisateur ou réservation sélectionné.');
      window.location.href = routes.users;
      return;
    }

    try {
      [_users, _bookings, _user, _booking] = await Promise.all([
        TsApi.getUsagers(),
        TsApi.getBookings(),
        TsApi.getUsager(editUserId),
        TsApi.getBooking(editBookingId),
      ]);
    } catch (e) {
      alert('Impossible de charger les données : ' + e.message);
      window.location.href = routes.users;
      return;
    }

    const currentAgeCategory = getAgeCategory(_user.birthDate);
    const currentCouch       = _booking.couch || null;
    const currentProgrammeId = _booking.programmeId;

    const couchButtons = document.querySelectorAll('.btn-couch');

    couchButtons.forEach(button => {
      const couchName = button.textContent.trim();
      const groupName = getGroupName(couchName);

      button.classList.remove('couch-blue', 'couch-green', 'couch-orange');

      const groupBookings = _bookings.filter(b => b.couch && getGroupName(b.couch) === groupName);

      let blockGroup          = false;
      let sameProgrammeThisBed = false;
      let otherProgrammeThisBed = false;

      groupBookings.forEach(b => {
        if (b.id === editBookingId) return; // skip self
        const bookedUser = _users.find(u => u.id === b.userId);
        if (!bookedUser) return;

        if (!datesOverlap(
          new Date(_booking.arrivalDate), new Date(_booking.departureDate),
          new Date(b.arrivalDate),        new Date(b.departureDate)
        )) return;

        if (getAgeCategory(bookedUser.birthDate) !== currentAgeCategory) blockGroup = true;
        if (genresIncompatibles(bookedUser, _user))                        blockGroup = true;
      });

      const bedBooking = _bookings.find(b => b.couch === couchName && b.id !== editBookingId);
      if (bedBooking && datesOverlap(
        new Date(_booking.arrivalDate), new Date(_booking.departureDate),
        new Date(bedBooking.arrivalDate), new Date(bedBooking.departureDate)
      )) {
        if (bedBooking.programmeId === currentProgrammeId) {
          sameProgrammeThisBed = true;
        } else {
          otherProgrammeThisBed = true;
        }
      }

      if (blockGroup || otherProgrammeThisBed) {
        button.classList.add('couch-orange');
      } else if (sameProgrammeThisBed) {
        button.classList.add('couch-green');
      } else {
        button.classList.add('couch-blue');
      }

      if (couchName === currentCouch) button.classList.add('selected-couch');

      button.addEventListener('click', async () => {
        if ((blockGroup || otherProgrammeThisBed) && couchName !== currentCouch) {
          alert('Ce couchage n\'est pas disponible pour cette période.');
          return;
        }
        couchButtons.forEach(b => b.classList.remove('selected-couch'));
        button.classList.add('selected-couch');

        try {
          await TsApi.updateBooking(editBookingId, { couch: couchName });
          setTimeout(() => { window.location.href = routes.users; }, 300);
        } catch (e) {
          alert('Erreur lors de la sauvegarde : ' + e.message);
        }
      });
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
      window.location.href = routes.users;
    });
  });

  // ── Helpers ────────────────────────────────────────────────────
  function getGroupName(couchName) {
    if (couchName.toLowerCase().includes('bungalow')) return 'Bungalow';
    const match = couchName.match(/^([A-Z])(\d)/i);
    return match ? match[1].toUpperCase() + match[2] : couchName;
  }

  function getAgeCategory(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 21 ? '+21' : '-21';
  }

  function datesOverlap(s1, e1, s2, e2) {
    return s1 <= e2 && e1 >= s2;
  }

  function genresIncompatibles(u1, u2) {
    if (u1.gender === u2.gender) return false;
    if (u1.isCouple && u2.isCouple) return false;
    return true;
  }

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
