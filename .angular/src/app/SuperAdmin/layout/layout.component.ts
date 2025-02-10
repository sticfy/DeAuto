import { Component} from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent,RouterOutlet,ReactiveFormsModule,CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }
  constructor(private router:Router){
    const auth=localStorage.getItem('auth')
    if(auth!='super_admin'){
      this.router.navigate(['login'])
    }
  }

}
