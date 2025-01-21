import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { NavberComponent } from '../../SuperAdmin/navber/navber.component';

@Component({
  selector: 'app-partner-layout',
  standalone: true,
  imports: [NavberComponent],
  templateUrl: './partner-layout.component.html',
  styleUrl: './partner-layout.component.css'
})
export class PartnerLayoutComponent {

}
