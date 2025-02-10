import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-navber',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './navber.component.html',
  styleUrl: './navber.component.css'
})
export class NavberComponent {
page=true
}
