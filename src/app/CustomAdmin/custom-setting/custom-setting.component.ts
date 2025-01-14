import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-custom-setting',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './custom-setting.component.html',
  styleUrl: './custom-setting.component.css'
})
export class CustomSettingComponent {
  userForm:FormGroup
  constructor(private fb:FormBuilder){
    this.userForm=this.fb.group({
      currentPassword:['',Validators.required],
      newPassword:['',Validators.required],
      password:['',Validators.required],
    })
  }
  hideForm:any=false
  toggle(data:any){
    if(data=='Security'){
      this.hideForm=false;
    }
    else{
      this.hideForm=true;
    }
  }
  password:any=true
  togglePassword(){
    this.password=!this.password
  }
  password1:any=true
  togglePassword1(){
    this.password1=!this.password1
  }
  password2:any=true
  togglePassword2(){
    this.password2=!this.password2
  }
  color:any='#5E5E5E'
  color_mini:any='#5E5E5E'
  color_case:any='#5E5E5E'
  color_num:any='#5E5E5E'
  color_sp:any='#5E5E5E'
  pass:any
  disable:any=true
  passcheck(){
    this.pass=this.userForm.value.password
    if(this.pass.length<8){this.color_mini='#FF0000'}else{this.color_mini='#358130'}
    if(this.pass.match(/[!@#$%*^&]/)){this.color_sp='#358130'}else{this.color_sp='#FF0000'}
    if(this.pass.match(/[A-Z]/) && this.pass.match(/[a-z]/)){this.color_case='#358130'}else{this.color_case='#FF0000'}
    if(this.pass.match(/[0-9]/)){this.color_num='#358130'}else{this.color_num='#FF0000'}
    if(this.pass.length>7&& this.pass.match(/[!@#$%*^&]/) &&this.pass.match(/[A-Z]/)&&this.pass.match(/[a-z]/) &&this.pass.match(/[0-9]/)){
      this.color='#358130'
      this.disable=false
    }else{
      this.disable=true
      this.color='#FF0000'}
  }
}
