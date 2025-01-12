import { Component, Input } from '@angular/core';
import { NavberComponent } from '../navber/navber.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavberComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  password:any=true
 
  constructor(private router:Router){}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }
  login(){
    this.router.navigate(['admin/dashboard'])
  }
  togglePassword(){
    this.password=!this.password
  }
}
