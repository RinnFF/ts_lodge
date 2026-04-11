<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * Defines the TS Lodge Booking entity.
 *
 * @ContentEntityType(
 *   id = "ts_lodge_booking",
 *   label = @Translation("Réservation"),
 *   label_collection = @Translation("Réservations"),
 *   label_plural = @Translation("Réservations"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\Core\Entity\EntityListBuilder",
 *     "views_data" = "Drupal\ts_lodge\Entity\TsLodgeBookingViewsData",
 *     "access" = "Drupal\ts_lodge\Entity\TsLodgeEntityAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\DefaultHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "ts_lodge_booking",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "label" = "id",
 *   },
 *   links = {
 *     "canonical" = "/ts-lodge/reservation/{ts_lodge_booking}",
 *   },
 * )
 */
class TsLodgeBooking extends ContentEntityBase {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['usager_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Usager'))
      ->setRequired(TRUE)
      ->setSetting('target_type', 'ts_lodge_usager')
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'entity_reference_label', 'weight' => 0])
      ->setDisplayOptions('form', ['type' => 'entity_reference_autocomplete', 'weight' => 0]);

    $fields['programme_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Programme'))
      ->setRequired(TRUE)
      ->setSetting('target_type', 'ts_lodge_programme')
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'entity_reference_label', 'weight' => 1])
      ->setDisplayOptions('form', ['type' => 'entity_reference_autocomplete', 'weight' => 1]);

    $fields['arrival_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t("Date d'arrivée"))
      ->setRequired(TRUE)
      ->setSetting('datetime_type', 'date')
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'datetime_default', 'weight' => 2])
      ->setDisplayOptions('form', ['type' => 'datetime_default', 'weight' => 2]);

    $fields['departure_date'] = BaseFieldDefinition::create('datetime')
      ->setLabel(t('Date de départ'))
      ->setRequired(TRUE)
      ->setSetting('datetime_type', 'date')
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'datetime_default', 'weight' => 3])
      ->setDisplayOptions('form', ['type' => 'datetime_default', 'weight' => 3]);

    $fields['couch'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Couchage'))
      ->setSetting('max_length', 64)
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'string', 'weight' => 4])
      ->setDisplayOptions('form', ['type' => 'string_textfield', 'weight' => 4]);

    $fields['notes'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Notes'))
      ->setDisplayOptions('view', ['label' => 'inline', 'type' => 'basic_string', 'weight' => 5])
      ->setDisplayOptions('form', ['type' => 'string_textarea', 'weight' => 5]);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'));

    return $fields;
  }

}
