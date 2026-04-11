# Migration depuis Excel vers TS Lodge

La page de migration `/ts-lodge/migration` attend un fichier JSON avec trois clés : `users`, `programs` et `bookings`. Le script PowerShell ci-dessous lit vos feuilles Excel et génère ce JSON automatiquement.

---

## Étape 1 — Formater le fichier Excel

Vous avez besoin de **trois feuilles** dans un même classeur (ou trois fichiers séparés) :

### Feuille : `users`

| Colonne | Valeur | Notes |
|---------|--------|-------|
| `id` | Valeur unique (ex. 1, 2, 3…) | Utilisée uniquement pour lier les réservations |
| `lastName` | DUPONT | Sera automatiquement mis en majuscules |
| `firstName` | Marie | |
| `gender` | `Féminin` ou `Masculin` | Doit être exactement l'une de ces deux valeurs |
| `isCouple` | `TRUE` ou `FALSE` | |
| `birthDate` | 1990-05-21 | Format **AAAA-MM-JJ** obligatoire |

### Feuille : `programs`

| Colonne | Valeur | Notes |
|---------|--------|-------|
| `code` | `PROG-001` | Doit être unique — utilisé pour lier les réservations |
| `name` | Recensement des oiseaux | |
| `category` | `Scientifique` | Doit être l'une des valeurs : `Scientifique`, `Éducatif`, `Conservation`, `Bénévole`, `Autre` |

### Feuille : `bookings`

| Colonne | Valeur | Notes |
|---------|--------|-------|
| `userId` | 1 | Doit correspondre à un `id` de la feuille users |
| `programme` | `PROG-001` | Doit correspondre à un `code` de la feuille programs |
| `arrivalDate` | 2025-06-01 | AAAA-MM-JJ |
| `departureDate` | 2025-06-07 | AAAA-MM-JJ |
| `couch` | `A3` | Optionnel |
| `notes` | | Optionnel |

---

## Étape 2 — Script PowerShell

Installez d'abord le module `ImportExcel` si ce n'est pas déjà fait :

```powershell
Install-Module ImportExcel
```

Enregistrez le script suivant sous le nom `convert_to_json.ps1` :

```powershell
param(
    [string]$ExcelFile = "reservations.xlsx"
)

$users    = Import-Excel -Path $ExcelFile -WorksheetName "users"
$programs = Import-Excel -Path $ExcelFile -WorksheetName "programs"
$bookings = Import-Excel -Path $ExcelFile -WorksheetName "bookings"

$usersJson = $users | ForEach-Object {
    [ordered]@{
        id        = [string]$_.id
        lastName  = $_.lastName
        firstName = $_.firstName
        gender    = $_.gender
        isCouple  = [bool]$_.isCouple
        birthDate = ([datetime]$_.birthDate).ToString("yyyy-MM-dd")
    }
}

$programsJson = $programs | ForEach-Object {
    [ordered]@{
        code     = [string]$_.code
        name     = $_.name
        category = $_.category
    }
}

$bookingsJson = $bookings | ForEach-Object {
    [ordered]@{
        userId        = [string]$_.userId
        programme     = [string]$_.programme
        arrivalDate   = ([datetime]$_.arrivalDate).ToString("yyyy-MM-dd")
        departureDate = ([datetime]$_.departureDate).ToString("yyyy-MM-dd")
        couch         = if ($_.couch) { [string]$_.couch } else { "" }
        notes         = if ($_.notes) { [string]$_.notes } else { "" }
    }
}

$output = [ordered]@{
    users    = @($usersJson)
    programs = @($programsJson)
    bookings = @($bookingsJson)
}

$json = $output | ConvertTo-Json -Depth 5
$json | Set-Content -Path "migration.json" -Encoding UTF8
Write-Host "Done — migration.json created."
```

Exécutez le script :

```powershell
.\convert_to_json.ps1 -ExcelFile "reservations.xlsx"
```

---

## Étape 3 — Importer les données

1. Ouvrez `migration.json`, sélectionnez tout, copiez
2. Accédez à `/ts-lodge/migration` sur le site
3. Collez le contenu dans le champ texte et cliquez sur **Importer les données**
4. Le formulaire indique le nombre d'enregistrements importés et le nombre d'erreurs
5. Consultez `/admin/reports/dblog` en cas d'erreurs — les entrées problématiques y sont identifiées

---

## Conseils

- La migration peut être **relancée sans risque** : les doublons sont détectés automatiquement (par nom + date de naissance pour les usagers, par code pour les programmes)
- Les dates **doivent** être au format `AAAA-MM-JJ` — Excel peut stocker les dates différemment, c'est pourquoi le script force ce format explicitement
- En cas d'erreur sur une réservation, vérifiez que le `userId` correspond bien à un `id` existant dans la feuille `users`, et que le `programme` correspond bien à un `code` existant dans la feuille `programs`
