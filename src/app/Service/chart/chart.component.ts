import { Component, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title,CategoryScale} from 'chart.js'
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent {
  @Input() data:any
  @Input() label:any;

  canvas :any;
  ctx : any;
  labels:any;
  chartBy:any
  @ViewChild('mychart') mychart:any;
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    Chart.register(LineController, LineElement, PointElement, LinearScale,CategoryScale,Title);
  }
  ngAfterViewInit(){
    setTimeout(()=>{;
      this.canvas=this.mychart.nativeElement;
      this.ctx=this.canvas.getContext('2d');
      this.chartBy= new Chart (this.ctx, {
        type:'line',
        data : {
          labels: this.label,
          datasets: [{
            label: 'Performance over time',
            data: this.data,
            fill: true,
            borderColor: '#F74C07',
            backgroundColor:'#b0d0fd',
            pointBackgroundColor:'#fff',
            pointBorderWidth:2,
            pointHoverBorderWidth:2,
            pointRadius:5,
            pointBorderColor:'#F74C07',
            pointHoverBorderColor:'#F74C07',
            pointHoverBackgroundColor:'#F74C07',
            tension: 0.1,
            // 'linear-gradient(180deg, #5498fb,#fff)'
          }]
        },
      //   options: {
      //     plugins: {
      //         title: {
      //             display: true,
      //             text: 'Custom Chart Title'
      //         },
              
      //     }
      // }
    });
    },1000)
    
}
}
