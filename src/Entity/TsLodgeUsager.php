<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * Defines the TS Lodge Usager entity.
 *
 * @ContentEntityType(
 *   id = "ts_lodge_usager",
 *   label = @Translation("Usager"),
 *   label_collection = @Translation("Usagers"),
 *   label_plural = @Translation("Usagers"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\Core\Entity\EntityListBuilder",
 *     "views_data" = "Drupal\ts_lodge\Entity\TsLodgeUsagerViewsData",
 *     "access" = "Drupal\ts_lodge\Entity\TsLodgeEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\DefaultHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "ts_lodge_usager",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "label" = "last_name",
 *   },
 *   links = {
 *     "canonical" = "/ts-lodge/usagers/{ts_lodge_usager}",
 *   },
 * )
 */
class TsLodgeUsager extends ContentEntityBase {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['last_name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Nom'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 128)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'string', 'weight' => 0])
      ->setDisplayOptions('form', ['type' => 'string_textfield', 'weight' => 0]);

    $fields['first_name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Prénom'))
      ->setRequired(TRUE)
      ->setSetting('max_length', 128)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'string', 'weight' => 1])
      ->setDisplayOptions('form', ['type' => 'string_textfield', 'weight' => 1]);

    $fields['gender'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Genre'))
      ->setRequired(TRUE)
      ->setSetting('allowed_values', [
        'Féminin'  => 'Féminin',
        'Masculin' => 'Masculin',
      ])
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'list_default', 'weight' => 2])
      ->setDisplayOptions('form', ['type' => 'options_select', 'weight' => 2]);

    $fields['is_couple'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('En couple'))
      ->setDefaultValue(FALSE)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'boolean', 'weight' => 3])
      ->setDisplayOptions('form', ['type' => 'boolean_checkbox', 'weight' => 3]);

    $fields['birth_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Date de naissance'))
      ->setRequired(TRUE)
      ->setSetting('datetime_type', 'date')
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'datetime_default', 'weight' => 4])
      ->setDisplayOptions('form', ['type' => 'datetime_default', 'weight' => 4]);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'));

    return $fields;
  }

}
