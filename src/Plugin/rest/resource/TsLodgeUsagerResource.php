<?php

namespace Drupal\ts_lodge\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\ts_lodge\Entity\TsLodgeUsager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * REST resource for TS Lodge Usager entities.
 *
 * @RestResource(
 *   id = "ts_lodge_usager_resource",
 *   label = @Translation("TS Lodge Usager"),
 *   uri_paths = {
 *     "canonical"  = "/api/ts-lodge/usagers/{id}",
 *     "create"     = "/api/ts-lodge/usagers",
 *     "collection" = "/api/ts-lodge/usagers",
 *   }
 * )
 */
class TsLodgeUsagerResource extends ResourceBase {

  /**
   * GET – return all usagers, or a single one by id.
   */
  public function get(?int $id = NULL): ResourceResponse {
    $this->checkPermission('view ts_lodge_usager');

    if ($id) {
      $entity = TsLodgeUsager::load($id);
      if (!$entity) {
        throw new NotFoundHttpException("Usager $id introuvable.");
      }
      return new ResourceResponse($this->serialize($entity), 200);
    }

    $ids = \Drupal::entityQuery('ts_lodge_usager')
      ->accessCheck(TRUE)
      ->execute();
    $entities = TsLodgeUsager::loadMultiple($ids);
    $data = array_values(array_map([$this, 'serialize'], $entities));
    $response = new ResourceResponse($data, 200);
    $response->getCacheableMetadata()->setCacheMaxAge(0);
    return $response;
  }

  /**
   * POST – create a new usager.
   */
  public function post(Request $request): ResourceResponse {
    $this->checkPermission('create ts_lodge_usager');
    $data = $this->decodeRequest($request);

    $entity = TsLodgeUsager::create([
      'last_name'  => $data['lastName']  ?? '',
      'first_name' => $data['firstName'] ?? '',
      'gender'     => $data['gender']    ?? '',
      'is_couple'  => !empty($data['isCouple']),
      'birth_date' => $data['birthDate'] ?? '',
    ]);
    $entity->save();

    return new ResourceResponse($this->serialize($entity), 201);
  }

  /**
   * PATCH – update an existing usager.
   */
  public function patch(int $id, Request $request): ResourceResponse {
    $this->checkPermission('edit ts_lodge_usager');
    $entity = TsLodgeUsager::load($id);
    if (!$entity) {
      throw new NotFoundHttpException("Usager $id introuvable.");
    }

    $data = $this->decodeRequest($request);
    if (isset($data['lastName']))  $entity->set('last_name',  $data['lastName']);
    if (isset($data['firstName'])) $entity->set('first_name', $data['firstName']);
    if (isset($data['gender']))    $entity->set('gender',     $data['gender']);
    if (isset($data['isCouple']))  $entity->set('is_couple',  (bool) $data['isCouple']);
    if (isset($data['birthDate'])) $entity->set('birth_date', $data['birthDate']);
    $entity->save();

    return new ResourceResponse($this->serialize($entity), 200);
  }

  /**
   * DELETE – delete an usager.
   */
  public function delete(int $id): ResourceResponse {
    $this->checkPermission('delete ts_lodge_usager');
    $entity = TsLodgeUsager::load($id);
    if (!$entity) {
      throw new NotFoundHttpException("Usager $id introuvable.");
    }
    $entity->delete();
    return new ResourceResponse(NULL, 204);
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------

  private function serialize(TsLodgeUsager $e): array {
    return [
      'id'        => (int) $e->id(),
      'lastName'  => $e->get('last_name')->value,
      'firstName' => $e->get('first_name')->value,
      'gender'    => $e->get('gender')->value,
      'isCouple'  => (bool) $e->get('is_couple')->value,
      'birthDate' => $e->get('birth_date')->value,
    ];
  }

  private function decodeRequest(Request $request): array {
    $data = json_decode($request->getContent(), TRUE);
    if (!is_array($data)) {
      throw new BadRequestHttpException('Corps de requête JSON invalide.');
    }
    return $data;
  }

  private function checkPermission(string $permission): void {
    if (!\Drupal::currentUser()->hasPermission($permission)) {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
    }
  }

}
