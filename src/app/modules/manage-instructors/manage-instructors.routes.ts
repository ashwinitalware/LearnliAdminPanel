import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const manageInstructorsRoutes: Routes = [
  {
    path: 'manage-instructors',
    children: [
      {
        path: 'instructor-list',
        loadComponent: () =>
          import('./instructor-list/instructor-list')
            .then(m => m.InstructorList),
      },
      {
        path: 'expertises',
        loadComponent: () =>
          import('./expertises/expertises')
            .then(m => m.Expertises),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(manageInstructorsRoutes)],
  exports: [RouterModule],
})
export class ManageInstructorsRoutingModule {
  static routes = manageInstructorsRoutes;
}