import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent {
  password:any=true
  togglePassword(){
    this.password=!this.password
  }
  password1:any=true
  togglePassword1(){
    this.password1=!this.password1
  }
}
