import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { NavberComponent } from '../../SuperAdmin/navber/navber.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { FaqComponent } from '../faq/faq.component';
import { SubscriptionComponent } from '../subscription/subscription.component';

@Component({
  selector: 'app-partner-layout',
  standalone: true,
  imports: [NavberComponent,RouterOutlet,FooterComponent,FaqComponent,SubscriptionComponent],
  templateUrl: './partner-layout.component.html',
  styleUrl: './partner-layout.component.css'
})
export class PartnerLayoutComponent {

}
