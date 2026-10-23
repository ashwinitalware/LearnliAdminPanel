import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const enrollmentsRoutes: Routes = [
  {
    path: 'enrollments',
    loadComponent: () =>
      import('./enrollments').then((m) => m.Enrollments),
  },
];

@NgModule({
  imports: [RouterModule.forChild(enrollmentsRoutes)],
  exports: [RouterModule],
})
export class EnrollmentsRoutingModule {
  static routes = enrollmentsRoutes;
}