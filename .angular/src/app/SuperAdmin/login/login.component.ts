import { Component, inject, Input } from '@angular/core';
import { NavberComponent } from '../navber/navber.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavberComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  http=inject(HttpClient)
  loginCheck=false
  LoginForm:FormGroup
  constructor(private router:Router,private fb:FormBuilder,){
    this.LoginForm=this.fb.group({
      email:['',Validators.required],
      password:['',Validators.required],
    })
  }

  async login(){
    const emailBody={
      email:this.LoginForm.value.email,
      password:this.LoginForm.value.password
    }

   this.http.post(`http://51.20.247.13:3001/api/v1/authentication/login`,emailBody).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        if(data.data.role.role_name=='super_admin'){
          this.router.navigate(['admin/dashboard'])
          localStorage.setItem('auth','super_admin')
          localStorage.setItem('super_token',data.data.token)
        }
        else if(data.data.role.role_name=='company_admin'){
          this.router.navigate(['custom/dashboard'])
          localStorage.setItem('auth','company_admin')
        }
      }
      else{
        this.loginCheck=true
      }
    });
    
  }
  password:any=true
  togglePassword(){
    this.password=!this.password
  }

}
