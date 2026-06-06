<?php

namespace Drupal\ts_lodge\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\ts_lodge\Entity\TsLodgeUsager;
use Drupal\ts_lodge\Entity\TsLodgeBooking;
use Drupal\ts_lodge\Entity\TsLodgeProgramme;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Renders full TS Lodge pages (server-populated, HTMX-driven).
 */
class TsLodgeController extends ControllerBase {

  public function dashboard(): array {
    return [
      '#theme'    => 'ts_lodge_dashboard',
      '#attached' => ['library' => ['ts_lodge/global']],
    ];
  }

  public function users(): array {
    return [
      '#theme'    => 'ts_lodge_users',
      '#attached' => ['library' => ['ts_lodge/global']],
    ];
  }

  public function addUser(): array {
    return [
      '#theme'    => 'ts_lodge_add_user',
      '#attached' => ['library' => ['ts_lodge/global']],
    ];
  }

  public function editUser(int $id): array {
    $entity = TsLodgeUsager::load($id);
    if (!$entity) {
      throw new NotFoundHttpException();
    }
    return [
      '#theme'    => 'ts_lodge_edit_user',
      '#user'     => $this->serializeUsager($entity),
      '#attached' => ['library' => ['ts_lodge/global']],
      '#cache'    => ['max-age' => 0],
    ];
  }

  public function bookUser(Request $request, int $userId): array {
    $user = TsLodgeUsager::load($userId);
    if (!$user) {
      throw new NotFoundHttpException();
    }

    $bookingId = $request->query->get('booking');
    $booking   = $bookingId ? TsLodgeBooking::load((int) $bookingId) : NULL;

    $progIds    = \Drupal::entityQuery('ts_lodge_programme')->accessCheck(TRUE)->execute();
    $progEntities = TsLodgeProgramme::loadMultiple($progIds);
    $programmes = array_values(array_map([$this, 'serializeProgramme'], $progEntities));

    return [
      '#theme'      => 'ts_lodge_book_user',
      '#user'       => $this->serializeUsager($user),
      '#booking'    => $booking ? $this->serializeBooking($booking) : NULL,
      '#programmes' => $programmes,
      '#attached'   => ['library' => ['ts_lodge/global']],
      '#cache'      => ['max-age' => 0],
    ];
  }

  public function findCouch(int $userId, int $bookingId): array {
    return [
      '#theme'     => 'ts_lodge_find_couch',
      '#userId'    => $userId,
      '#bookingId' => $bookingId,
      '#attached'  => ['library' => ['ts_lodge/global']],
      '#cache'     => ['max-age' => 0],
    ];
  }

  public function couches(): array {
    return [
      '#theme'    => 'ts_lodge_couches',
      '#attached' => ['library' => ['ts_lodge/global', 'ts_lodge/calendar']],
    ];
  }

  public function programs(): array {
    return [
      '#theme'    => 'ts_lodge_programs',
      '#attached' => ['library' => ['ts_lodge/global']],
    ];
  }

  // ── Serializers (shared with TsLodgeHtmxController via inheritance) ─────────

  protected function serializeUsager(TsLodgeUsager $e): array {
    $birthStr = $e->get('birth_date')->value ?? '';
    $age      = 0;
    if ($birthStr) {
      $age = (int) (new \DateTime())->diff(new \DateTime($birthStr))->y;
    }
    return [
      'id'        => (int) $e->id(),
      'lastName'  => $e->get('last_name')->value  ?? '',
      'firstName' => $e->get('first_name')->value ?? '',
      'gender'    => $e->get('gender')->value     ?? '',
      'isCouple'  => (bool) $e->get('is_couple')->value,
      'birthDate' => $birthStr,
      'ageStatus' => $age >= 21 ? '+21' : '<21',
      'ageClass'  => $age >= 21 ? 'age-ok' : 'age-low',
    ];
  }

  protected function serializeBooking(TsLodgeBooking $e): array {
    $prog     = $e->get('programme_id')->entity;
    return [
      'id'            => (int) $e->id(),
      'userId'        => (int) $e->get('usager_id')->target_id,
      'programmeId'   => (int) $e->get('programme_id')->target_id,
      'programmeCode' => $prog ? ($prog->get('code')->value ?? '') : '',
      'arrivalDate'   => $e->get('arrival_date')->value   ?? '',
      'departureDate' => $e->get('departure_date')->value ?? '',
      'couch'         => $e->get('couch')->value          ?? '',
      'notes'         => $e->get('notes')->value          ?? '',
    ];
  }

  protected function serializeProgramme(TsLodgeProgramme $e): array {
    return [
      'id'       => (int) $e->id(),
      'category' => $e->get('category')->value ?? '',
      'name'     => $e->get('name')->value     ?? '',
      'code'     => $e->get('code')->value     ?? '',
    ];
  }

}
