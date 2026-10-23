import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveClassDashboardComponent } from './dashboard/live-class-dashboard.component';
import { LiveClassListComponent } from './list/live-class-list.component';
import { LiveClassFormComponent } from './form/live-class-form.component';
import { LiveClassDetailsComponent } from './details/live-class-details.component';

export const liveClassesRoutes: Routes = [
  {
    path: 'live-classes',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: LiveClassDashboardComponent
      },
      {
        path: 'list',
        component: LiveClassListComponent
      },
      {
        path: 'create',
        component: LiveClassFormComponent
      },
      {
        path: 'edit/:id',
        component: LiveClassFormComponent
      },
      {
        path: 'details/:id',
        component: LiveClassDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(liveClassesRoutes)],
  exports: [RouterModule],
})
export class LiveClassesRoutingModule {
  static routes = liveClassesRoutes;
}
