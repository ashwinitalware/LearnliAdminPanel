import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstructorSubscription } from './instructor-subscription/instructor-subscription';

const routes: Routes = [
  {
    path: '',
    component: InstructorSubscription
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstructorSubscriptionRoutingModule {}