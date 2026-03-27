<?php

namespace Drupal\ts_lodge\Plugin\views\field;

use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;

/**
 * Field handler to display the computed age of an usager.
 *
 * @ViewsField("ts_lodge_age")
 */
class TsLodgeAgeField extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function query(): void {
    // We need birth_date to compute the age.
    $this->ensureMyTable();
    $this->addAdditionalFields(['birth_date']);
  }

  /**
   * {@inheritdoc}
   */
  public function render(ResultRow $values): array {
    $raw = $this->getValue($values, 'birth_date');
    if (!$raw) {
      return ['#markup' => ''];
    }

    // birth_date is stored as ISO 8601 date string (YYYY-MM-DD).
    try {
      $birth = new \DateTime($raw);
      $today = new \DateTime();
      $age   = (int) $today->diff($birth)->y;
      $label = $age >= 21 ? '+21' : '<21';
      $class = $age >= 21 ? 'age-ok' : 'age-low';

      return [
        '#markup' => '<span class="' . $class . '">' . $label . '</span>',
        '#allowed_tags' => ['span'],
      ];
    }
    catch (\Exception $e) {
      return ['#markup' => ''];
    }
  }

}
