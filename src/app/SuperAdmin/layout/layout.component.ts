import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata } from '@angular/core';
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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class LayoutComponent {
  data=[
    {
      link:'dashboard',
      name:'Dashboard'
    },
    {
      link:'company',
      name:'Company list'
    },
    {
      link:'shop',
      name:'New Companies'
    },
    {
      link:'/custom/dashboard',
      name:'Inactive Companies'
    },
    {
      link:'categories',
      name:'Categories'
    },
    {
      link:'promotion',
      name:'Promotional cover'
    },
    {
      link:'/new',
      name:'Manage subscription'
    },
    {
      link:'/new',
      name:'Manage FAQ’s'
    },
  ]
}
