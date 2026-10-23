import { Component } from '@angular/core';
import { NgbDropdownModule, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { SharedModule } from '../../../shared/shared.module';
import { SpkApexChart } from '../../../@spk/spk-reusable-plugins/reusable-charts/spk-apex-charts/spk-apex-charts';
import { SpkMedicalCard } from '../../../@spk/reusable-dashboards/spk-medical-card/spk-medical-card';
import { SpkReusableTables } from '../../../@spk/spk-reusable-tables/spk-reusable-tables';
import { SpkDropdowns } from '../../../@spk/reusable-ui-elements/spk-dropdowns/spk-dropdowns';


//Available Treatments
interface Department {
  iconClass: string;
  btnClass: string;
  label: string;
}
// Today's Appointments
interface Appointment {
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  department: string;
  time: string;
  imageUrl: string;
  badgeClass: string;
}
//Available Doctors
interface DoctorSchedule {
  name: string;
  department: string;
  departmentClass: string;
  time: string;
}
//Patients Reports
interface TestRecord {
  name: string;
  testType: string;
  iconClass: string;
  bgClass: string;
  statusIcon: string;
  statusText: string;
  statusColor: string;
  date: string;
};
//Top Dcotors
interface Doctor {
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  image: string;
};
//
interface GenderStats {
  label: string;
  iconClass: string;
  avatarBgClass: string;
  trendIconClass: string;
  trendText: string;
  trendColorClass: string;
  percentage: string;
  trendLabel: string;
};
//Patient Records
interface Appointments {
  id: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  doctorName: string;
  doctorImage: string;
  status: string;
  statusBadgeClass: string;
  date: string;
  time: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, OverlayscrollbarsModule, NgbDropdownModule, NgbTooltipModule, NgbModule, CommonModule, FormsModule, SpkApexChart, SpkMedicalCard, SpkReusableTables, SpkDropdowns],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {


  //row 1 dashboard cards
  MedicalOptions: any =
    {
      series: [
        {
          name: "Total Students",
          data: [44, 42, 57, 86, 58, 55, 70, 43, 23, 54, 77, 34],
        },
        {
          name: "Total Courses",
          data: [74, 72, 87, 116, 88, 85, 100, 73, 53, 84, 107, 64],
        },
        {
          name: "Total Earnings",
          data: [84, 82, 97, 126, 98, 95, 110, 83, 63, 94, 117, 74],
        }
      ],
      chart: {
        stacked: true,
        type: "bar",
        height: 260,
      },
      grid: {
        borderColor: "#f5f4f4",
        strokeDashArray: 5,
        yaxis: {
          lines: {
            show: true, // Ensure y-axis grids are shown
          },
        },
      },
      colors: [
        "var(--primary-color)",
        "var(--primary06)",
        "var(--primary03)",
      ],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 4
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: "bottom",

        horizontalAlign: "center",
        fontSize: "11px",
        fontFamily: "Helvetica, Arial",
        fontWeight: 600,
        offsetX: 0,
        offsetY: 10,
        labels: {
          colors: '#74767c',
        },
        markers: {
          size: 4,
          strokeWidth: 0,
          strokeColor: "#fff",
          fillColors: undefined,
          radius: 12,
          customHTML: undefined,
          onClick: undefined,
          offsetX: 0,
          offsetY: 0,
        },
      },
      yaxis: {
        title: {
          style: {
            color: "#adb5be",
            fontSize: "14px",
            fontWeight: 600,
            cssClass: "apexcharts-yaxis-label",
          },
        },
        axisBorder: {
          show: true,
          color: "rgba(119, 119, 142, 0.05)",
          offsetX: 0,
          offsetY: 0,
        },
        axisTicks: {
          show: true,
          borderType: "solid",
          color: "rgba(119, 119, 142, 0.05)",
          width: 6,
          offsetX: 0,
          offsetY: 0,
        },
        labels: {
          formatter: function (y: any) {
            return y.toFixed(0) + "k";
          },
        },
      },
      xaxis: {
        type: "month",
        categories: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        axisBorder: {
          show: false,
          color: "rgba(119, 119, 142, 0.05)",
          offsetX: 0,
          offsetY: 0,
        },
        axisTicks: {
          show: false,
          borderType: "solid",
          color: "rgba(119, 119, 142, 0.05)",
          width: 6,
          offsetX: 0,
          offsetY: 0,
        },
        labels: {
          rotate: -90,
        },
      },
    }

  MedicalCardsnew = [
    {
      cardClass: "dashboard-main-card medical-main-card",
      bodyClass: "",
      title: "Total Instructor",
      value: "9",
      svgColor: "primary",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><g><rect fill="none" height="24" width="24"></rect></g><g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"></path></g></svg>'
    },

    {
      cardClass: "dashboard-main-card medical-main-card",
      bodyClass: "",
      title: "Total Students",
      value: "429",
      svgColor: "primary",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><g><rect fill="none" height="24" width="24"></rect></g><g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"></path></g></svg>'
    },
  ];
  MedicalCards = [
    {
      cardClass: "dashboard-main-card medical-main-card primary",
      bodyClass: "",
      title: "Enrolments",
      value: "419",
      month: "Since Last Month",
      percent: "313+",
      percentColor: "success",
      svgColor: "primary",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><g><rect fill="none" height="24" width="24"></rect></g><g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"></path></g></svg>'
    },
    {
      cardClass: "dashboard-main-card medical-main-card secondary",
      bodyClass: "",
      title: "Total Earning",
      value: "2,49",
      month: "Since Last Month",
      percent: "249.1k",
      percentColor: "success",
      svgColor: "secondary",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><rect fill="none" height="24" width="24"></rect><g><path d="M17,1H7C5.9,1,5,1.9,5,3v18c0,1.1,0.9,2,2,2h10c1.1,0,2-0.9,2-2V3C19,1.9,18.1,1,17,1z M7,18V6h10v12H7z M16,11V9.14 C16,8.51,15.55,8,15,8H9C8.45,8,8,8.51,8,9.14l0,1.96c0.55,0,1,0.45,1,1c0,0.55-0.45,1-1,1l0,1.76C8,15.49,8.45,16,9,16h6 c0.55,0,1-0.51,1-1.14V13c-0.55,0-1-0.45-1-1C15,11.45,15.45,11,16,11z M12.5,14.5h-1v-1h1V14.5z M12.5,12.5h-1v-1h1V12.5z M12.5,10.5h-1v-1h1V10.5z"></path></g></svg>'
    },
    {
      cardClass: "dashboard-main-card medical-main-card warning",
      bodyClass: "",
      title: "Organizations",
      value: "6",
      month: "Since Last Month",
      percent: "6",
      percentColor: "danger",
      svgColor: "warning",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><rect fill="none" height="24" width="24"></rect><g><path d="M8,6c0-2.21,1.79-4,4-4s4,1.79,4,4c0,2.21-1.79,4-4,4S8,8.21,8,6z M17,22h1c1.1,0,2-0.9,2-2l0-4.78 c0-1.12-0.61-2.15-1.61-2.66c-0.43-0.22-0.9-0.43-1.39-0.62L17,22z M12.34,17L15,11.33C14.07,11.12,13.07,11,12,11 c-2.53,0-4.71,0.7-6.39,1.56C4.61,13.07,4,14.1,4,15.22L4,22h2.34C6.12,21.55,6,21.04,6,20.5C6,18.57,7.57,17,9.5,17H12.34z M10,22 l1.41-3H9.5C8.67,19,8,19.67,8,20.5S8.67,22,9.5,22H10z"></path></g></svg>',
    },
    {
      cardClass: "dashboard-main-card medical-main-card success",
      bodyClass: "",
      title: "Total Courses",
      value: "71",
      month: "Total Rooms",
      percent: "71",
      percentColor: "success",
      svgColor: "success",
      svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368"><g><path d="M0,0h24v24H0V0z" fill="none"></path></g><g><g><path d="M16.5,12h-9c-0.55,0-1,0.45-1,1v1h11v-1C17.5,12.45,17.05,12,16.5,12z"></path><rect height="2" width="4" x="7.25" y="8.5"></rect><rect height="2" width="4" x="12.75" y="8.5"></rect><path d="M20,2H4C2.9,2,2,2.9,2,4v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M19,17h-1.5v-1.5h-11V17H5v-3.83 c0-0.66,0.25-1.26,0.65-1.72V9c0-1.1,0.9-2,2-2H11c0.37,0,0.72,0.12,1,0.32C12.28,7.12,12.63,7,13,7h3.35c1.1,0,2,0.9,2,2v2.45 c0.4,0.46,0.65,1.06,0.65,1.72V17z"></path></g></g></svg>',
    },
  ];

  //Left Side  Earning Report
  StudentOptions = {
  series: [
    {
      name: 'Total Student',
      type: 'bar',
      data: [100, 50, 400, 0, 450, 0, 0]
    },
    {
      name: 'Total Course',
      type: 'bar',
      data: [0, 0, 50, 0, 0, 0, 0]
    },
    {
      name: 'Total Earning',
      type: 'bar',
      data: [50, 0, 500, 8500, 7600, 10200, 5100]
    }
  ],

  chart: {
    height: 365,
    type: 'bar',
    stacked: false,
    toolbar: {
      show: false
    }
  },

  colors: [
    '#4F46E5',
    '#10B981',
    '#FF5B2E'
  ],

  plotOptions: {
    bar: {
      columnWidth: '20%',
      borderRadius: 2
    }
  },

  grid: {
    borderColor: 'rgba(119,119,142,0.1)',
    strokeDashArray: 4
  },

  legend: {
    show: true,
    position: 'right'
  },

  xaxis: {
    categories: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
  },

  yaxis: {
    min: 0,
    max: 12000,
    tickAmount: 6
  },

  dataLabels: {
    enabled: false
  }
};

 //left side Best Selling Courses

CampaignsHeader = [
  { header: 'Course Title' },
  { header: 'Price' },
  { header: 'Enroll' }
];

influencers = [
  {
    avatarUrl: './assets/images/media/media-1.jpg',
    name: 'Machine Learning A-Z™: AI, Python & R',
    role: '',
    price: '$50',
    enroll: '34'
  },
  {
    avatarUrl: './assets/images/media/media-2.jpg',
    name: 'Build Native Cross-platform Apps with C#',
    role: '',
    price: '$99',
    enroll: '18'
  },
  {
    avatarUrl: './assets/images/media/media-3.jpg',
    name: 'Subaccount Labelling - RCP',
    role: '',
    price: '$0',
    enroll: '17'
  },
  {
    avatarUrl: './assets/images/media/media-4.jpg',
    name: 'Basic to Advance in Front-end with React.js',
    role: '',
    price: '$0',
    enroll: '10'
  }
];

//RIGHT SIDE Best Instructors


CampaignsHeadernew = [
  { header: 'Instructor Name' },
  { header: 'Rating' },
  { header: 'Course' },
  { header: 'Total Sell' }
];

influencersnew = [
  {
    avatarUrl: './assets/images/faces/1.jpg',
    name: 'Abdul Mannan Zinnat',
    role: 'SpaGreen Academy',
    rating: '0',
    course: '29',
    totalSell: '$8567.50'
  },
  {
    avatarUrl: './assets/images/faces/2.jpg',
    name: 'Amelia Margaret',
    role: 'SpaGreen Academy',
    rating: '0',
    course: '29',
    totalSell: '$8567.50'
  },
  {
    avatarUrl: './assets/images/faces/3.jpg',
    name: 'Emily Elizabeth',
    role: 'BrightSkill',
    rating: '0',
    course: '29',
    totalSell: '$8567.50'
  },
  {
    avatarUrl: './assets/images/faces/4.jpg',
    name: 'William Domain',
    role: '10Minute School',
    rating: '0',
    course: '29',
    totalSell: '$8567.50'
  },
 
];

//below row 3 cards

  manpowerInfo = [
    { label: 'Total Admin', value: '1' },
    { label: 'Total Staff', value: '1' },
    { label: 'Total Instructors', value: '2' },
    { label: 'Total Users', value: '120' }
  ];

  courseInfo = [
    { label: 'Total Course', value: '71' },
    { label: 'This Course is Free', value: '20' },
    { label: 'Paid Course', value: '51' },
    { label: 'Total Categories', value: '10' }
  ];

  salesInfo = [
    { label: 'Total Sale', value: '$249.1k' },
    { label: 'Total Sale Commission', value: '$49.8k' },
    { label: 'Total Payout', value: '$20k' },
    { label: 'Total Revenue', value: '$180k' }
  ];


}
