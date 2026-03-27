<?php

namespace Drupal\ts_lodge\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

/**
 * Controller for all TS Lodge pages.
 */
class TsLodgeController extends ControllerBase {

  public function dashboard(): array {
    return [
      '#theme'    => 'ts_lodge_dashboard',
      '#attached' => ['library' => ['ts_lodge/dashboard']],
    ];
  }

  public function users(): array {
    return [
      '#theme'    => 'ts_lodge_users',
      '#attached' => [
        'library'       => ['ts_lodge/users'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function addUser(): array {
    return [
      '#theme'    => 'ts_lodge_add_user',
      '#attached' => [
        'library'       => ['ts_lodge/add_user'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function editUser(): array {
    return [
      '#theme'    => 'ts_lodge_edit_user',
      '#attached' => [
        'library'       => ['ts_lodge/edit_user'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function bookUser(): array {
    return [
      '#theme'    => 'ts_lodge_book_user',
      '#attached' => [
        'library'       => ['ts_lodge/book_user'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function findCouch(): array {
    return [
      '#theme'    => 'ts_lodge_find_couch',
      '#attached' => [
        'library'       => ['ts_lodge/find_couch'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function couches(): array {
    return [
      '#theme'    => 'ts_lodge_couches',
      '#attached' => [
        'library'       => ['ts_lodge/couches'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  public function programs(): array {
    return [
      '#theme'    => 'ts_lodge_programs',
      '#attached' => [
        'library'       => ['ts_lodge/programs'],
        'drupalSettings' => ['tsLodge' => $this->getSettings()],
      ],
    ];
  }

  // ---------------------------------------------------------------

  private function getSettings(): array {
    return [
      'routes' => $this->getRoutes(),
      'api'    => $this->getApiUrls(),
      
    ];
  }

  private function getRoutes(): array {
    $map = [
      'dashboard' => 'ts_lodge.dashboard',
      'users'     => 'ts_lodge.users',
      'addUser'   => 'ts_lodge.add_user',
      'editUser'  => 'ts_lodge.edit_user',
      'bookUser'  => 'ts_lodge.book_user',
      'findCouch' => 'ts_lodge.find_couch',
      'couches'   => 'ts_lodge.couches',
      'programs'  => 'ts_lodge.programs',
    ];
    $routes = [];
    foreach ($map as $key => $name) {
      $routes[$key] = Url::fromRoute($name)->toString();
    }
    return $routes;
  }

  private function getApiUrls(): array {
    return [
      'usagers'    => base_path() . 'api/ts-lodge/usagers',
      'bookings'   => base_path() . 'api/ts-lodge/bookings',
      'programmes' => base_path() . 'api/ts-lodge/programmes',
    ];
  }

}
