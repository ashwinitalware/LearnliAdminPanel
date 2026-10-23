import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponsComponent } from './coupons';

export const couponsRoutes: Routes = [
  {
    path: 'coupons',
    component: CouponsComponent
  },
  {
    path: 'coupons-and-offers',
    component: CouponsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(couponsRoutes)],
  exports: [RouterModule],
})
export class CouponsRoutingModule {
  static routes = couponsRoutes;
}
