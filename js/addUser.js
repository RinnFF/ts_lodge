/**
 * @file
 * addUser.js – Ajouter un usager (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.getElementById('lastName').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });

  document.getElementById('firstName').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  });

  document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let lastName = document.getElementById('lastName').value.trim().toUpperCase();
    let firstName = document.getElementById('firstName').value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    let gender = document.getElementById('gender').value;
    let isCouple = document.getElementById('isCouple').checked;
    let birthDate = document.getElementById('birthDate').value;

    if (!lastName || !firstName || !gender || !birthDate) {
      alert('Merci de remplir tous les champs obligatoires (*)');
      return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const doublon = users.some(u =>
      u.lastName.toLowerCase() === lastName.toLowerCase() &&
      u.firstName.toLowerCase() === firstName.toLowerCase() &&
      u.gender === gender &&
      u.birthDate === birthDate
    );

    if (doublon) {
      alert('Cet usager est déjà enregistré');
      return;
    }

    const newUser = {
      id: Date.now(),
      lastName,
      firstName,
      gender,
      isCouple,
      birthDate
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = routes.users || '/ts-lodge/usagers';
  });

  document.getElementById('closeBtn').addEventListener('click', function () {
    window.location.href = routes.users || '/ts-lodge/usagers';
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
