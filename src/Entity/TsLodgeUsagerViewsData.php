<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for the Usager entity.
 */
class TsLodgeUsagerViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData(): array {
    $data = parent::getViewsData();

    $data['ts_lodge_usager']['table']['group'] = $this->t('TS Lodge – Usager');
    $data['ts_lodge_usager']['table']['base'] = [
      'field' => 'id',
      'title' => $this->t('TS Lodge Usager'),
      'help'  => $this->t('Usagers enregistrés dans TS Lodge.'),
    ];

    // Relationship to bookings.
    $data['ts_lodge_usager']['bookings'] = [
      'title'        => $this->t('Réservations'),
      'help'         => $this->t('Réservations liées à cet usager.'),
      'relationship' => [
        'base'       => 'ts_lodge_booking',
        'base field' => 'usager_id',
        'field'      => 'id',
        'id'         => 'standard',
        'label'      => $this->t('Réservations de l\'usager'),
      ],
    ];

    // Computed age field.
    $data['ts_lodge_usager']['age'] = [
      'title'  => $this->t('Âge'),
      'help'   => $this->t('Âge calculé depuis la date de naissance.'),
      'field'  => [
        'id'    => 'ts_lodge_age',
        'click sortable' => FALSE,
      ],
    ];

    return $data;
  }

}
