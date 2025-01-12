import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomSidebarComponent } from '../custom-sidebar/custom-sidebar.component';

@Component({
  selector: 'app-custom-layout',
  standalone: true,
  imports: [CustomSidebarComponent,RouterOutlet,ReactiveFormsModule,CommonModule],
  templateUrl: './custom-layout.component.html',
  styleUrl: './custom-layout.component.css'
})
export class CustomLayoutComponent {

}
