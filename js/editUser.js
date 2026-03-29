/**
 * @file
 * editUser.js – Modifier un usager (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes    = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};
  const editUserId = parseInt(sessionStorage.getItem('editUserId'));

  if (!editUserId) {
    alert('Utilisateur introuvable.');
    window.location.href = routes.users;
  }

  let _user     = null;
  let _bookings = [];
  let _users    = [];

  document.getElementById('lastName').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });
  document.getElementById('firstName').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  });

  // ── Boot ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      [_user, _bookings, _users] = await Promise.all([
        TsApi.getUsager(editUserId),
        TsApi.getBookings(),
        TsApi.getUsagers(),
      ]);
    } catch (e) {
      alert('Impossible de charger les données : ' + e.message);
      window.location.href = routes.users;
      return;
    }

    document.getElementById('lastName').value       = _user.lastName  || '';
    document.getElementById('firstName').value      = _user.firstName || '';
    document.getElementById('gender').value         = _user.gender    || '';
    document.getElementById('isCouple').checked     = !!_user.isCouple;
    document.getElementById('birthDate').value      = _user.birthDate || '';
  });

  // ── Submit ─────────────────────────────────────────────────────
  document.getElementById('editUserForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const lastName  = document.getElementById('lastName').value.trim().toUpperCase();
    const firstName = document.getElementById('firstName').value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const gender    = document.getElementById('gender').value;
    const birthDate = document.getElementById('birthDate').value;
    const isCouple  = document.getElementById('isCouple').checked;

    if (!lastName || !firstName || !gender || !birthDate) {
      alert('Merci de remplir tous les champs obligatoires.');
      return;
    }

    try {
      await TsApi.updateUsager(editUserId, { lastName, firstName, gender, birthDate, isCouple });
      alert('Modifications enregistrées.');
      window.location.href = routes.users;
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  });

  // ── Delete ─────────────────────────────────────────────────────
  document.getElementById('deleteBtn').addEventListener('click', async function () {
    if (!_user) return;
    if (!confirm('Supprimer ' + _user.firstName + ' ' + _user.lastName + ' ?')) return;
    try {
      const userBookings = _bookings.filter(b => b.userId === editUserId);
      await Promise.all(userBookings.map(b => TsApi.deleteBooking(b.id)));
      await TsApi.deleteUsager(editUserId);
      alert('Usager supprimé.');
      window.location.href = routes.users;
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    window.location.href = routes.users;
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
