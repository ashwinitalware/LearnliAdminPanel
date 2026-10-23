import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageStudents } from './manage-students';

export const manageStudentsRoutes: Routes = [
  {
    path: 'manage-students',
    component: ManageStudents
  },
];

@NgModule({
  imports: [RouterModule.forChild(manageStudentsRoutes)],
  exports: [RouterModule],
})
export class ManageStudentsRoutingModule {
  static routes = manageStudentsRoutes;
}
