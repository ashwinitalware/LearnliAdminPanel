import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const courseRoutes: Routes = [
  {
    path: 'course',
    children: [
      {
        path: 'course-list',
        loadComponent: () => import('./course-list/course-list').then((m) => m.CourseList),
      },

      {
        path: 'category',
        loadComponent: () =>
          import('./category/category').then((m) => m.Category),
      },

      {
        path: 'subject',
        loadComponent: () =>
          import('./subject/subject')
            .then((m) => m.Subject),
      },

      {
        path: 'levels',
        loadComponent: () =>
          import('./levels/levels')
            .then((m) => m.Levels),
      },

      {
        path: 'certificates',
        loadComponent: () =>
          import('./certificates/certificates')
            .then((m) => m.Certificates),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./community/community')
            .then((m) => m.Community),
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./wallet/wallet')
            .then((m) => m.Wallet),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./cart/cart')
            .then((m) => m.CartComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders')
            .then((m) => m.OrdersComponent),
      },
      {
        path: 'order-items',
        loadComponent: () =>
          import('./order-items/order-items')
            .then((m) => m.OrderItemsComponent),
      },
    ],
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./wallet/wallet')
        .then((m) => m.Wallet),
  },
  {
    path: 'admin/wallet',
    loadComponent: () =>
      import('./wallet/wallet')
        .then((m) => m.Wallet),
  },
];


@NgModule({
  imports: [RouterModule.forChild(courseRoutes)],
  exports: [RouterModule],
})
export class CourseRoutingModule {
  static routes = courseRoutes;
}