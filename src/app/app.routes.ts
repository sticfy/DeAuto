import { Routes } from '@angular/router';
import { LoginComponent } from './SuperAdmin/login/login.component';
import { DashboardComponent } from './SuperAdmin/dashboard/dashboard.component';
import { LayoutComponent } from './SuperAdmin/layout/layout.component';
import { CustomDashboardComponent } from './CustomAdmin/custom-dashboard/custom-dashboard.component';
import { CustomLayoutComponent } from './CustomAdmin/custom-layout/custom-layout.component';
import { BookingComponent } from './CustomAdmin/booking/booking.component';
import { BookingDetailsComponent } from './Service/booking-details/booking-details.component';
import { CustomServiceComponent } from './CustomAdmin/custom-service/custom-service.component';
import { CustomSettingComponent } from './CustomAdmin/custom-setting/custom-setting.component';

export const routes: Routes = [
    {
        path:'' , redirectTo: 'login' , pathMatch:'full'
    },
    { path:'login',
        component:LoginComponent
    },
    {
    path:'admin',
    component:LayoutComponent,
    children:[
        { path:'dashboard',
        component:DashboardComponent
        },
        ]
    },
    {
    path:'custom',
    component:CustomLayoutComponent,
    children:[
        { path:'dashboard',
        component:CustomDashboardComponent
        },
        { path:'booking',
            component:BookingComponent
        },
        { path:'service',
            component:CustomServiceComponent
        },
        { path:'booking-details',
            component:BookingDetailsComponent
        },
        { path:'setting',
            component:CustomSettingComponent
        },
        ]
    }
];
