# TS Lodge – Drupal Module (v2)

A Drupal 10/11 module for managing lodge users (usagers), accommodation bookings and programmes at TS Lodge. All data is stored in **Drupal's database** via custom content entities, fully integrated with Drupal's Views module for custom reports.

---

## Module structure

```
ts_lodge/
├── ts_lodge.info.yml              # Module metadata (Drupal 10/11 compatible)
├── ts_lodge.module                # hook_theme(), hook_views_data_alter()
├── ts_lodge.install               # Database schema + install/uninstall hooks
├── ts_lodge.routing.yml           # URL routes for every page
├── ts_lodge.libraries.yml         # Asset library definitions (CSS + JS)
├── ts_lodge.permissions.yml       # Granular permissions per entity/operation
├── ts_lodge.links.menu.yml        # Main-menu links
├── composer.json                  # Composer package definition
├── src/
│   ├── Controller/
│   │   └── TsLodgeController.php  # Page controllers (one method per route)
│   ├── Entity/
│   │   ├── TsLodgeUsager.php                    # Usager content entity
│   │   ├── TsLodgeBooking.php                   # Booking content entity
│   │   ├── TsLodgeProgramme.php                 # Programme content entity
│   │   ├── TsLodgeEntityAccessControlHandler.php # Shared access handler
│   │   ├── TsLodgeUsagerViewsData.php           # Views integration – usager
│   │   ├── TsLodgeBookingViewsData.php          # Views integration – booking
│   │   └── TsLodgeProgrammeViewsData.php        # Views integration – programme
│   ├── Form/
│   │   └── TsLodgeMigrateForm.php  # One-time localStorage → DB migration form
│   └── Plugin/
│       ├── rest/resource/
│       │   ├── TsLodgeUsagerResource.php    # REST API – usagers
│       │   ├── TsLodgeBookingResource.php   # REST API – bookings
│       │   └── TsLodgeProgrammeResource.php # REST API – programmes
│       └── views/field/
│           └── TsLodgeAgeField.php  # Custom Views field: computed age (+21/<21)
├── config/
│   └── install/
│       ├── user.role.ts_lodge_manager.yml             # TS Lodge Manager role
│       ├── rest.resource.ts_lodge_usager_resource.yml
│       ├── rest.resource.ts_lodge_booking_resource.yml
│       └── rest.resource.ts_lodge_programme_resource.yml
├── templates/
│   ├── ts-lodge-dashboard.html.twig   # Home / "What do you want to do?" grid
│   ├── ts-lodge-users.html.twig
│   ├── ts-lodge-add-user.html.twig
│   ├── ts-lodge-edit-user.html.twig
│   ├── ts-lodge-book-user.html.twig
│   ├── ts-lodge-find-couch.html.twig
│   ├── ts-lodge-couches.html.twig
│   └── ts-lodge-programs.html.twig
├── css/
│   └── style.css
└── js/
    ├── api.js        # Shared REST API client (TsApi.*)
    ├── users.js
    ├── addUser.js
    ├── editUser.js
    ├── bookUser.js
    ├── findCouch.js
    ├── couches.js
    └── programs.js
```

---

## Data storage

All data is stored in **Drupal's database** in three custom entity tables:

| Table                | Entity             | Description                          |
|----------------------|--------------------|--------------------------------------|
| `ts_lodge_usager`    | `TsLodgeUsager`    | Lodge users (nom, prénom, genre, etc.) |
| `ts_lodge_booking`   | `TsLodgeBooking`   | Bookings linking usager + programme  |
| `ts_lodge_programme` | `TsLodgeProgramme` | Available programmes                 |

The JavaScript front-end communicates with the database exclusively through the Drupal REST API (`/api/ts-lodge/...`). There is no use of `localStorage` in v2.

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
composer require rinnff/ts_lodge:^2.0
```

**3. Enable dependencies and the module:**

```bash
drush en rest serialization views ts_lodge -y
```

**4. Clear caches:**

```bash
drush cr
```

**5. Grant the role** to users who need access — see Permissions section below.

---

### Option B – Manual installation

**1.** Copy the `ts_lodge/` folder into `web/modules/custom/` of your Drupal installation.

**2.** Enable dependencies and the module:

```bash
drush en rest serialization views ts_lodge -y
```

**3.** Clear caches:

```bash
drush cr
```

---

### After installation (both options)

Visit `/ts-lodge` to see the dashboard.

If you are migrating from the v1 (localStorage-based) version of this module, see the **Migration** section below.

---

## Permissions

The module creates a **TS Lodge Manager** role automatically on installation with full access to all entities. Assign this role to the users who need access:

1. Go to `/admin/people`
2. Edit the relevant user account
3. Assign the **TS Lodge Manager** role
4. Save

Individual permissions can also be configured at `/admin/people/permissions` under the *TS Lodge* section:

| Permission                  | Description                        |
|-----------------------------|------------------------------------|
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

| Route name              | Path                           | Description                    |
|-------------------------|--------------------------------|--------------------------------|
| `ts_lodge.dashboard`    | `/ts-lodge`                    | Home dashboard                 |
| `ts_lodge.users`        | `/ts-lodge/usagers`            | Users list                     |
| `ts_lodge.add_user`     | `/ts-lodge/usagers/ajouter`    | Add a user                     |
| `ts_lodge.edit_user`    | `/ts-lodge/usagers/modifier`   | Edit a user                    |
| `ts_lodge.book_user`    | `/ts-lodge/reservation`        | Book a user                    |
| `ts_lodge.find_couch`   | `/ts-lodge/choisir-couchage`   | Choose a couch/bed             |
| `ts_lodge.couches`      | `/ts-lodge/couchages`          | Couch occupation by date       |
| `ts_lodge.programs`     | `/ts-lodge/programmes`         | Manage programmes              |
| `ts_lodge.migrate`      | `/ts-lodge/migration`          | Import localStorage data (admin only) |

### REST API endpoints

| Method   | Endpoint                          | Description             |
|----------|-----------------------------------|-------------------------|
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

All endpoints accept and return `application/json`. Append `?_format=json` to all requests. Authentication uses Drupal's session cookie + `X-CSRF-Token` header (handled automatically by `api.js`).

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

## Migration from v1 (localStorage)

If you used v1 of this module, your data was stored in the browser's `localStorage`. To import it into the database:

**1.** Open your browser's developer console on the site running v1 and run:

```javascript
copy(JSON.stringify({
  users:    JSON.parse(localStorage.getItem("users")    || "[]"),
  bookings: JSON.parse(localStorage.getItem("bookings") || "[]"),
  programs: JSON.parse(localStorage.getItem("programs") || "[]")
}))
```

This copies the JSON to your clipboard.

**2.** Visit `/ts-lodge/migration` on your v2 site (requires administrator access).

**3.** Paste the JSON into the form and click **Importer les données**.

**4.** The migration will report how many usagers, programmes and bookings were imported. Check `/admin/reports/dblog` if any errors are reported.

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
git tag 2.0.1
git push origin 2.0.1
```

---

## Theming

All HTML is in Twig templates under `templates/`. To override a template in your custom theme, copy the relevant `.html.twig` file to `your_theme/templates/` and clear the cache with `drush cr`.
