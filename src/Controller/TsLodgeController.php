<?php

namespace Drupal\ts_lodge\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

/**
 * Controller for all TS Lodge pages.
 */
class TsLodgeController extends ControllerBase {

  /**
   * Dashboard / home page.
   */
  public function dashboard(): array {
    return [
      '#theme' => 'ts_lodge_dashboard',
      '#attached' => [
        'library' => ['ts_lodge/dashboard'],
      ],
    ];
  }

  /**
   * Users list page.
   */
  public function users(): array {
    return [
      '#theme' => 'ts_lodge_users',
      '#attached' => [
        'library' => ['ts_lodge/users'],
        'drupalSettings' => [
          'tsLodge' => [
            'basePath' => base_path() . \Drupal::service('extension.list.module')->getPath('ts_lodge'),
            'routes' => $this->getRoutes(),
          ],
        ],
      ],
    ];
  }

  /**
   * Add user page.
   */
  public function addUser(): array {
    return [
      '#theme' => 'ts_lodge_add_user',
      '#attached' => [
        'library' => ['ts_lodge/add_user'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Edit user page.
   */
  public function editUser(): array {
    return [
      '#theme' => 'ts_lodge_edit_user',
      '#attached' => [
        'library' => ['ts_lodge/edit_user'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Book user page.
   */
  public function bookUser(): array {
    return [
      '#theme' => 'ts_lodge_book_user',
      '#attached' => [
        'library' => ['ts_lodge/book_user'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Find couch page.
   */
  public function findCouch(): array {
    return [
      '#theme' => 'ts_lodge_find_couch',
      '#attached' => [
        'library' => ['ts_lodge/find_couch'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Couches occupation page.
   */
  public function couches(): array {
    return [
      '#theme' => 'ts_lodge_couches',
      '#attached' => [
        'library' => ['ts_lodge/couches'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Programs management page.
   */
  public function programs(): array {
    return [
      '#theme' => 'ts_lodge_programs',
      '#attached' => [
        'library' => ['ts_lodge/programs'],
        'drupalSettings' => [
          'tsLodge' => ['routes' => $this->getRoutes()],
        ],
      ],
    ];
  }

  /**
   * Helper: build a route URL map for JS navigation.
   */
  private function getRoutes(): array {
    $routeNames = [
      'dashboard'  => 'ts_lodge.dashboard',
      'users'      => 'ts_lodge.users',
      'addUser'    => 'ts_lodge.add_user',
      'editUser'   => 'ts_lodge.edit_user',
      'bookUser'   => 'ts_lodge.book_user',
      'findCouch'  => 'ts_lodge.find_couch',
      'couches'    => 'ts_lodge.couches',
      'programs'   => 'ts_lodge.programs',
    ];

    $routes = [];
    foreach ($routeNames as $key => $routeName) {
      $routes[$key] = Url::fromRoute($routeName)->toString();
    }
    return $routes;
  }

}
