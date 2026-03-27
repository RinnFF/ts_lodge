/**
 * @file
 * editUser.js – Modifier un usager (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.getElementById('lastName').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });

  document.getElementById('firstName').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  });

  let editUserId = localStorage.getItem('editUserId');
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let user = users.find(u => u.id == editUserId);

  if (!user) {
    alert('Utilisateur introuvable');
    window.location.href = routes.users || '/ts-lodge/usagers';
  } else {
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('gender').value = user.gender;
    document.getElementById('isCouple').checked = !!user.isCouple;
    document.getElementById('birthDate').value = user.birthDate;
  }

  function getGroupName(couchName) {
    if (couchName.toLowerCase().includes('bungalow')) return 'Bungalow';
    const match = couchName.match(/^([A-Z])(\d)/i);
    return match ? match[1].toUpperCase() + match[2] : couchName;
  }

  function genresIncompatibles(u1, u2) {
    const g1 = u1.gender;
    const g2 = u2.gender;
    const c1 = !!u1.isCouple;
    const c2 = !!u2.isCouple;
    if (g1 === g2) return false;
    if (c1 && c2 && g1 !== g2) return false;
    return true;
  }

  function getAgeCategory(dateNaissance) {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 21 ? '+21' : '-21';
  }

  function agesIncompatibles(a1, a2) {
    return a1 !== a2;
  }

  document.getElementById('editUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let lastName = document.getElementById('lastName').value.trim().toUpperCase();
    let firstName = document.getElementById('firstName').value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    let gender = document.getElementById('gender').value;
    let birthDate = document.getElementById('birthDate').value;
    let isCouple = document.getElementById('isCouple').checked;

    if (!lastName || !firstName || !gender || !birthDate) {
      alert('Merci de remplir tous les champs obligatoires (*)');
      return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const currentBooking = bookings.find(b => b.userId === user.id);

    const oldGender = user.gender;
    const newGender = gender;
    const oldAgeCategory = getAgeCategory(user.birthDate);
    const newAgeCategory = getAgeCategory(birthDate);
    const oldIsCouple = !!user.isCouple;
    const newIsCouple = isCouple;

    if (currentBooking && (newGender !== oldGender || newAgeCategory !== oldAgeCategory || newIsCouple !== oldIsCouple)) {
      const groupName = getGroupName(currentBooking.couch || '');
      const allUsers = JSON.parse(localStorage.getItem('users')) || [];

      const conflit = bookings.some(b => {
        if (b.userId === user.id) return false;
        if (!b.couch || getGroupName(b.couch) !== groupName) return false;

        const autreUser = allUsers.find(u => u.id === b.userId);
        if (!autreUser) return false;

        if (newGender !== oldGender && genresIncompatibles(autreUser, { gender: newGender, isCouple: newIsCouple })) {
          if (!confirm('Le groupe ' + groupName + ' est déjà occupé par ' + autreUser.firstName + ' ' + autreUser.lastName + ' (' + autreUser.gender + ').\nChanger le genre annulera la réservation actuelle.\n\nVoulez-vous continuer ?')) {
            return true;
          }
          bookings.splice(bookings.findIndex(x => x.userId === user.id), 1);
          return false;
        }

        if (newAgeCategory !== oldAgeCategory && agesIncompatibles(getAgeCategory(autreUser.birthDate), newAgeCategory)) {
          if (!confirm('Le groupe ' + groupName + ' est déjà occupé par ' + autreUser.firstName + ' ' + autreUser.lastName + ' (âge ' + getAgeCategory(autreUser.birthDate) + ').\nChanger l\'âge annulera la réservation actuelle.\n\nVoulez-vous continuer ?')) {
            return true;
          }
          bookings.splice(bookings.findIndex(x => x.userId === user.id), 1);
          return false;
        }

        if (oldIsCouple && !newIsCouple && autreUser.isCouple) {
          if (!confirm('Le groupe ' + groupName + ' est déjà occupé par ' + autreUser.firstName + ' ' + autreUser.lastName + ' (en couple).\nPasser cet usager en "pas en couple" annulera la réservation actuelle.\n\nVoulez-vous continuer ?')) {
            return true;
          }
          bookings.splice(bookings.findIndex(x => x.userId === user.id), 1);
          return false;
        }

        return false;
      });

      if (conflit) return;
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    user.lastName = lastName;
    user.firstName = firstName;
    user.gender = gender;
    user.birthDate = birthDate;
    user.isCouple = isCouple;

    localStorage.setItem('users', JSON.stringify(users));
    alert('Modifications enregistrées.');
    window.location.href = routes.users || '/ts-lodge/usagers';
  });

  document.getElementById('deleteBtn').addEventListener('click', function () {
    if (confirm('Voulez-vous vraiment supprimer ' + user.firstName + ' ' + user.lastName + ' ?')) {
      users = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Usager supprimé.');
      window.location.href = routes.users || '/ts-lodge/usagers';
    }
  });

  document.getElementById('closeBtn').addEventListener('click', function () {
    window.location.href = routes.users || '/ts-lodge/usagers';
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
