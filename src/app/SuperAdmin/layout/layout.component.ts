import { Component} from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent,RouterOutlet,ReactiveFormsModule,CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  // data:any=[
  //   {
  //     link:'dashboard',
  //     name:'Dashboard'
  //   },
  //   {
  //     link:'company',
  //     name:'Company list'
  //   },
  //   {
  //     link:'shops',
  //     name:'New Companies'
  //   },
  //   {
  //     link:'new',
  //     name:'Inactive Companies'
  //   },
  //   {
  //     link:'categories',
  //     name:'Categories'
  //   },
  //   {
  //     link:'promotion',
  //     name:'Promotional cover'
  //   },
  //   {
  //     link:'subscription',
  //     name:'Manage subscription'
  //   },
  //   {
  //     link:'faqs',
  //     name:'Manage FAQ’s'
  //   },
  //   {
  //     link:'services',
  //     name:'Services'
  //   },
  //   {
  //     link:'service-request',
  //     name:'Service request'
  //   },
  //   {
  //     link:'user',
  //     name:'User'
  //   },
  // ]
}
