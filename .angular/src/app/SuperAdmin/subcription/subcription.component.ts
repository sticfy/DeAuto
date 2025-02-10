import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcription',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './subcription.component.html',
  styleUrl: './subcription.component.css'
})
export class SubcriptionComponent {
subcriptionForm:FormGroup
subcriptionFormEdit:FormGroup
filesave=false
imageName='assets/images/demo.webp'
http=inject(HttpClient)
subcriptions:any
imagePath:any
from:FormData | undefined
constructor(private fb:FormBuilder){
  this.subcriptionForm=this.fb.group({
    title_en:['',Validators.required],
    title_du:['',Validators.required],
    details_en:['',Validators.required],
    details_du:['',Validators.required],
    service_limit:['',Validators.required],
    appointment_limit:['',Validators.required],
    duration:['',Validators.required],
    price:['',Validators.required],
    discount_amount:['',Validators.required],
    status:['',Validators.required],
  })
  this.subcriptionFormEdit=this.fb.group({
    title_en:['',Validators.required],
    title_du:['',Validators.required],
    details_en:['',Validators.required],
    details_du:['',Validators.required],
    service_limit:['',Validators.required],
    appointment_limit:['',Validators.required],
    duration:['',Validators.required],
    price:['',Validators.required],
    discount_amount:['',Validators.required],
    status:['',Validators.required],
  })
}
ngOnInit(): void {
  this.getsubcriptions()
}
addsubcription(){
  this.from=new FormData();

  this.from.append('title_en',this.subcriptionForm.value.title_en)
  this.from.append('title_dutch',this.subcriptionForm.value.title_du)
  this.from.append('details_en',this.subcriptionForm.value.details_en)
  this.from.append('details_dutch',this.subcriptionForm.value.details_du)
  this.from.append('duration',this.subcriptionForm.value.duration)
  this.from.append('price',this.subcriptionForm.value.price)
  this.from.append('discount_amount',this.subcriptionForm.value.discount_amount)
  this.from.append('service_limit',this.subcriptionForm.value.service_limit)
  this.from.append('appointment_limit',this.subcriptionForm.value.appointment_limit)
  this.from.append('status',this.subcriptionForm.value.status?'1':'2')
  console.log(this.from)
  this.http.post(`${environment.apiUrl}/package/add`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getsubcriptions()
        console.log(data)
      }
    });
}
updateId:any
editsubcription(data:any){
  this.updateId=data.id
  console.log(data)
  this.subcriptionFormEdit.patchValue({
    title_en:data.title.en,
    title_du:data.title.du,
    details_en:data.details.en,
    details_du:data.details.du,
    service_limit:data.service_limit,
    appointment_limit:data.appointment_limit,
    duration:data.duration,
    price:data.price,
    discount_amount:data.discount_amount,
    status: data.status==1?true:false,
  });
}
updatesubcription(){
  this.from=new FormData();
  this.from.append('id',this.updateId)
  this.from.append('title_en',this.subcriptionFormEdit.value.title_en)
  this.from.append('title_dutch',this.subcriptionFormEdit.value.title_du)
  this.from.append('details_en',this.subcriptionFormEdit.value.details_en)
  this.from.append('details_dutch',this.subcriptionFormEdit.value.details_du)
  this.from.append('duration',this.subcriptionFormEdit.value.duration)
  this.from.append('price',this.subcriptionFormEdit.value.price)
  this.from.append('discount_amount',this.subcriptionFormEdit.value.discount_amount)
  this.from.append('service_limit',this.subcriptionFormEdit.value.service_limit)
  this.from.append('appointment_limit',this.subcriptionFormEdit.value.appointment_limit)
  this.from.append('status',this.subcriptionFormEdit.value.status?'1':'2')
  console.log(this.from)
  this.http.put(`${environment.apiUrl}/package/update`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getsubcriptions()
        console.log(data)
      }
    });
}
getsubcriptions(){
  this.http.get(`${environment.apiUrl}/package/list`,).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.subcriptions=data.data
        console.log(data.data)
      }
    });
}
status(id:any){
  const data={
    id:id
  }
  this.http.put(`${environment.apiUrl}/package/changeStatus`,data).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        console.log(data)
      }
    })
}
deletedId:number=0
daletedIDPass(id:any){
  this.deletedId=id
}
delete(){
  const data={
    id:this.deletedId
  }
  this.http.delete(`${environment.apiUrl}/package/delete`,{body:data}).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        console.log(data)
        this.getsubcriptions()
      }
    })
}


}
