<?php

namespace Drupal\ts_lodge\Controller;

use Drupal\ts_lodge\Entity\TsLodgeUsager;
use Drupal\ts_lodge\Entity\TsLodgeBooking;
use Drupal\ts_lodge\Entity\TsLodgeProgramme;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * HTMX endpoints – return rendered HTML fragments, not full pages.
 *
 * Success responses for write operations return HTTP 200 with an HX-Redirect
 * header, which HTMX follows as a full browser navigation. Validation errors
 * return 422 and are surfaced by htmx-init.js into #formError.
 */
class TsLodgeHtmxController extends TsLodgeController {

  // ── Users rows ──────────────────────────────────────────────────────────────

  public function usersRows(Request $request): Response {
    $sort  = $request->query->get('sort', 'lastName');
    $dir   = $request->query->get('dir',  'asc');
    $users = $this->buildUserRows($sort, $dir);

    return $this->renderPartial('ts_lodge_users_rows', [
      '#users' => $users,
      '#sort'  => $sort,
      '#dir'   => $dir,
    ]);
  }

  // ── Create / update / delete usager ────────────────────────────────────────

  public function createUsager(Request $request): Response {
    $data = $this->formData($request);
    if ($err = $this->validateUsager($data)) {
      return new Response($err, 422);
    }
    $entity = TsLodgeUsager::create([
      'last_name'     => strtoupper(trim($data['lastName']  ?? '')),
      'first_name'    => $this->titleCase($data['firstName'] ?? ''),
      'gender'        => $data['gender']    ?? '',
      'is_couple'     => !empty($data['isCouple']),
      'birth_date'    => $data['birthDate'] ?? '',
      'researcher_id' => trim($data['researcherId'] ?? '') ?: NULL,
    ]);
    $entity->save();
    return $this->htmxRedirect('ts_lodge.users');
  }

  public function updateUsager(Request $request, int $id): Response {
    $entity = TsLodgeUsager::load($id);
    if (!$entity) {
      return new Response('Usager introuvable.', 404);
    }

    if ($request->getMethod() === 'DELETE') {
      // Cascade: remove bookings first.
      $bids = \Drupal::entityQuery('ts_lodge_booking')
        ->condition('usager_id', $id)
        ->accessCheck(TRUE)
        ->execute();
      foreach (TsLodgeBooking::loadMultiple($bids) as $b) {
        $b->delete();
      }
      $entity->delete();
      return $this->usersRows(new Request());
    }

    // PATCH
    $data = $this->formData($request);
    if ($err = $this->validateUsager($data)) {
      return new Response($err, 422);
    }
    $entity->set('last_name',     strtoupper(trim($data['lastName']  ?? '')));
    $entity->set('first_name',    $this->titleCase($data['firstName'] ?? ''));
    $entity->set('gender',        $data['gender']    ?? '');
    $entity->set('is_couple',     !empty($data['isCouple']));
    $entity->set('birth_date',    $data['birthDate'] ?? '');
    $entity->set('researcher_id', trim($data['researcherId'] ?? '') ?: NULL);
    $entity->save();
    return $this->htmxRedirect('ts_lodge.users');
  }

  // ── Create / update / delete booking ───────────────────────────────────────

  public function createBooking(Request $request, int $userId): Response {
    $data = $this->formData($request);
    $entity = TsLodgeBooking::create([
      'usager_id'      => $userId,
      'programme_id'   => (int) ($data['programmeId']   ?? 0),
      'arrival_date'   => $data['arrivalDate']   ?? '',
      'departure_date' => $data['departureDate'] ?? '',
      'notes'          => $data['notes']         ?? '',
      'couch'          => '',
    ]);
    $entity->save();

    $url = Url::fromRoute('ts_lodge.find_couch', [
      'userId'    => $userId,
      'bookingId' => (int) $entity->id(),
    ])->toString();
    return new Response('', 200, ['HX-Redirect' => $url]);
  }

  public function updateBooking(Request $request, int $id): Response {
    $entity = TsLodgeBooking::load($id);
    if (!$entity) {
      return new Response('Réservation introuvable.', 404);
    }

    if ($request->getMethod() === 'DELETE') {
      $entity->delete();
      return $this->usersRows(new Request());
    }

    // PATCH
    $data = $this->formData($request);
    if (isset($data['programmeId']))   $entity->set('programme_id',   (int) $data['programmeId']);
    if (isset($data['arrivalDate']))   $entity->set('arrival_date',   $data['arrivalDate']);
    if (isset($data['departureDate'])) $entity->set('departure_date', $data['departureDate']);
    if (isset($data['notes']))         $entity->set('notes',          $data['notes']);
    $entity->save();

    $userId = (int) $entity->get('usager_id')->target_id;
    $url = Url::fromRoute('ts_lodge.find_couch', [
      'userId'    => $userId,
      'bookingId' => $id,
    ])->toString();
    return new Response('', 200, ['HX-Redirect' => $url]);
  }

  // ── Programmes ──────────────────────────────────────────────────────────────

  public function programmesRows(): Response {
    $ids        = \Drupal::entityQuery('ts_lodge_programme')->accessCheck(TRUE)->execute();
    $entities   = TsLodgeProgramme::loadMultiple($ids);
    $programmes = array_values(array_map([$this, 'serializeProgramme'], $entities));
    return $this->renderPartial('ts_lodge_programmes_rows', ['#programmes' => $programmes]);
  }

  public function programmeForm(?int $id = NULL): Response {
    $programme = NULL;
    if ($id) {
      $entity    = TsLodgeProgramme::load($id);
      $programme = $entity ? $this->serializeProgramme($entity) : NULL;
    }
    return $this->renderPartial('ts_lodge_programme_form', ['#programme' => $programme]);
  }

  public function createProgramme(Request $request): Response {
    $data = $this->formData($request);
    TsLodgeProgramme::create([
      'category' => $data['category'] ?? '',
      'name'     => $data['name']     ?? '',
      'code'     => $data['code']     ?? '',
    ])->save();
    // Return updated rows + clear the form via OOB swap.
    return $this->programmesRowsWithFormReset();
  }

  public function updateProgramme(Request $request, int $id): Response {
    $entity = TsLodgeProgramme::load($id);
    if (!$entity) {
      return new Response('Programme introuvable.', 404);
    }

    if ($request->getMethod() === 'DELETE') {
      $entity->delete();
      return $this->programmesRowsWithFormReset();
    }

    // PATCH
    $data = $this->formData($request);
    $entity->set('category', $data['category'] ?? '');
    $entity->set('name',     $data['name']     ?? '');
    $entity->set('code',     $data['code']     ?? '');
    $entity->save();
    return $this->programmesRowsWithFormReset();
  }

  // ── Couches occupation ──────────────────────────────────────────────────────

  public function couchesContent(Request $request): Response {
    $dateStr   = $request->query->get('date', date('Y-m-d'));
    $dateCheck = new \DateTime($dateStr);

    $bids     = \Drupal::entityQuery('ts_lodge_booking')->accessCheck(TRUE)->execute();
    $bookings = TsLodgeBooking::loadMultiple($bids);

    $uids    = \Drupal::entityQuery('ts_lodge_usager')->accessCheck(TRUE)->execute();
    $usagers = TsLodgeUsager::loadMultiple($uids);

    $nameMap = [];
    foreach ($usagers as $u) {
      $nameMap[(int) $u->id()] =
        ($u->get('first_name')->value ?? '') . ' ' . ($u->get('last_name')->value ?? '');
    }

    $occupants = [];
    foreach ($bookings as $b) {
      $arrStr = $b->get('arrival_date')->value;
      $depStr = $b->get('departure_date')->value;
      if (!$arrStr || !$depStr) continue;
      $arr = new \DateTime($arrStr);
      $dep = new \DateTime($depStr);
      if ($arr > $dateCheck || $dep < $dateCheck) continue;
      $couch = $b->get('couch')->value ?: 'Non attribué';
      $uid   = (int) $b->get('usager_id')->target_id;
      $occupants[$couch][] = $nameMap[$uid] ?? 'Inconnu';
    }

    return $this->renderPartial('ts_lodge_couches_content', [
      '#occupants' => $occupants,
      '#date'      => $dateStr,
    ]);
  }

  // ── Find couch buttons ──────────────────────────────────────────────────────

  public function findCouchButtons(int $userId, int $bookingId): Response {
    $currentUser    = TsLodgeUsager::load($userId);
    $currentBooking = TsLodgeBooking::load($bookingId);
    if (!$currentUser || !$currentBooking) {
      return new Response('Introuvable.', 404);
    }

    $bids     = \Drupal::entityQuery('ts_lodge_booking')->accessCheck(TRUE)->execute();
    $bookings = TsLodgeBooking::loadMultiple($bids);

    $uids    = \Drupal::entityQuery('ts_lodge_usager')->accessCheck(TRUE)->execute();
    $usagers = TsLodgeUsager::loadMultiple($uids);

    $usagerMap = [];
    foreach ($usagers as $u) {
      $usagerMap[(int) $u->id()] = $u;
    }

    $currentUserData = [
      'gender'    => $currentUser->get('gender')->value    ?? '',
      'isCouple'  => (bool) $currentUser->get('is_couple')->value,
      'birthDate' => $currentUser->get('birth_date')->value ?? '',
    ];
    $currentAgeCategory = $this->ageCategory($currentUserData['birthDate']);
    $currentCouch       = $currentBooking->get('couch')->value ?? '';
    $currentProgId      = (int) $currentBooking->get('programme_id')->target_id;
    $currentArr = new \DateTime($currentBooking->get('arrival_date')->value   ?: '2000-01-01');
    $currentDep = new \DateTime($currentBooking->get('departure_date')->value ?: '2000-01-01');

    $allCouches = [
      'C11','C12','C13','C14',
      'C21','C22','C23','C24',
      'C31','C32','C33','C34',
      'C41','C42','C43','C44',
      'C51','C52',
      'Bungalow',
      'T11','T12','T13','T14','T15','T16','T17','T18',
      'T21','T22','T23','T24','T25','T26','T27','T28',
      'T31','T32','T33','T34','T35','T36','T37','T38',
      'T41','T42','T43','T44','T45','T46','T47','T48',
    ];

    $couchData = [];
    foreach ($allCouches as $couchName) {
      $group = $this->couchGroup($couchName);

      $blockGroup           = FALSE;
      $sameProgrammeThisBed = FALSE;
      $otherProgrammeThisBed = FALSE;

      foreach ($bookings as $b) {
        if ((int) $b->id() === $bookingId) continue;
        $bCouch = $b->get('couch')->value ?? '';
        if (!$bCouch) continue;
        $bArr = new \DateTime($b->get('arrival_date')->value   ?: '2000-01-01');
        $bDep = new \DateTime($b->get('departure_date')->value ?: '2000-01-01');
        if (!$this->datesOverlap($currentArr, $currentDep, $bArr, $bDep)) continue;

        // Group-level incompatibility check.
        if ($this->couchGroup($bCouch) === $group) {
          $bUser = $usagerMap[(int) $b->get('usager_id')->target_id] ?? NULL;
          if ($bUser) {
            $bData = [
              'gender'   => $bUser->get('gender')->value    ?? '',
              'isCouple' => (bool) $bUser->get('is_couple')->value,
              'birthDate'=> $bUser->get('birth_date')->value ?? '',
            ];
            if ($this->ageCategory($bData['birthDate']) !== $currentAgeCategory) $blockGroup = TRUE;
            if ($this->genresIncompatibles($bData, $currentUserData))            $blockGroup = TRUE;
          }
        }

        // Bed-level occupancy check.
        if ($bCouch === $couchName) {
          if ((int) $b->get('programme_id')->target_id === $currentProgId) {
            $sameProgrammeThisBed = TRUE;
          } else {
            $otherProgrammeThisBed = TRUE;
          }
        }
      }

      $blocked   = ($blockGroup || $otherProgrammeThisBed) && $couchName !== $currentCouch;
      $cssClass  = ($blockGroup || $otherProgrammeThisBed) ? 'couch-orange'
                 : ($sameProgrammeThisBed                  ? 'couch-green'
                 :                                           'couch-blue');

      $couchData[] = [
        'name'     => $couchName,
        'cssClass' => $cssClass,
        'selected' => $couchName === $currentCouch,
        'blocked'  => $blocked,
        'group'    => $group,
      ];
    }

    return $this->renderPartial('ts_lodge_find_couch_buttons', [
      '#couches'   => $couchData,
      '#userId'    => $userId,
      '#bookingId' => $bookingId,
    ]);
  }

  // ── Assign couch ────────────────────────────────────────────────────────────

  public function assignCouch(Request $request, int $bookingId): Response {
    $data   = $this->formData($request);
    $entity = TsLodgeBooking::load($bookingId);
    if (!$entity) {
      return new Response('Réservation introuvable.', 404);
    }
    $entity->set('couch', $data['couch'] ?? '');
    $entity->save();
    return $this->htmxRedirect('ts_lodge.users');
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private function renderPartial(string $theme, array $variables): Response {
    $build = array_merge($variables, [
      '#theme' => $theme,
      '#cache' => ['max-age' => 0],
    ]);
    $html = \Drupal::service('renderer')->renderPlain($build);
    return new Response($html);
  }

  private function htmxRedirect(string $routeName, array $params = []): Response {
    $url = Url::fromRoute($routeName, $params)->toString();
    return new Response('', 200, ['HX-Redirect' => $url]);
  }

  private function programmesRowsWithFormReset(): Response {
    $ids        = \Drupal::entityQuery('ts_lodge_programme')->accessCheck(TRUE)->execute();
    $entities   = TsLodgeProgramme::loadMultiple($ids);
    $programmes = array_values(array_map([$this, 'serializeProgramme'], $entities));

    // Rows replace the tbody; OOB swap hides the form container.
    $rowsHtml = (string) \Drupal::service('renderer')->renderPlain([
      '#theme'      => 'ts_lodge_programmes_rows',
      '#programmes' => $programmes,
      '#cache'      => ['max-age' => 0],
    ]);

    // Out-of-band swap: hide the form container after save/delete.
    $oob = '<div id="programFormContainer" hx-swap-oob="true" style="display:none;"></div>';

    return new Response($rowsHtml . $oob);
  }

  private function formData(Request $request): array {
    $ct = $request->headers->get('Content-Type', '');
    if (str_contains($ct, 'application/json')) {
      $data = json_decode($request->getContent(), TRUE);
      return is_array($data) ? $data : [];
    }
    return $request->request->all();
  }

  private function validateUsager(array $data): ?string {
    if (empty(trim($data['lastName']  ?? ''))) return 'Le nom est requis.';
    if (empty(trim($data['firstName'] ?? ''))) return 'Le prénom est requis.';
    if (empty($data['gender']))                return 'Le genre est requis.';
    if (empty($data['birthDate']))             return 'La date de naissance est requise.';
    return NULL;
  }

  private function titleCase(string $s): string {
    return mb_convert_case(mb_strtolower(trim($s)), MB_CASE_TITLE, 'UTF-8');
  }

  private function ageCategory(string $birthDate): string {
    if (!$birthDate) return '-21';
    $age = (int) (new \DateTime())->diff(new \DateTime($birthDate))->y;
    return $age >= 21 ? '+21' : '-21';
  }

  private function couchGroup(string $name): string {
    if (stripos($name, 'bungalow') !== FALSE) return 'Bungalow';
    if (preg_match('/^([A-Z])(\d)/i', $name, $m)) {
      return strtoupper($m[1]) . $m[2];
    }
    return $name;
  }

  private function datesOverlap(\DateTime $s1, \DateTime $e1, \DateTime $s2, \DateTime $e2): bool {
    return $s1 <= $e2 && $e1 >= $s2;
  }

  private function genresIncompatibles(array $u1, array $u2): bool {
    if ($u1['gender'] === $u2['gender']) return FALSE;
    if ($u1['isCouple'] && $u2['isCouple']) return FALSE;
    return TRUE;
  }

}
