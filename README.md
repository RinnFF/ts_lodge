# TS Lodge – Drupal Module

A Drupal 10/11 module wrapping the TS Lodge JavaScript application for managing users, bookings and accommodation assignments.

---

## Module structure

```
ts_lodge/
├── ts_lodge.info.yml          # Module metadata (Drupal 10/11 compatible)
├── ts_lodge.module            # hook_theme() declarations
├── ts_lodge.routing.yml       # URL routes for every page
├── ts_lodge.libraries.yml     # Asset library definitions (CSS + JS)
├── ts_lodge.permissions.yml   # Custom permission: "access ts_lodge"
├── ts_lodge.links.menu.yml    # Main-menu links
├── src/
│   └── Controller/
│       └── TsLodgeController.php   # Page controllers (one method per route)
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
│   └── style.css              # Original styles + dashboard card grid
└── js/
    ├── users.js
    ├── addUser.js
    ├── editUser.js
    ├── bookUser.js
    ├── findCouch.js
    ├── couches.js
    └── programs.js
```

---

## Installation

1. Copy the `ts_lodge/` folder into `web/modules/custom/` (or `modules/custom/`) of your Drupal installation.
2. Enable the module:
   ```bash
   drush en ts_lodge -y
   ```
3. Grant the permission **"Access TS Lodge application"** to the desired roles at  
   `/admin/people/permissions`.
4. Clear caches:
   ```bash
   drush cr
   ```
5. Visit `/ts-lodge` to see the dashboard.

---

## Routes & URLs

| Route name              | Path                         | Description               |
|-------------------------|------------------------------|---------------------------|
| `ts_lodge.dashboard`    | `/ts-lodge`                  | Home dashboard            |
| `ts_lodge.users`        | `/ts-lodge/usagers`          | Users list                |
| `ts_lodge.add_user`     | `/ts-lodge/usagers/ajouter`  | Add a user                |
| `ts_lodge.edit_user`    | `/ts-lodge/usagers/modifier` | Edit a user               |
| `ts_lodge.book_user`    | `/ts-lodge/reservation`      | Book a user               |
| `ts_lodge.find_couch`   | `/ts-lodge/choisir-couchage` | Choose a couch/bed        |
| `ts_lodge.couches`      | `/ts-lodge/couchages`        | Couch occupation by date  |
| `ts_lodge.programs`     | `/ts-lodge/programmes`       | Manage programs           |

---

## Asset libraries

Each page loads only the JS it needs via a dedicated library in `ts_lodge.libraries.yml`.  
All pages share the `ts_lodge/global` library which loads `style.css`.

JavaScript navigation uses **`drupalSettings.tsLodge.routes`** (injected server-side via `drupalSettings`) instead of hardcoded `.html` filenames, so the app works correctly regardless of the Drupal path prefix or language.

---

## Data storage

The application uses `localStorage` for persistence (as in the original standalone version). No Drupal database tables are used. This is intentional for a lightweight, client-side-only deployment.

---

## Theming

All HTML is in Twig templates under `templates/`. To override a template in your custom theme, copy the relevant `.html.twig` file to `your_theme/templates/` and clear the cache.
