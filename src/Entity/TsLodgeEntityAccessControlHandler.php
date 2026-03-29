<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access controller for TS Lodge entities.
 *
 * Maps view/create/edit/delete operations to the module's custom permissions.
 */
class TsLodgeEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account): AccessResult {
    $type = $entity->getEntityTypeId();

    $permissionMap = [
      'view'   => "view $type",
      'update' => "edit $type",
      'delete' => "delete $type",
    ];

    if (isset($permissionMap[$operation])) {
      return AccessResult::allowedIfHasPermission($account, $permissionMap[$operation]);
    }

    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL): AccessResult {
    $type = $context['entity_type_id'] ?? '';
    return AccessResult::allowedIfHasPermission($account, "create $type");
  }

}
