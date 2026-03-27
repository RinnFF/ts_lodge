/**
 * @file
 * programs.js – Gestion des programmes (TS Lodge v2)
 */
(function (drupalSettings) {
  'use strict';

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};
  let editId   = null; // null = create, number = edit

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPrograms();

    document.getElementById('addProgramBtn').addEventListener('click', () => {
      editId = null;
      document.getElementById('formTitle').textContent = 'Ajouter un programme';
      document.getElementById('programForm').reset();
      document.getElementById('programFormContainer').style.display = 'block';
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
      document.getElementById('programFormContainer').style.display = 'none';
    });

    document.getElementById('programForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        category: document.getElementById('category').value.trim(),
        name:     document.getElementById('name').value.trim(),
        code:     document.getElementById('code').value.trim(),
      };
      try {
        if (editId === null) {
          await TsApi.createProgramme(payload);
        } else {
          await TsApi.updateProgramme(editId, payload);
        }
        document.getElementById('programForm').reset();
        document.getElementById('programFormContainer').style.display = 'none';
        await loadPrograms();
      } catch (e) {
        alert('Erreur : ' + e.message);
      }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.href = routes.users;
    });
  });

  async function loadPrograms() {
    const tbody = document.querySelector('#programsTable tbody');
    tbody.innerHTML = '';
    let programmes = [];
    try {
      programmes = await TsApi.getProgrammes();
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="4">Erreur de chargement.</td></tr>';
      return;
    }

    programmes.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML =
        '<td>' + p.category + '</td>' +
        '<td>' + p.name     + '</td>' +
        '<td>' + p.code     + '</td>' +
        '<td>' +
          '<button class="btn-edit"   data-id="' + p.id + '" data-action="edit">Edit</button>' +
          '<button class="btn-delete" data-id="' + p.id + '" data-action="delete">Supprimer</button>' +
        '</td>';
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id     = parseInt(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === 'edit') {
          try {
            const p = await TsApi.getProgramme(id);
            editId = id;
            document.getElementById('formTitle').textContent = 'Modifier un programme';
            document.getElementById('category').value = p.category;
            document.getElementById('name').value     = p.name;
            document.getElementById('code').value     = p.code;
            document.getElementById('programFormContainer').style.display = 'block';
          } catch (e) {
            alert('Erreur : ' + e.message);
          }
        } else if (action === 'delete') {
          if (!confirm('Supprimer ce programme ?')) return;
          try {
            await TsApi.deleteProgramme(id);
            await loadPrograms();
          } catch (e) {
            alert('Erreur : ' + e.message);
          }
        }
      });
    });
  }

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
