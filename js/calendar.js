(function (Drupal) {
  'use strict';

  Drupal.behaviors.tsLodgeCalendar = {
    attach: function (context, settings) {
      const wrapper = context.querySelector('.tslo-wrapper');
      if (!wrapper || wrapper.querySelector('.tslo-calendar-section')) return;

      // ── Build the calendar container ──────────────────────────────────────
      const section = document.createElement('div');
      section.className = 'tslo-calendar-section';
      section.innerHTML = `
        <h2 class="tslo-calendar-title">Calendrier des couchages</h2>
        <div class="tslo-calendar-nav">
          <button class="tslo-cal-prev" aria-label="Mois précédent">&#8592;</button>
          <span class="tslo-cal-month-label"></span>
          <button class="tslo-cal-next" aria-label="Mois suivant">&#8594;</button>
        </div>
        <div class="tslo-calendar-grid-wrapper">
          <div class="tslo-calendar-loading">Chargement&hellip;</div>
          <table class="tslo-calendar-table" aria-live="polite"></table>
        </div>
      `;
      wrapper.appendChild(section);

      // ── State ─────────────────────────────────────────────────────────────
      const today = new Date();
      let currentYear  = today.getFullYear();
      let currentMonth = today.getMonth(); // 0-indexed

      const monthLabel = section.querySelector('.tslo-cal-month-label');
      const table      = section.querySelector('.tslo-calendar-table');
      const loading    = section.querySelector('.tslo-calendar-loading');

      // ── Fetch both APIs in parallel ───────────────────────────────────────
      let usagers  = null;
      let bookings = null;

      Promise.all([
        TsApi.getUsagers(),
        TsApi.getBookings(),
      ]).then(([u, b]) => {
        usagers  = u;
        bookings = b;
        loading.style.display = 'none';
        renderCalendar();
      }).catch(() => {
        loading.textContent = 'Erreur lors du chargement des données.';
      });

      // ── Navigation ────────────────────────────────────────────────────────
      section.querySelector('.tslo-cal-prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
      });

      section.querySelector('.tslo-cal-next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
      });

      // ── Render ────────────────────────────────────────────────────────────
      function renderCalendar() {
        if (!usagers || !bookings) return;

        const monthNames = [
          'Janvier','Février','Mars','Avril','Mai','Juin',
          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
        ];
        monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
        // Convert to Mon-first (0=Mon … 6=Sun)
        const startOffset  = (firstWeekday + 6) % 7;

        const dayHeaders = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

        // Build a map: "YYYY-MM-DD" → [{lastName, couch, bookingId, userId}]
        const dayMap = {};
        bookings.forEach(b => {
          const arrival   = new Date(b.arrivalDate   + 'T00:00:00');
          const departure = new Date(b.departureDate + 'T00:00:00');
          const user      = usagers.find(u => u.id === b.userId);
          if (!user) return;

          // Iterate every day of the stay (arrival inclusive, departure exclusive)
          for (let d = new Date(arrival); d < departure; d.setDate(d.getDate() + 1)) {
            if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) continue;
            const key = formatDate(d);
            if (!dayMap[key]) dayMap[key] = [];
            dayMap[key].push({
              lastName:  user.lastName,
              couch:     b.couch,
              bookingId: b.id,
              userId:    b.userId,
            });
          }
        });

        // ── Build table HTML ───────────────────────────────────────────────
        let html = '<thead><tr>';
        dayHeaders.forEach(h => { html += `<th scope="col">${h}</th>`; });
        html += '</tr></thead><tbody>';

        let dayCount = 1;
        const totalCells = startOffset + daysInMonth;
        const rows = Math.ceil(totalCells / 7);

        for (let row = 0; row < rows; row++) {
          html += '<tr>';
          for (let col = 0; col < 7; col++) {
            const cellIndex = row * 7 + col;
            if (cellIndex < startOffset || dayCount > daysInMonth) {
              html += '<td class="tslo-cal-empty"></td>';
            } else {
              const dateStr = formatDateYMD(currentYear, currentMonth + 1, dayCount);
              const isToday = (
                dayCount === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear  === today.getFullYear()
              );
              html += `<td class="tslo-cal-day${isToday ? ' tslo-cal-today' : ''}">`;
              html += `<span class="tslo-cal-day-num">${dayCount}</span>`;

              const entries = dayMap[dateStr] || [];
              entries.forEach(e => {
                html += `<a class="tslo-cal-entry" href="/ts-lodge/usagers/${e.userId}" title="${e.lastName} – ${e.couch}">`;
                html += `<span class="tslo-cal-entry-name">${e.lastName}</span>`;
                html += `<span class="tslo-cal-entry-couch">${e.couch}</span>`;
                html += `</a>`;
              });

              html += '</td>';
              dayCount++;
            }
          }
          html += '</tr>';
        }
        html += '</tbody>';
        table.innerHTML = html;
      }

      // ── Helpers ───────────────────────────────────────────────────────────
      function formatDate(d) {
        return formatDateYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }

      function formatDateYMD(y, m, d) {
        return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      }
    }
  };

})(Drupal);
