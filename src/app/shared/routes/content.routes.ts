import { Routes } from '@angular/router';

export const Full_Content_Routes: Routes  = [
    { 
        path: '',
        loadChildren: () => import('../../components/dashboards/dashboards.routes').then(r => r.dashboardRoutingModule)
    },
    {
        path: '',
        loadChildren: () => import('../../modules/Course/course.routes').then(r => r.CourseRoutingModule)  
    },
    {
        path: '',
        loadChildren: () => import('../../modules/enrollments/enrollments.routes').then(r => r.EnrollmentsRoutingModule)
    },
    {
        path: '',
        loadChildren: () => import('../../modules/manage-students/manage-students.routes').then(r => r.ManageStudentsRoutingModule)
    },

{
  path: 'student-subscription',
  loadChildren: () =>
    import('../../modules/student-subscription/student-subscription-routing-module')
      .then(m => m.StudentSubscriptionRoutingModule)
},

{
  path: 'instructor-subscription',
  loadChildren: () =>
    import('../../modules/instructor-subscription/instructor-subscription-routing-module')
      .then(m => m.InstructorSubscriptionRoutingModule)
},
   {
    path: '',
    loadChildren: () =>
      import('../../modules/manage-instructors/manage-instructors.routes')
        .then(r => r.ManageInstructorsRoutingModule)
    },
     {
    path: '',
    loadChildren: () =>
      import('../../modules/masters/masters.routes')
        .then(r => r.MastersRoutingModule)
    },
    {
      path: '',
      loadChildren: () =>
        import('../../modules/coupons/coupons.routes')
          .then(r => r.CouponsRoutingModule)
    },
    {
      path: '',
      loadChildren: () =>
        import('../../modules/live-classes/live-classes.routes')
          .then(r => r.LiveClassesRoutingModule)
    }
];