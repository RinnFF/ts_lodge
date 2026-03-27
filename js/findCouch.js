/**
 * @file
 * findCouch.js – Choisir un couchage (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.addEventListener('DOMContentLoaded', () => {
    const couchButtons = document.querySelectorAll('.btn-couch');

    const editUserId = localStorage.getItem('editUserId');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const user = users.find(u => u.id == editUserId);

    if (!user) {
      alert('Erreur : aucun utilisateur sélectionné');
      window.location.href = routes.users || '/ts-lodge/usagers';
      return;
    }

    const currentBooking = bookings.find(b => b.userId == editUserId);
    const currentProgramme = currentBooking ? currentBooking.programme : null;
    const currentCouch = currentBooking ? currentBooking.couch : null;
    const currentAgeCategory = getAgeCategory(user.birthDate);

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

    function datesOverlap(start1, end1, start2, end2) {
      return start1 <= end2 && end1 >= start2;
    }

    function genresIncompatibles(user1, user2) {
      const g1 = user1.gender;
      const g2 = user2.gender;
      const c1 = !!user1.isCouple;
      const c2 = !!user2.isCouple;
      if (g1 === g2) return false;
      if (c1 && c2 && g1 !== g2) return false;
      return true;
    }

    couchButtons.forEach(button => {
      const couchName = button.textContent.trim();
      const groupName = getGroupName(couchName);

      button.classList.remove('couch-blue', 'couch-green', 'couch-orange');

      const groupBookings = bookings.filter(b => b.couch && getGroupName(b.couch) === groupName);

      let blockGroup = false;
      let sameProgrammeThisBed = false;
      let otherProgrammeThisBed = false;

      groupBookings.forEach(b => {
        const bookedUser = users.find(u => u.id == b.userId);
        if (!bookedUser) return;

        const takenStart = new Date(b.arrivalDate);
        const takenEnd = new Date(b.departureDate);
        const currentStart = new Date(currentBooking.arrivalDate);
        const currentEnd = new Date(currentBooking.departureDate);

        if (!datesOverlap(currentStart, currentEnd, takenStart, takenEnd)) return;

        const bookedAgeCat = getAgeCategory(bookedUser.birthDate);
        if (bookedAgeCat !== currentAgeCategory) blockGroup = true;
        if (genresIncompatibles(bookedUser, user)) blockGroup = true;
      });

      const bedBooking = bookings.find(b => b.couch === couchName);
      if (bedBooking) {
        const takenStart = new Date(bedBooking.arrivalDate);
        const takenEnd = new Date(bedBooking.departureDate);
        const currentStart = new Date(currentBooking.arrivalDate);
        const currentEnd = new Date(currentBooking.departureDate);

        if (datesOverlap(currentStart, currentEnd, takenStart, takenEnd)) {
          if (bedBooking.programme === currentProgramme) {
            sameProgrammeThisBed = true;
          } else {
            otherProgrammeThisBed = true;
          }
        }
      }

      if (blockGroup) {
        button.classList.add('couch-orange');
      } else if (sameProgrammeThisBed) {
        button.classList.add('couch-green');
      } else if (otherProgrammeThisBed) {
        button.classList.add('couch-orange');
      } else {
        button.classList.add('couch-blue');
      }

      if (couchName === currentCouch) {
        button.classList.add('selected-couch');
      }

      button.addEventListener('click', () => {
        if (blockGroup && couchName !== currentCouch) {
          alert('Ce couchage est interdit : le groupe est déjà occupé par un âge ou un genre incompatible sur cette période.');
          return;
        }
        if (otherProgrammeThisBed && couchName !== currentCouch) {
          alert('Ce couchage est déjà réservé sur cette période.');
          return;
        }

        couchButtons.forEach(btn => btn.classList.remove('selected-couch'));
        button.classList.add('selected-couch');

        if (currentBooking) {
          currentBooking.couch = couchName;
          localStorage.setItem('bookings', JSON.stringify(bookings));
        }

        setTimeout(() => {
          window.location.href = routes.users || '/ts-lodge/usagers';
        }, 300);
      });
    });

    document.getElementById('closeBtn').addEventListener('click', function () {
      window.location.href = routes.users || '/ts-lodge/usagers';
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
