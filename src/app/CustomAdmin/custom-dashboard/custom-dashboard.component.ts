import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../Service/chart/chart.component';
import { CalenderComponent } from '../../Service/calender/calender.component';
@Component({
  selector: 'app-custom-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,CalenderComponent,ChartComponent],
  templateUrl: './custom-dashboard.component.html',
  styleUrl: './custom-dashboard.component.css'
})
export class CustomDashboardComponent {
  data:any=[12,23,45,12,31,66,22,12,16,67,32]
  label:any=['Nov 20','Nov 21','Nov 22','Nov 01','Nov 24','Nov 25','Nov 26','Nov 27','Nov 28','Nov 29','Nov 30']
}
