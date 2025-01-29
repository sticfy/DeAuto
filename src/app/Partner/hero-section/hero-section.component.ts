import { Component } from '@angular/core';


@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent {
  Continue=true
  continueBtn(){
    this.Continue=false
  }
  password:any=true
  togglePassword(){
    this.password=!this.password
  }
  password1:any=true
  togglePassword1(){
    this.password1=!this.password1
  }
  s1=1
  part1st=true
  part2nd=false
  part3rd=false
  tab(){

      this.s1+=1;
      if(this.s1==2){
        this.part1st=false
        this.part2nd=true
        this.part3rd=false
      }
      else{
        this.part1st=false
        this.part2nd=false
        this.part3rd=true
      }

  }
}
