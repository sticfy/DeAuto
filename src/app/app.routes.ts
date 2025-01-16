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
import { CustomBillComponent } from './CustomAdmin/custom-bill/custom-bill.component';
import { ProfileSettingComponent } from './CustomAdmin/profile-setting/profile-setting.component';
import { ProfileLayoutComponent } from './CustomAdmin/profile-layout/profile-layout.component';
import { ProfileEditComponent } from './CustomAdmin/profile-edit/profile-edit.component';
import { CompanyListComponent } from './SuperAdmin/company-list/company-list.component';

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
        { path:'company',
            component:CompanyListComponent
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
        { path:'billing',
            component:CustomBillComponent
        },
        { path:'profile',
            component:ProfileSettingComponent
        },
        ]
    },
    {
        path:'customer',
        component:ProfileLayoutComponent,
        children:[
            { path:'profile',
                component:ProfileSettingComponent
            },
            { path:'profile-update',
                component:ProfileEditComponent
            },
        ]
    }
    
];
