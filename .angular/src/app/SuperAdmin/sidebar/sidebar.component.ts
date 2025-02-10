import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,ReactiveFormsModule,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private router:Router){}
    http=inject(HttpClient)
  async logout(){
    this.http.get(`http://51.20.247.13:3001/api/v1/authentication/logout`).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.router.navigate(['/login'])
        }
        else{
        }
      });

  }
}
