<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * Defines the TS Lodge Programme entity.
 *
 * @ContentEntityType(
 *   id = "ts_lodge_programme",
 *   label = @Translation("Programme"),
 *   label_collection = @Translation("Programmes"),
 *   label_plural = @Translation("Programmes"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\Core\Entity\EntityListBuilder",
 *     "views_data" = "Drupal\ts_lodge\Entity\TsLodgeProgrammeViewsData",
 *     "access" = "Drupal\ts_lodge\Entity\TsLodgeEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\DefaultHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "ts_lodge_programme",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "label" = "name",
 *   },
 *   links = {
 *     "canonical" = "/ts-lodge/programmes/{ts_lodge_programme}",
 *   },
 * )
 */
class TsLodgeProgramme extends ContentEntityBase {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['category'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Catégorie'))
      ->setRequired(TRUE)
      ->setSetting('allowed_values', [
        'Scientifique' => 'Scientifique',
        'Éducatif'     => 'Éducatif',
        'Conservation' => 'Conservation',
        'Bénévole'     => 'Bénévole',
        'Autre'        => 'Autre',
      ])
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'list_default', 'weight' => 0])
      ->setDisplayOptions('form', ['type' => 'options_select', 'weight' => 0]);

    $fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Nom du programme'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 255)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'string', 'weight' => 1])
      ->setDisplayOptions('form', ['type' => 'string_textfield', 'weight' => 1]);

    $fields['code'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Code'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 64)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'string', 'weight' => 2])
      ->setDisplayOptions('form', ['type' => 'string_textfield', 'weight' => 2]);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'));

    return $fields;
  }

}
