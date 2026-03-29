/**
 * @file
 * addUser.js – Ajouter un usager (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.getElementById('lastName').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });
  document.getElementById('firstName').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  });

  document.getElementById('userForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const lastName  = document.getElementById('lastName').value.trim().toUpperCase();
    const firstName = document.getElementById('firstName').value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const gender    = document.getElementById('gender').value;
    const isCouple  = document.getElementById('isCouple').checked;
    const birthDate = document.getElementById('birthDate').value;

    if (!lastName || !firstName || !gender || !birthDate) {
      alert('Merci de remplir tous les champs obligatoires.');
      return;
    }

    try {
      await TsApi.createUsager({ lastName, firstName, gender, isCouple, birthDate });
      window.location.href = routes.users;
    } catch (e) {
      alert('Erreur lors de la création : ' + e.message);
    }
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    window.location.href = routes.users;
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
