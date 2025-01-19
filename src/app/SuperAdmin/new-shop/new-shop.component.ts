import { Component } from '@angular/core';

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
