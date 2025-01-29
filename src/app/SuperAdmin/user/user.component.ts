import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
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
