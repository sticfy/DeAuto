import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomSidebarComponent } from '../custom-sidebar/custom-sidebar.component';
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CustomSidebarComponent,RouterOutlet,ReactiveFormsModule,CommonModule],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {

}
