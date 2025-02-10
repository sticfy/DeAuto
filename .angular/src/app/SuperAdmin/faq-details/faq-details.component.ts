import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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
  http=inject(HttpClient)
  faq:any
  FaqId:any
    constructor(private activeRouteId:ActivatedRoute){
      this.FaqId=this.activeRouteId.snapshot.paramMap.get('id');
    }
    ngOnInit(): void {
      
      this.getcompanys()
    }
      getcompanys(){
        this.http.get(`${environment.apiUrl}/faq/details/${this.FaqId}`,).subscribe((data:any)=>{
          console.log(data)
            if(data.success){
              this.faq=data.data
              console.log(data)
            }
          });
      }
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
