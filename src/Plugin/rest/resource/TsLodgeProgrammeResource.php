<?php

namespace Drupal\ts_lodge\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\ts_lodge\Entity\TsLodgeProgramme;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * REST resource for TS Lodge Programme entities.
 *
 * @RestResource(
 *   id = "ts_lodge_programme_resource",
 *   label = @Translation("TS Lodge Programme"),
 *   uri_paths = {
 *     "canonical"  = "/api/ts-lodge/programmes/{id}",
 *     "create"     = "/api/ts-lodge/programmes",
 *     "collection" = "/api/ts-lodge/programmes",
 *   }
 * )
 */
class TsLodgeProgrammeResource extends ResourceBase {

  public function get(?int $id = NULL): ResourceResponse {
    $this->checkPermission('view ts_lodge_programme');

    if ($id) {
      $entity = TsLodgeProgramme::load($id);
      if (!$entity) throw new NotFoundHttpException("Programme $id introuvable.");
      $response = new ResourceResponse($this->serialize($entity), 200);
      $response->addCacheableDependency($entity);
      return $response;
    }

    $ids = \Drupal::entityQuery('ts_lodge_programme')->accessCheck(TRUE)->execute();
    $entities = TsLodgeProgramme::loadMultiple($ids);
    $data = array_values(array_map([$this, 'serialize'], $entities));
    $response = new ResourceResponse($data, 200);
    $response->getCacheableMetadata()->setCacheMaxAge(0);
    return $response;
  }

  public function post(Request $request): ResourceResponse {
    $this->checkPermission('create ts_lodge_programme');
    $data = $this->decodeRequest($request);

    $entity = TsLodgeProgramme::create([
      'category' => $data['category'] ?? '',
      'name'     => $data['name']     ?? '',
      'code'     => $data['code']     ?? '',
    ]);
    $entity->save();
    return new ResourceResponse($this->serialize($entity), 201);
  }

  public function patch(int $id, Request $request): ResourceResponse {
    $this->checkPermission('edit ts_lodge_programme');
    $entity = TsLodgeProgramme::load($id);
    if (!$entity) throw new NotFoundHttpException("Programme $id introuvable.");

    $data = $this->decodeRequest($request);
    if (isset($data['category'])) $entity->set('category', $data['category']);
    if (isset($data['name']))     $entity->set('name',     $data['name']);
    if (isset($data['code']))     $entity->set('code',     $data['code']);
    $entity->save();
    return new ResourceResponse($this->serialize($entity), 200);
  }

  public function delete(int $id): ResourceResponse {
    $this->checkPermission('delete ts_lodge_programme');
    $entity = TsLodgeProgramme::load($id);
    if (!$entity) throw new NotFoundHttpException("Programme $id introuvable.");
    $entity->delete();
    return new ResourceResponse(NULL, 204);
  }

  private function serialize(TsLodgeProgramme $e): array {
    return [
      'id'       => (int) $e->id(),
      'category' => $e->get('category')->value,
      'name'     => $e->get('name')->value,
      'code'     => $e->get('code')->value,
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
