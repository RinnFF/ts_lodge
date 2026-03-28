<?php

namespace Drupal\ts_lodge\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\ts_lodge\Entity\TsLodgeUsager;
use Drupal\ts_lodge\Entity\TsLodgeBooking;
use Drupal\ts_lodge\Entity\TsLodgeProgramme;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles all TS Lodge JSON API endpoints.
 *
 * These routes are defined explicitly in ts_lodge.routing.yml,
 * bypassing the REST module entirely for reliability.
 */
class TsLodgeApiController extends ControllerBase {

  // ── Usagers ──────────────────────────────────────────────────────

  public function usagers(Request $request): JsonResponse {
    if ($request->getMethod() === 'POST') {
      $this->checkPermission('create ts_lodge_usager');
      $data = $this->decode($request);
      $entity = TsLodgeUsager::create([
        'last_name'  => $data['lastName']  ?? '',
        'first_name' => $data['firstName'] ?? '',
        'gender'     => $data['gender']    ?? '',
        'is_couple'  => !empty($data['isCouple']),
        'birth_date' => $data['birthDate'] ?? '',
      ]);
      $entity->save();
      return new JsonResponse($this->serializeUsager($entity), 201);
    }

    // GET – list all
    $this->checkPermission('view ts_lodge_usager');
    $ids = \Drupal::entityQuery('ts_lodge_usager')
      ->accessCheck(TRUE)
      ->execute();
    $entities = TsLodgeUsager::loadMultiple($ids);
    return new JsonResponse(array_values(array_map([$this, 'serializeUsager'], $entities)));
  }

  public function usager(Request $request, int $id): JsonResponse {
    $entity = TsLodgeUsager::load($id);
    if (!$entity) {
      return new JsonResponse(['message' => "Usager $id introuvable."], 404);
    }

    if ($request->getMethod() === 'PATCH') {
      $this->checkPermission('edit ts_lodge_usager');
      $data = $this->decode($request);
      if (isset($data['lastName']))  $entity->set('last_name',  $data['lastName']);
      if (isset($data['firstName'])) $entity->set('first_name', $data['firstName']);
      if (isset($data['gender']))    $entity->set('gender',     $data['gender']);
      if (isset($data['isCouple']))  $entity->set('is_couple',  (bool) $data['isCouple']);
      if (isset($data['birthDate'])) $entity->set('birth_date', $data['birthDate']);
      $entity->save();
      return new JsonResponse($this->serializeUsager($entity));
    }

    if ($request->getMethod() === 'DELETE') {
      $this->checkPermission('delete ts_lodge_usager');
      $entity->delete();
      return new JsonResponse(NULL, 204);
    }

    // GET single
    $this->checkPermission('view ts_lodge_usager');
    return new JsonResponse($this->serializeUsager($entity));
  }

  // ── Bookings ──────────────────────────────────────────────────────

  public function bookings(Request $request): JsonResponse {
    if ($request->getMethod() === 'POST') {
      $this->checkPermission('create ts_lodge_booking');
      $data = $this->decode($request);
      $entity = TsLodgeBooking::create([
        'usager_id'      => $data['userId']        ?? NULL,
        'programme_id'   => $data['programmeId']   ?? NULL,
        'arrival_date'   => $data['arrivalDate']   ?? '',
        'departure_date' => $data['departureDate'] ?? '',
        'couch'          => $data['couch']          ?? '',
        'notes'          => $data['notes']          ?? '',
      ]);
      $entity->save();
      return new JsonResponse($this->serializeBooking($entity), 201);
    }

    // GET – list all
    $this->checkPermission('view ts_lodge_booking');
    $ids = \Drupal::entityQuery('ts_lodge_booking')
      ->accessCheck(TRUE)
      ->execute();
    $entities = TsLodgeBooking::loadMultiple($ids);
    return new JsonResponse(array_values(array_map([$this, 'serializeBooking'], $entities)));
  }

  public function booking(Request $request, int $id): JsonResponse {
    $entity = TsLodgeBooking::load($id);
    if (!$entity) {
      return new JsonResponse(['message' => "Réservation $id introuvable."], 404);
    }

    if ($request->getMethod() === 'PATCH') {
      $this->checkPermission('edit ts_lodge_booking');
      $data = $this->decode($request);
      if (isset($data['programmeId']))   $entity->set('programme_id',   $data['programmeId']);
      if (isset($data['arrivalDate']))   $entity->set('arrival_date',   $data['arrivalDate']);
      if (isset($data['departureDate'])) $entity->set('departure_date', $data['departureDate']);
      if (isset($data['couch']))         $entity->set('couch',          $data['couch']);
      if (isset($data['notes']))         $entity->set('notes',          $data['notes']);
      $entity->save();
      return new JsonResponse($this->serializeBooking($entity));
    }

    if ($request->getMethod() === 'DELETE') {
      $this->checkPermission('delete ts_lodge_booking');
      $entity->delete();
      return new JsonResponse(NULL, 204);
    }

    // GET single
    $this->checkPermission('view ts_lodge_booking');
    return new JsonResponse($this->serializeBooking($entity));
  }

  // ── Programmes ────────────────────────────────────────────────────

  public function programmes(Request $request): JsonResponse {
    if ($request->getMethod() === 'POST') {
      $this->checkPermission('create ts_lodge_programme');
      $data = $this->decode($request);
      $entity = TsLodgeProgramme::create([
        'category' => $data['category'] ?? '',
        'name'     => $data['name']     ?? '',
        'code'     => $data['code']     ?? '',
      ]);
      $entity->save();
      return new JsonResponse($this->serializeProgramme($entity), 201);
    }

    // GET – list all
    $this->checkPermission('view ts_lodge_programme');
    $ids = \Drupal::entityQuery('ts_lodge_programme')
      ->accessCheck(TRUE)
      ->execute();
    $entities = TsLodgeProgramme::loadMultiple($ids);
    return new JsonResponse(array_values(array_map([$this, 'serializeProgramme'], $entities)));
  }

  public function programme(Request $request, int $id): JsonResponse {
    $entity = TsLodgeProgramme::load($id);
    if (!$entity) {
      return new JsonResponse(['message' => "Programme $id introuvable."], 404);
    }

    if ($request->getMethod() === 'PATCH') {
      $this->checkPermission('edit ts_lodge_programme');
      $data = $this->decode($request);
      if (isset($data['category'])) $entity->set('category', $data['category']);
      if (isset($data['name']))     $entity->set('name',     $data['name']);
      if (isset($data['code']))     $entity->set('code',     $data['code']);
      $entity->save();
      return new JsonResponse($this->serializeProgramme($entity));
    }

    if ($request->getMethod() === 'DELETE') {
      $this->checkPermission('delete ts_lodge_programme');
      $entity->delete();
      return new JsonResponse(NULL, 204);
    }

    // GET single
    $this->checkPermission('view ts_lodge_programme');
    return new JsonResponse($this->serializeProgramme($entity));
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private function serializeUsager(TsLodgeUsager $e): array {
    return [
      'id'        => (int) $e->id(),
      'lastName'  => $e->get('last_name')->value,
      'firstName' => $e->get('first_name')->value,
      'gender'    => $e->get('gender')->value,
      'isCouple'  => (bool) $e->get('is_couple')->value,
      'birthDate' => $e->get('birth_date')->value,
    ];
  }

  private function serializeBooking(TsLodgeBooking $e): array {
    return [
      'id'            => (int) $e->id(),
      'userId'        => (int) $e->get('usager_id')->target_id,
      'programmeId'   => (int) $e->get('programme_id')->target_id,
      'arrivalDate'   => $e->get('arrival_date')->value,
      'departureDate' => $e->get('departure_date')->value,
      'couch'         => $e->get('couch')->value,
      'notes'         => $e->get('notes')->value,
    ];
  }

  private function serializeProgramme(TsLodgeProgramme $e): array {
    return [
      'id'       => (int) $e->id(),
      'category' => $e->get('category')->value,
      'name'     => $e->get('name')->value,
      'code'     => $e->get('code')->value,
    ];
  }

  private function decode(Request $request): array {
    $data = json_decode($request->getContent(), TRUE);
    return is_array($data) ? $data : [];
  }

  private function checkPermission(string $permission): void {
    if (!\Drupal::currentUser()->hasPermission($permission)) {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
    }
  }

}
