<?php

namespace Drupal\ts_lodge\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for the Booking entity.
 */
class TsLodgeBookingViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData(): array {
    $data = parent::getViewsData();

    $data['ts_lodge_booking']['table']['group'] = $this->t('TS Lodge – Réservation');
    $data['ts_lodge_booking']['table']['base'] = [
      'field' => 'id',
      'title' => $this->t('TS Lodge Réservation'),
      'help'  => $this->t('Réservations de couchages TS Lodge.'),
    ];

    // Relationship to usager.
    $data['ts_lodge_booking']['usager'] = [
      'title'        => $this->t('Usager'),
      'help'         => $this->t('Usager lié à cette réservation.'),
      'relationship' => [
        'base'       => 'ts_lodge_usager',
        'base field' => 'id',
        'field'      => 'usager_id',
        'id'         => 'standard',
        'label'      => $this->t('Usager de la réservation'),
      ],
    ];

    // Relationship to programme.
    $data['ts_lodge_booking']['programme'] = [
      'title'        => $this->t('Programme'),
      'help'         => $this->t('Programme lié à cette réservation.'),
      'relationship' => [
        'base'       => 'ts_lodge_programme',
        'base field' => 'id',
        'field'      => 'programme_id',
        'id'         => 'standard',
        'label'      => $this->t('Programme de la réservation'),
      ],
    ];

    return $data;
  }

}
