/**
 * @file
 * programs.js – Gestion des programmes (TS Lodge Drupal module)
 */
(function (drupalSettings) {

  const routes = (drupalSettings.tsLodge && drupalSettings.tsLodge.routes) || {};

  document.addEventListener('DOMContentLoaded', () => {
    const programsTable = document.querySelector('#programsTable tbody');
    const addProgramBtn = document.getElementById('addProgramBtn');
    const programFormContainer = document.getElementById('programFormContainer');
    const programForm = document.getElementById('programForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');

    let editIndex = null;

    function loadPrograms() {
      programsTable.innerHTML = '';
      const programs = JSON.parse(localStorage.getItem('programs')) || [];

      programs.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML =
          '<td>' + p.category + '</td>' +
          '<td>' + p.name + '</td>' +
          '<td>' + p.code + '</td>' +
          '<td>' +
            '<button class="btn-edit" data-index="' + index + '" data-action="edit">Edit</button>' +
            '<button class="btn-delete" data-index="' + index + '" data-action="delete">Supprimer</button>' +
          '</td>';
        programsTable.appendChild(row);
      });

      programsTable.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          const action = btn.dataset.action;
          const progs = JSON.parse(localStorage.getItem('programs')) || [];

          if (action === 'edit') {
            const prog = progs[idx];
            editIndex = idx;
            formTitle.textContent = 'Modifier un programme';
            document.getElementById('category').value = prog.category;
            document.getElementById('name').value = prog.name;
            document.getElementById('code').value = prog.code;
            programFormContainer.style.display = 'block';
          } else if (action === 'delete') {
            if (!confirm('Supprimer ce programme ?')) return;
            progs.splice(idx, 1);
            localStorage.setItem('programs', JSON.stringify(progs));
            loadPrograms();
          }
        });
      });
    }

    addProgramBtn.addEventListener('click', () => {
      editIndex = null;
      formTitle.textContent = 'Ajouter un programme';
      programForm.reset();
      programFormContainer.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
      programFormContainer.style.display = 'none';
    });

    programForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const programs = JSON.parse(localStorage.getItem('programs')) || [];
      const newProgram = {
        category: document.getElementById('category').value.trim(),
        name: document.getElementById('name').value.trim(),
        code: document.getElementById('code').value.trim()
      };

      if (editIndex === null) {
        programs.push(newProgram);
      } else {
        programs[editIndex] = newProgram;
      }

      localStorage.setItem('programs', JSON.stringify(programs));
      programForm.reset();
      programFormContainer.style.display = 'none';
      loadPrograms();
    });

    loadPrograms();

    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.href = routes.users || '/ts-lodge/usagers';
    });
  });

})(typeof drupalSettings !== 'undefined' ? drupalSettings : {});
