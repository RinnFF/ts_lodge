<?php

namespace Drupal\ts_lodge\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\ts_lodge\Entity\TsLodgeBooking;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * REST resource for TS Lodge Booking entities.
 *
 * @RestResource(
 *   id = "ts_lodge_booking_resource",
 *   label = @Translation("TS Lodge Réservation"),
 *   uri_paths = {
 *     "canonical"  = "/api/ts-lodge/bookings/{id}",
 *     "create"     = "/api/ts-lodge/bookings",
 *     "collection" = "/api/ts-lodge/bookings",
 *   }
 * )
 */
class TsLodgeBookingResource extends ResourceBase {

  public function get(?int $id = NULL): ResourceResponse {
    $this->checkPermission('view ts_lodge_booking');

    if ($id) {
      $entity = TsLodgeBooking::load($id);
      if (!$entity) throw new NotFoundHttpException("Réservation $id introuvable.");
      return new ResourceResponse($this->serialize($entity), 200);
    }

    $ids = \Drupal::entityQuery('ts_lodge_booking')->accessCheck(TRUE)->execute();
    $entities = TsLodgeBooking::loadMultiple($ids);
    return new ResourceResponse(array_values(array_map([$this, 'serialize'], $entities)), 200);
  }

  public function post(Request $request): ResourceResponse {
    $this->checkPermission('create ts_lodge_booking');
    $data = $this->decodeRequest($request);

    $entity = TsLodgeBooking::create([
      'usager_id'      => $data['userId']        ?? NULL,
      'programme_id'   => $data['programmeId']   ?? NULL,
      'arrival_date'   => $data['arrivalDate']   ?? '',
      'departure_date' => $data['departureDate'] ?? '',
      'couch'          => $data['couch']          ?? '',
      'notes'          => $data['notes']          ?? '',
    ]);
    $entity->save();
    return new ResourceResponse($this->serialize($entity), 201);
  }

  public function patch(int $id, Request $request): ResourceResponse {
    $this->checkPermission('edit ts_lodge_booking');
    $entity = TsLodgeBooking::load($id);
    if (!$entity) throw new NotFoundHttpException("Réservation $id introuvable.");

    $data = $this->decodeRequest($request);
    if (isset($data['programmeId']))   $entity->set('programme_id',   $data['programmeId']);
    if (isset($data['arrivalDate']))   $entity->set('arrival_date',   $data['arrivalDate']);
    if (isset($data['departureDate'])) $entity->set('departure_date', $data['departureDate']);
    if (isset($data['couch']))         $entity->set('couch',          $data['couch']);
    if (isset($data['notes']))         $entity->set('notes',          $data['notes']);
    $entity->save();
    return new ResourceResponse($this->serialize($entity), 200);
  }

  public function delete(int $id): ResourceResponse {
    $this->checkPermission('delete ts_lodge_booking');
    $entity = TsLodgeBooking::load($id);
    if (!$entity) throw new NotFoundHttpException("Réservation $id introuvable.");
    $entity->delete();
    return new ResourceResponse(NULL, 204);
  }

  private function serialize(TsLodgeBooking $e): array {
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

  private function decodeRequest(Request $request): array {
    $data = json_decode($request->getContent(), TRUE);
    if (!is_array($data)) throw new BadRequestHttpException('Corps de requête JSON invalide.');
    return $data;
  }

  private function checkPermission(string $permission): void {
    if (!\Drupal::currentUser()->hasPermission($permission)) {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
    }
  }

}
