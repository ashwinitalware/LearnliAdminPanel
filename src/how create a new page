# Angular Module & Component Creation Guide

This guide explains how to add new pages (components) to your existing modules (like Reception) and how to create entirely new modules from scratch. 

Since your project uses Angular Standalone Components, we don't need `NgModule` declarations for every component. We rely on Lazy Loaded Routing.

---

## Scenario 1: Adding a New Page to an Existing Module (e.g., Reception)
*Example: You want to add an "Appointment List" page under the existing Reception module.*

### Step 1: Generate the Component
Run the following command in your terminal. This will create a new folder with your HTML, SCSS, and TS files.
```bash
ng generate component Modules/Reception/appointment-list --standalone
```

### Step 2: Update the Module's Routes
Open `src/app/Modules/Reception/reception.routes.ts` and add your new component to the `children` array:
```typescript
export const receptionRoutes: Routes = [
  {
    path: 'reception',
    children: [
      {
        path: 'patient-registration',
        loadComponent: () => import('./patient-registration/patient-registration').then((m) => m.PatientRegistrationComponent),
      },
      // ADD YOUR NEW ROUTE HERE:
      {
        path: 'appointment-list',
        loadComponent: () => import('./appointment-list/appointment-list.component').then((m) => m.AppointmentListComponent),
      }
    ],
  },
];
```

### Step 3: Add the Link to the Sidebar Menu
Open `src/app/shared/services/nav.service.ts`. Scroll down to the `MENUITEMS` array, find the "Reception" object, and add your new page to its `children` array:
```typescript
{
  title: 'Reception',
  // ... icon ...
  type: 'sub',
  active: false,
  children: [
    {
      title: 'Patient Registration',
      path: '/reception/patient-registration',
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
    },
    // ADD YOUR NEW MENU ITEM HERE:
    {
      title: 'Appointment List',
      path: '/reception/appointment-list', // Must match the route path you created
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
    }
  ]
}
```

---

## Scenario 2: Creating a Completely New Module (e.g., Pharmacy)
*Example: You want to create a new "Pharmacy" module and add an "Inventory" page inside it.*

### Step 1: Generate the Component
Run the following command to create the folder and the first component:
```bash
ng generate component Modules/Pharmacy/inventory --standalone
```

### Step 2: Create a Routing File for the New Module
Create a new file at `src/app/Modules/Pharmacy/pharmacy.routes.ts`. Add the following boilerplate code:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const pharmacyRoutes: Routes = [
  {
    path: 'pharmacy',
    children: [
      {
        path: 'inventory',
        loadComponent: () => import('./inventory/inventory.component').then((m) => m.InventoryComponent),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(pharmacyRoutes)],
  exports: [RouterModule],
})
export class PharmacyRoutingModule {
  static routes = pharmacyRoutes;
}
```

### Step 3: Register the New Module Globally
Open `src/app/shared/routes/content.routes.ts` and add your new module so Angular knows how to lazy-load it:
```typescript
export const Full_Content_Routes: Routes  = [
    // ... existing routes ...
    { 
        path: '',
        loadChildren: () => import('../../Modules/Reception/reception.routes').then(r => r.ReceptionRoutingModule)
    },
    // ADD YOUR NEW MODULE HERE:
    { 
        path: '',
        loadChildren: () => import('../../Modules/Pharmacy/pharmacy.routes').then(r => r.PharmacyRoutingModule)
    }
];
```

### Step 4: Add the New Module to the Sidebar Menu
Open `src/app/shared/services/nav.service.ts` and add a new Parent Object for your module inside the `MENUITEMS` array:
```typescript
// Insert this in the MENUITEMS array
{
  title: 'Pharmacy',
  icon: `<svg> ... your svg icon code ... </svg>`, // You can copy an existing SVG icon or use a new one
  type: 'sub',
  active: false,
  children: [
    {
      title: 'Inventory',
      path: '/pharmacy/inventory',
      type: 'link',
      active: false,
      selected: false,
      dirchange: false,
    }
  ]
},
```
