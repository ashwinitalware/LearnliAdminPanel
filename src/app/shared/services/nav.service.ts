import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

//Menu Bar
export interface Menu {
  headTitle?: string,
  path?: string;
  title?: string;
  icon?: string;
  subIcon?: string;
  type?: string;
  badgeType?: string;
  badgeValue?: string;
  badgeClass?: string;
  active?: boolean;
  bookmark?: boolean;
  children?: Menu[];
  Menusub?: boolean;
  selected?: boolean;
  dirchange?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class NavService implements OnDestroy {
  private unsubscriber: Subject<any> = new Subject();
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

  public megaMenu: boolean = false;
  public megaMenuCollapse: boolean = window.innerWidth < 1199 ? true : false;
  public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;
  public fullScreen: boolean = false;
  constructor(private router: Router) {
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize').pipe(
      debounceTime(1000),
      takeUntil(this.unsubscriber)
    ).subscribe((evt: any) => {
      this.setScreenWidth(evt.target.innerWidth);
      if (evt.target.innerWidth < 991) {
        this.collapseSidebar = false;
        this.megaMenu = false;
      }
      if (evt.target.innerWidth < 1199) {
        this.megaMenuCollapse = true;
      }
    });
    if (window.innerWidth < 991) {
      this.router.events.subscribe(event => {
        this.collapseSidebar = false;
        this.megaMenu = false;
      });
    }
  }
  ngOnDestroy() {
    this.unsubscriber.next(null);
    this.unsubscriber.complete();
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }

  MENUITEMS: Menu[] = [
    //Title
    { headTitle: 'MAIN' },
    {
      title: 'Dashboards',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M133.66,34.34a8,8,0,0,0-11.32,0L40,116.69V216h64V152h48v64h64V116.69Z" opacity="0.2"></path><line x1="16" y1="216" x2="240" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="152 216 152 152 104 152 104 216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><line x1="40" y1="116.69" x2="40" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><line x1="216" y1="216" x2="216" y2="116.69" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><path d="M24,132.69l98.34-98.35a8,8,0,0,1,11.32,0L232,132.69" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path></svg>`,
      dirchange: false,
      type: 'link',
      active: true,
      selected: true,
      path: '/dashboards/dashboard'
    },


    {
      title: 'Masters',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="8" r="4"
stroke="currentColor"
stroke-width="2"
fill="currentColor"
fill-opacity="0.15"/>
<path d="M4 20C4 16.134 7.58172 13 12 13C16.4183 13 20 16.134 20 20"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"/>
</svg>`,
      type: 'sub',
      active: false,
      children: [
        {
          title: 'Add Category',
          path: '/masters/add-category',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Add Subcategory',
          path: '/masters/add-subcategory',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Add Slider',
          path: '/masters/add-slider',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Add Sponsor Banner',
          path: '/masters/add-sponsor-banner',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },

        {
          title: 'Add State',
          path: '/masters/add-state',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Add City',
          path: '/masters/add-city',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },


        {
          title: 'Add Language',
          path: '/masters/add-language',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Home Page Sections',
          path: '/masters/home-sections',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Notification',
          path: '/masters/notification',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Referral Points',
          path: '/masters/referral-points',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        }
      ]
    },
    {
      title: 'Add Subject',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-subject'
    },
    {
      title: 'Add Mentor',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128,128a48,48,0,1,0-48-48A48,48,0,0,0,128,128Zm0,16c-53,0-96,35.8-96,80v8h192v-8C224,179.8,181,144,128,144Z" opacity="0.2"></path><circle cx="128" cy="80" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></circle><path d="M32,232c0-44.2,43-80,96-80s96,35.8,96,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-mentor'
    },
    {
      title: 'Mentor Bookings',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/mentor-bookings'
    },
    {
      title: 'Live Classes',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="6" r="2" fill="#e6533c"/></svg>`,
      type: 'sub',
      active: false,
      children: [
        {
          title: 'Dashboard',
          path: '/live-classes/dashboard',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'All Live Classes',
          path: '/live-classes/list',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        },
        {
          title: 'Create Live Class',
          path: '/live-classes/create',
          type: 'link',
          active: false,
          selected: false,
          dirchange: false,
        }
      ]
    },
    {
      title: 'Add Short Video Concepts',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
<path d="M10 8.5v7l5-3.5-5-3.5z" fill="currentColor"/>
<path d="M7 4v16M17 4v16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="1 3"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-short-video'
    },
    {
      title: 'Add Course',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M12 14v7M7.05 16.5L12 19.25l4.95-2.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-course'
    },
    {
      title: 'Active Carts',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/course/cart'
    },
    {
      title: 'Order History',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/course/orders'
    },
    {
      title: 'Sales Report',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-10v10a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2h-2a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/course/order-items'
    },
    {
      title: 'Wallet',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M21 7H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/course/wallet'
    },
    {
      title: 'Coupons & Offers',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none"><path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9h.01M15 15h.01M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/coupons'
    },
    {
      title: 'Add PDF',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/pdf-content'
    },
    {
      title: 'Add Audio',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/>
<circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-audio'
    },
    {
      title: 'Add Quiz',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/masters/add-quiz'
    },

    {
      title: 'Enrollments',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 24 24" fill="none">
<circle cx="9" cy="8" r="3"
stroke="currentColor"
stroke-width="2"/>
<path d="M4 19C4 16.8 6.2 15 9 15C11.8 15 14 16.8 14 19"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"/>
<path d="M19 8V14"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"/>
<path d="M16 11H22"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"/>
</svg>`,
      type: 'link',
      active: false,
      path: '/enrollments'
    },



    {
      title: 'Manage Students',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 256 256"><path d="M128 128a40 40 0 1 0-40-40 40 40 0 0 0 40 40Zm0 16c-44.18 0-80 26.86-80 60v4h160v-4c0-33.14-35.82-60-80-60Z" fill="none" stroke="currentColor" stroke-width="16"/></svg>`,
      type: 'link',     // <-- YE ADD KARO
      active: false,
      selected: false,
      dirchange: false,
      path: '/manage-students'
    },


    {
      title: 'Student Subscription',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 256 256">
  <circle cx="108" cy="100" r="40"
    fill="none"
    stroke="currentColor"
    stroke-width="16"/>
  <path d="M48 200c0-33.1 26.9-60 60-60s60 26.9 60 60"
    fill="none"
    stroke="currentColor"
    stroke-width="16"
    stroke-linecap="round"/>
  <path d="M208 88v48"
    fill="none"
    stroke="currentColor"
    stroke-width="16"
    stroke-linecap="round"/>
  <path d="M184 112h48"
    fill="none"
    stroke="currentColor"
    stroke-width="16"
    stroke-linecap="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/student-subscription'
    },

    {
      title: 'Instructor Subscription',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="side-menu__icon" viewBox="0 0 256 256">
  <path d="M128 40L24 96l104 56 104-56-104-56Z"
    fill="none"
    stroke="currentColor"
    stroke-width="16"
    stroke-linejoin="round"/>
  <path d="M72 124v44c0 22 25 40 56 40s56-18 56-40v-44"
    fill="none"
    stroke="currentColor"
    stroke-width="16"
    stroke-linecap="round"/>
</svg>`,
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
      path: '/instructor-subscription'
    },




  ];

  public items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
