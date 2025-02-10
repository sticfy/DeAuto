import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-shop',
  standalone: true,
  imports: [],
  templateUrl: './new-shop.component.html',
  styleUrl: './new-shop.component.css'
})
export class NewShopComponent {
  status=true
  hideDetails:any=false
  hideNoti:any=true
  hideInvo:any=true
  imagePath:any
  company:any
  package:any
  http=inject(HttpClient)
  categoryId:any
  constructor(private activeRouteId:ActivatedRoute){
    this.categoryId=this.activeRouteId.snapshot.paramMap.get('id');
  }
  ngOnInit(): void {
    
    this.getcompanys()
  }
    getcompanys(){
      this.http.get(`${environment.apiUrl}/company/details/${this.categoryId}`,).subscribe((data:any)=>{
        console.log(data)
          if(data.success){
            this.company=data.data
            this.imagePath=data.companyImageFolderPath
            console.log(data)
            this.getpackageDetails()
          }
        });
    }
    getpackageDetails(){
      // ${this.company.current_package_id}
      this.http.get(`${environment.apiUrl}/package/details/7`,).subscribe((data:any)=>{
        console.log(data)
          if(data.success){
            this.package=data.data
            console.log(data)
          }
        });
    }
  toggle(data:any){
    if(data=='Details'){
      this.hideDetails=false;
      this.hideNoti=true;
      this.hideInvo=true;
    }
    else if(data=='Subscription'){
      this.hideDetails=true;
      this.hideNoti=false;
      this.hideInvo=true;
    }
    else{
      this.hideDetails=true;
      this.hideNoti=true;
      this.hideInvo=false;
    }
  }
}
