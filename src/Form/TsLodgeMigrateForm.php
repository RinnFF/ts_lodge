<?php

namespace Drupal\ts_lodge\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ts_lodge\Entity\TsLodgeUsager;
use Drupal\ts_lodge\Entity\TsLodgeProgramme;
use Drupal\ts_lodge\Entity\TsLodgeBooking;

/**
 * One-time migration form: paste localStorage JSON → Drupal entities.
 */
class TsLodgeMigrateForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'ts_lodge_migrate_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['#prefix'] = '<div class="ts-lodge-migrate">';
    $form['#suffix'] = '</div>';

    $form['intro'] = [
      '#markup' => '<p>' . $this->t(
        'Collez ici les données exportées depuis votre navigateur (localStorage). '
        . 'Ouvrez la console du navigateur sur votre ancienne installation et exécutez :'
        . '<br><code>copy(JSON.stringify({users: JSON.parse(localStorage.getItem("users")||"[]"), '
        . 'bookings: JSON.parse(localStorage.getItem("bookings")||"[]"), '
        . 'programs: JSON.parse(localStorage.getItem("programs")||"[]")}))</code>'
        . '<br>puis collez le résultat ci-dessous.'
      ) . '</p>',
    ];

    $form['json_data'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Données JSON'),
      '#rows'          => 20,
      '#required'      => TRUE,
      '#attributes'    => ['placeholder' => '{"users":[...],"bookings":[...],"programs":[...]}'],
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type'  => 'submit',
      '#value' => $this->t('Importer les données'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $raw = $form_state->getValue('json_data');
    $data = json_decode($raw, TRUE);
    if (!is_array($data)) {
      $form_state->setErrorByName('json_data', $this->t('JSON invalide.'));
      return;
    }
    if (empty($data['users']) && empty($data['programs'])) {
      $form_state->setErrorByName('json_data', $this->t('Aucun usager ni programme trouvé dans le JSON.'));
    }
    $form_state->set('parsed_data', $data);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $data = $form_state->get('parsed_data');

    $usersImported    = 0;
    $programsImported = 0;
    $bookingsImported = 0;
    $errors           = 0;

    // Map old localStorage IDs → new Drupal entity IDs.
    $userIdMap     = [];
    $programmeIdMap = [];

    // --- Import programmes first (bookings reference them) ---
    foreach ($data['programs'] ?? [] as $p) {
      try {
        // Skip duplicates by code.
        $existing = \Drupal::entityQuery('ts_lodge_programme')
          ->condition('code', $p['code'])
          ->accessCheck(FALSE)
          ->execute();

        if (!empty($existing)) {
          $programmeIdMap[$p['code']] = (int) reset($existing);
          continue;
        }

        $entity = TsLodgeProgramme::create([
          'category' => $p['category'] ?? '',
          'name'     => $p['name']     ?? '',
          'code'     => $p['code']     ?? '',
        ]);
        $entity->save();
        $programmeIdMap[$p['code']] = (int) $entity->id();
        $programsImported++;
      }
      catch (\Exception $e) {
        $errors++;
        \Drupal::logger('ts_lodge')->error('Migration programme error: @msg', ['@msg' => $e->getMessage()]);
      }
    }

    // --- Import usagers ---
    foreach ($data['users'] ?? [] as $u) {
      try {
        // Skip duplicates by name + birthdate.
        $existing = \Drupal::entityQuery('ts_lodge_usager')
          ->condition('last_name',  strtoupper($u['lastName'] ?? ''))
          ->condition('first_name', $u['firstName'] ?? '')
          ->condition('birth_date', $u['birthDate']  ?? '')
          ->accessCheck(FALSE)
          ->execute();

        if (!empty($existing)) {
          $userIdMap[$u['id']] = (int) reset($existing);
          continue;
        }

        $entity = TsLodgeUsager::create([
          'last_name'  => strtoupper($u['lastName']  ?? ''),
          'first_name' => $u['firstName'] ?? '',
          'gender'     => $u['gender']    ?? '',
          'is_couple'  => !empty($u['isCouple']),
          'birth_date' => $u['birthDate'] ?? '',
        ]);
        $entity->save();
        $userIdMap[$u['id']] = (int) $entity->id();
        $usersImported++;
      }
      catch (\Exception $e) {
        $errors++;
        \Drupal::logger('ts_lodge')->error('Migration usager error: @msg', ['@msg' => $e->getMessage()]);
      }
    }

    // --- Import bookings ---
    foreach ($data['bookings'] ?? [] as $b) {
      try {
        $drupalUsagerId = $userIdMap[$b['userId']] ?? NULL;
        if (!$drupalUsagerId) {
          $errors++;
          continue;
        }

        // Resolve programme: match by code stored in booking.
        $programmeId = $programmeIdMap[$b['programme']] ?? NULL;
        if (!$programmeId) {
          // Try to find by code directly.
          $found = \Drupal::entityQuery('ts_lodge_programme')
            ->condition('code', $b['programme'])
            ->accessCheck(FALSE)
            ->execute();
          $programmeId = !empty($found) ? (int) reset($found) : NULL;
        }

        if (!$programmeId) {
          $errors++;
          \Drupal::logger('ts_lodge')->warning(
            'Migration: programme "@code" introuvable pour la réservation userId=@uid.',
            ['@code' => $b['programme'], '@uid' => $b['userId']]
          );
          continue;
        }

        // Skip duplicate bookings (same usager + arrival).
        $existing = \Drupal::entityQuery('ts_lodge_booking')
          ->condition('usager_id',    $drupalUsagerId)
          ->condition('arrival_date', $b['arrivalDate'] ?? '')
          ->accessCheck(FALSE)
          ->execute();

        if (!empty($existing)) continue;

        $entity = TsLodgeBooking::create([
          'usager_id'      => $drupalUsagerId,
          'programme_id'   => $programmeId,
          'arrival_date'   => $b['arrivalDate']   ?? '',
          'departure_date' => $b['departureDate'] ?? '',
          'couch'          => $b['couch']          ?? '',
          'notes'          => $b['notes']          ?? '',
        ]);
        $entity->save();
        $bookingsImported++;
      }
      catch (\Exception $e) {
        $errors++;
        \Drupal::logger('ts_lodge')->error('Migration booking error: @msg', ['@msg' => $e->getMessage()]);
      }
    }

    $this->messenger()->addStatus($this->t(
      'Migration terminée : @u usager(s), @p programme(s), @b réservation(s) importé(s). Erreurs : @e.',
      ['@u' => $usersImported, '@p' => $programsImported, '@b' => $bookingsImported, '@e' => $errors]
    ));

    $form_state->setRedirect('ts_lodge.dashboard');
  }

}
