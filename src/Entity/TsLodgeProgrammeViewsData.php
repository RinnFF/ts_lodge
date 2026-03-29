<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for the Programme entity.
 */
class TsLodgeProgrammeViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData(): array {
    $data = parent::getViewsData();

    $data['ts_lodge_programme']['table']['group'] = $this->t('TS Lodge – Programme');
    $data['ts_lodge_programme']['table']['base'] = [
      'field' => 'id',
      'title' => $this->t('TS Lodge Programme'),
      'help'  => $this->t('Programmes TS Lodge.'),
    ];

    // Relationship to bookings.
    $data['ts_lodge_programme']['bookings'] = [
      'title'        => $this->t('Réservations'),
      'help'         => $this->t('Réservations liées à ce programme.'),
      'relationship' => [
        'base'       => 'ts_lodge_booking',
        'base field' => 'programme_id',
        'field'      => 'id',
        'id'         => 'standard',
        'label'      => $this->t('Réservations du programme'),
      ],
    ];

    return $data;
  }

}
