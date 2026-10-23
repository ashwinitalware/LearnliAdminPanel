import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentSubscription } from './student-subscription/student-subscription';

const routes: Routes = [
  {
    path: '',
    component: StudentSubscription
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentSubscriptionRoutingModule {}