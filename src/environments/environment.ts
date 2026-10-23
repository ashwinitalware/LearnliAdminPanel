// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  // apiUrl: 'https://api.learnli.online/api/v1',
  // baseUrl: 'https://api.learnli.online',

  apiUrl: 'http://localhost:3000/api/v1',
  baseUrl: 'http://localhost:3000',

  firebase: {
    apiKey: '********************************',
    authDomain: '********************************',
    projectId: '********************************',
    storageBucket: '********************************',
    messagingSenderId: '********************************',
    appId: '********************************',
    measurementId: '********************************',
  },
};
