import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const mastersRoutes: Routes = [
  {
    path: 'masters',
    children: [
      {
        path: 'add-category',
        loadComponent: () =>
          import('./add-category/add-category')
            .then(m => m.AddCategory)
      },
      {
        path: 'add-subcategory',
        loadComponent: () =>
          import('./add-subcategory/add-subcategory')
            .then(m => m.AddSubcategory)
      },
      {
        path: 'add-slider',
        loadComponent: () =>
          import('./add-slider/add-slider')
            .then(m => m.AddSlider)
      },
      {
        path: 'add-sponsor-banner',
        loadComponent: () =>
          import('./add-sponsor-banner/add-sponsor-banner')
            .then(m => m.AddSponsorBanner)
      },
      {
        path: 'add-city',
        loadComponent: () =>
          import('./add-city/add-city')
            .then(m => m.AddCity)
      },
      {
        path: 'add-state',
        loadComponent: () =>
          import('./add-state/add-state')
            .then(m => m.AddState)
      },
      {
        path: 'pdf-content',
        loadComponent: () =>
          import('./pdf-content/pdf-content')
            .then(m => m.PdfContent)
      },
      {
        path: 'notification',
        loadComponent: () =>
          import('./notification/notification')
            .then(m => m.Notification)
      },
      {
        path: 'add-audio',
        loadComponent: () =>
          import('./add-audio/add-audio')
            .then(m => m.AddAudio)
      },
      {
        path: 'add-quiz',
        loadComponent: () =>
          import('./add-quiz/add-quiz')
            .then(m => m.AddQuiz)
      },
      {
        path: 'add-subject',
        loadComponent: () =>
          import('./add-subject/add-subject')
            .then(m => m.AddSubject)
      },
      {
        path: 'add-mentor',
        loadComponent: () =>
          import('./add-mentor/add-mentor')
            .then(m => m.AddMentor)
      },
      {
        path: 'mentor-bookings',
        loadComponent: () =>
          import('./mentor-bookings/mentor-bookings')
            .then(m => m.MentorBookings)
      },
      {
        path: 'add-short-video',
        loadComponent: () =>
          import('./add-short-video/add-short-video')
            .then(m => m.AddShortVideo)
      },
      {
        path: 'add-short-video-concepts',
        loadComponent: () =>
          import('./add-short-video/add-short-video')
            .then(m => m.AddShortVideo)
      },
      {
        path: 'add-course',
        loadComponent: () =>
          import('./add-course/add-course')
            .then(m => m.AddCourse)
      },
      {
        path: 'add-language',
        loadComponent: () =>
          import('./add-language/add-language')
            .then(m => m.AddLanguage)
      },
      {
        path: 'home-sections',
        loadComponent: () =>
          import('./home-section/home-section')
            .then(m => m.HomeSection)
      },
      {
        path: 'add-home-section',
        loadComponent: () =>
          import('./home-section/home-section')
            .then(m => m.HomeSection)
      },
      {
        path: 'referral-points',
        loadComponent: () =>
          import('./referral-points/referral-points')
            .then(m => m.ReferralPoints)
      },
      {
        path: 'add-referral-points',
        loadComponent: () =>
          import('./referral-points/referral-points')
            .then(m => m.ReferralPoints)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(mastersRoutes)],
  exports: [RouterModule]
})
export class MastersRoutingModule {
  static routes = mastersRoutes;
}