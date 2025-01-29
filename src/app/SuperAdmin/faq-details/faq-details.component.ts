import { Component } from '@angular/core';

@Component({
  selector: 'app-faq-details',
  standalone: true,
  imports: [],
  templateUrl: './faq-details.component.html',
  styleUrl: './faq-details.component.css'
})
export class FaqDetailsComponent {
  status=true
  hideDetails:any=false
  hideNoti:any=true
  hideInvo:any=true
  toggle(data:any){
    if(data=='Dutch'){
      this.hideDetails=true;
      this.hideNoti=false;
    }
    else{
      this.hideDetails=false;
      this.hideNoti=true;
    }

  }
}
