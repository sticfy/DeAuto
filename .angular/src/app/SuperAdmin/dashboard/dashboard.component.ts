import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalenderComponent } from '../../Service/calender/calender.component';
import { ChartComponent } from '../../Service/chart/chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,CalenderComponent,ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  data:any=[23,45,21,12,76,44,56,89,3,67,32]
  label:any=['Nov 20','Nov 21','Nov 22','Nov 01','Nov 24','Nov 25','Nov 26','Nov 27','Nov 28','Nov 29','Nov 30']
}
