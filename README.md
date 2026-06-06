# TS Lodge – Drupal Module (v3)

A Drupal 10/11 module for managing lodge users (usagers), accommodation bookings and programmes at TS Lodge. All data is stored in **Drupal's database** via custom content entities, fully integrated with Drupal's Views module for custom reports.

v3 replaces the per-page JavaScript/JSON-API front-end with **HTMX** — the server renders HTML fragments directly, eliminating all client-side DOM construction.

---

## Module structure

```text
ts_lodge/
├── ts_lodge.info.yml              # Module metadata (Drupal 10/11 compatible)
├── ts_lodge.module                # hook_theme(), hook_views_data_alter()
├── ts_lodge.install               # Database schema + install/uninstall hooks
├── ts_lodge.routing.yml           # URL routes for every page and HTMX partial
├── ts_lodge.libraries.yml         # Asset library definitions (CSS + JS)
├── ts_lodge.permissions.yml       # Granular permissions per entity/operation
├── ts_lodge.links.menu.yml        # Main-menu links
├── composer.json                  # Composer package definition
├── src/
│   ├── Controller/
│   │   ├── TsLodgeController.php      # Page controllers – render full pages with entity data
│   │   ├── TsLodgeHtmxController.php  # HTMX endpoints – return rendered HTML fragments
│   │   └── TsLodgeApiController.php   # JSON API (preserved for external/migration use)
│   ├── Entity/
│   │   ├── TsLodgeUsager.php
│   │   ├── TsLodgeBooking.php
│   │   ├── TsLodgeProgramme.php
│   │   ├── TsLodgeEntityAccessControlHandler.php
│   │   ├── TsLodgeUsagerViewsData.php
│   │   ├── TsLodgeBookingViewsData.php
│   │   └── TsLodgeProgrammeViewsData.php
│   ├── Form/
│   │   └── TsLodgeMigrateForm.php  # One-time localStorage → DB migration form
│   └── Plugin/
│       └── views/field/
│           └── TsLodgeAgeField.php  # Custom Views field: computed age (+21/<21)
├── config/
│   └── install/
│       └── user.role.ts_lodge_manager.yml
├── templates/
│   ├── ts-lodge-dashboard.html.twig
│   ├── ts-lodge-users.html.twig
│   ├── ts-lodge-add-user.html.twig
│   ├── ts-lodge-edit-user.html.twig
│   ├── ts-lodge-book-user.html.twig
│   ├── ts-lodge-find-couch.html.twig
│   ├── ts-lodge-couches.html.twig
│   ├── ts-lodge-programs.html.twig
│   ├── ts-lodge-users-rows.html.twig       # HTMX partial – users table rows
│   ├── ts-lodge-find-couch-buttons.html.twig # HTMX partial – couch buttons
│   ├── ts-lodge-couches-content.html.twig  # HTMX partial – couches by date
│   ├── ts-lodge-programmes-rows.html.twig  # HTMX partial – programmes table rows
│   └── ts-lodge-programme-form.html.twig   # HTMX partial – add/edit programme form
├── css/
│   └── style.css
└── js/
    ├── vendor/
    │   └── htmx.min.js   # ← must be downloaded separately (see Installation)
    ├── htmx-init.js      # CSRF token handler + error display (25 lines)
    └── calendar.js       # Couch occupancy calendar view
```

---

## Data storage

All data is stored in **Drupal's database** in three custom entity tables:

| Table | Entity | Description |
| --- | --- | --- |
| `ts_lodge_usager` | `TsLodgeUsager` | Lodge users (nom, prénom, genre, etc.) |
| `ts_lodge_booking` | `TsLodgeBooking` | Bookings linking usager + programme |
| `ts_lodge_programme` | `TsLodgeProgramme` | Available programmes |

In v3, the browser makes HTMX requests to `TsLodgeHtmxController` endpoints, which return server-rendered HTML fragments. No client-side DOM construction. The JSON API (`/api/ts-lodge/...`) is preserved for external tools and the data migration form.

---

## Installation

### Option A – Via Composer from GitHub (recommended)

**1. Add the repository** to your Drupal project's `composer.json`:

```json
"repositories": [
    {
        "type": "vcs",
        "url": "https://github.com/RinnFF/ts_lodge"
    }
]
```

**2. Require the module:**

```bash
composer require rinnff/ts_lodge:^3.0
```

**3. Enable dependencies and the module:**

```bash
drush en views ts_lodge -y
```

**4. Clear caches:**

```bash
drush cr
```

**5. Grant the role** to users who need access — see Permissions section below.

---

### Option B – Manual installation

**1.** Copy the `ts_lodge/` folder into `web/modules/custom/` of your Drupal installation.

**2.** Enable and clear caches:

```bash
drush en views ts_lodge -y && drush cr
```

---

### After installation (both options)

Visit `/ts-lodge` to see the dashboard.

If you are migrating data from Excel, see [MIGRATION.md](MIGRATION.md).

---

## Permissions

The module creates a **TS Lodge Manager** role automatically on installation with full access to all entities. Assign this role to the users who need access:

1. Go to `/admin/people`
2. Edit the relevant user account
3. Assign the **TS Lodge Manager** role
4. Save

Individual permissions can also be configured at `/admin/people/permissions` under the *TS Lodge* section:

| Permission                  | Description                        |
| --- | --- |
| `access ts_lodge`           | Access all TS Lodge pages          |
| `view ts_lodge_usager`      | View usagers                       |
| `create ts_lodge_usager`    | Add new usagers                    |
| `edit ts_lodge_usager`      | Edit existing usagers              |
| `delete ts_lodge_usager`    | Delete usagers                     |
| `view ts_lodge_booking`     | View bookings                      |
| `create ts_lodge_booking`   | Create new bookings                |
| `edit ts_lodge_booking`     | Edit bookings / assign couches     |
| `delete ts_lodge_booking`   | Delete bookings                    |
| `view ts_lodge_programme`   | View programmes                    |
| `create ts_lodge_programme` | Create programmes                  |
| `edit ts_lodge_programme`   | Edit programmes                    |
| `delete ts_lodge_programme` | Delete programmes                  |

---

## Routes & URLs

### Page routes

| Route name              | Path                                          | Description                    |
| --- | --- | --- |
| `ts_lodge.dashboard`    | `/ts-lodge`                                   | Home dashboard                 |
| `ts_lodge.users`        | `/ts-lodge/usagers`                           | Users list                     |
| `ts_lodge.add_user`     | `/ts-lodge/usagers/ajouter`                   | Add a user                     |
| `ts_lodge.edit_user`    | `/ts-lodge/usagers/modifier/{id}`             | Edit a user                    |
| `ts_lodge.book_user`    | `/ts-lodge/reservation/{userId}`              | Book a user (`?booking={id}` to edit existing) |
| `ts_lodge.find_couch`   | `/ts-lodge/choisir-couchage/{userId}/{bookingId}` | Choose a couch/bed         |
| `ts_lodge.couches`      | `/ts-lodge/couchages`                         | Couch occupation by date       |
| `ts_lodge.programs`     | `/ts-lodge/programmes`                        | Manage programmes              |
| `ts_lodge.migrate`      | `/ts-lodge/migration`                         | Import data (admin only)       |

### HTMX partial endpoints

These endpoints are called by HTMX and return rendered HTML fragments.

| Method      | Endpoint                                    | Description                             |
| --- | --- | --- |
| `GET`       | `/ts-lodge/htmx/usagers-rows`               | Rendered users table rows               |
| `POST`      | `/ts-lodge/htmx/usager`                     | Create usager → redirects to users list |
| `PATCH`     | `/ts-lodge/htmx/usager/{id}`                | Update usager → redirects               |
| `DELETE`    | `/ts-lodge/htmx/usager/{id}`                | Delete usager (cascade) → returns rows  |
| `POST`      | `/ts-lodge/htmx/usager/{userId}/booking`    | Create booking → redirects to find-couch |
| `PATCH`     | `/ts-lodge/htmx/booking/{id}`               | Update booking → redirects to find-couch |
| `DELETE`    | `/ts-lodge/htmx/booking/{id}`               | Delete booking → returns users rows     |
| `GET`       | `/ts-lodge/htmx/programmes-rows`            | Rendered programmes table rows          |
| `GET`       | `/ts-lodge/htmx/programme-form`             | Add programme form                      |
| `GET`       | `/ts-lodge/htmx/programme-form/{id}`        | Edit programme form (pre-populated)     |
| `POST`      | `/ts-lodge/htmx/programme`                  | Create programme → returns updated rows |
| `PATCH`     | `/ts-lodge/htmx/programme/{id}`             | Update programme → returns updated rows |
| `DELETE`    | `/ts-lodge/htmx/programme/{id}`             | Delete programme → returns updated rows |
| `GET`       | `/ts-lodge/htmx/couchages`                  | Couch occupation for `?date=YYYY-MM-DD` |
| `GET`       | `/ts-lodge/htmx/couchage/{userId}/{bookingId}` | Couch buttons with availability colours |
| `POST`      | `/ts-lodge/htmx/assigner-couchage/{bookingId}` | Assign couch → redirects to users list |

### JSON API endpoints (preserved)

These routes are handled by `TsLodgeApiController` and return `application/json`. Useful for external tools or the migration form.

| Method   | Endpoint                          | Description             |
| --- | --- | --- |
| `GET`    | `/api/ts-lodge/usagers`           | List all usagers        |
| `GET`    | `/api/ts-lodge/usagers/{id}`      | Get a single usager     |
| `POST`   | `/api/ts-lodge/usagers`           | Create an usager        |
| `PATCH`  | `/api/ts-lodge/usagers/{id}`      | Update an usager        |
| `DELETE` | `/api/ts-lodge/usagers/{id}`      | Delete an usager        |
| `GET`    | `/api/ts-lodge/bookings`          | List all bookings       |
| `GET`    | `/api/ts-lodge/bookings/{id}`     | Get a single booking    |
| `POST`   | `/api/ts-lodge/bookings`          | Create a booking        |
| `PATCH`  | `/api/ts-lodge/bookings/{id}`     | Update a booking        |
| `DELETE` | `/api/ts-lodge/bookings/{id}`     | Delete a booking        |
| `GET`    | `/api/ts-lodge/programmes`        | List all programmes     |
| `GET`    | `/api/ts-lodge/programmes/{id}`   | Get a single programme  |
| `POST`   | `/api/ts-lodge/programmes`        | Create a programme      |
| `PATCH`  | `/api/ts-lodge/programmes/{id}`   | Update a programme      |
| `DELETE` | `/api/ts-lodge/programmes/{id}`   | Delete a programme      |

---

## Views integration

After installation, three new base tables are available in the Views UI (`/admin/structure/views`):

- **TS Lodge Usager** — all usager fields including a computed *Âge* field (+21 / <21)
- **TS Lodge Réservation** — booking fields with relationships to both usager and programme
- **TS Lodge Programme** — programme fields with a relationship to bookings

### Example reports you can build in Views

- All bookings for a given programme, sorted by arrival date
- Usagers currently checked in (filter by date range)
- Couch occupancy overview for a selected period
- Bookings with no couch assigned yet

---

## Updating via Composer

When a new version is released:

```bash
composer update rinnff/ts_lodge
drush updb -y
drush cr
```

Tag a new release on GitHub:

```bash
git tag 3.0.0
git push origin 3.0.0
```

---

## Theming

All HTML is in Twig templates under `templates/`. To override a template in your custom theme, copy the relevant `.html.twig` file to `your_theme/templates/` and clear the cache with `drush cr`.

Page templates receive entity data as Twig variables (e.g. `{{ user.firstName }}`). HTMX partial templates are prefixed with the page they serve (e.g. `ts-lodge-users-rows.html.twig` for the users list).
