import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-setting',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css'
})
export class ProfileSettingComponent {
  // @ViewChild(GoogleMap) googleMap: GoogleMap;
   getLocation() {
    if (navigator.geolocation) {
      this.location=false
      navigator.geolocation.getCurrentPosition(this.showPosition) 
    } else { 
      alert('Geolocation is not supported by this browser.')
    }

  }
  location:boolean=true
  latitude:any
  longitude:any
  showPosition(position:any) {
    const val=position.coords.latitude
    const val1=position.coords.longitude;
  }

}
