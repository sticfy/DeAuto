import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
serviceForm:FormGroup
serviceFormEdit:FormGroup
filesave=false
imageName='assets/images/demo.webp'
http=inject(HttpClient)
services:any
imagePath:any
from:FormData | undefined
constructor(private fb:FormBuilder){
  this.serviceForm=this.fb.group({
    category:['',Validators.required],
    title_en:['',Validators.required],
    title_dutch:['',Validators.required],
    status:['',Validators.required]
  })
  this.serviceFormEdit=this.fb.group({
    category:['',Validators.required],
    title_en:['',Validators.required],
    title_dutch:['',Validators.required],
    status:['',Validators.required]
  })
}
ngOnInit(): void {
  this.getServices()
  this.getCategories();
}
addService(){
  this.from=new FormData();
  this.from.append('category_id',this.serviceForm.value.category)
  this.from.append('title_en',this.serviceForm.value.title_en)
  this.from.append('title_dutch',this.serviceForm.value.title_dutch)
  this.from.append('status',this.serviceForm.value.status?'1':'2')
  console.log(this.from)
  this.http.post(`${environment.apiUrl}/service/add`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getServices()
        console.log(data)
      }
    });
}
updateId:any
editService(data:any){
  this.updateId=data.id
  console.log(data)
  this.serviceFormEdit.patchValue({
    category:data.category_id,
    title_en: data.title.en,
    title_dutch: data.title.du,
    status: data.status==1?true:false,
  });
}
updateService(){
  this.from=new FormData();
  this.from.append('id',this.updateId)
  this.from.append('category_id',this.serviceFormEdit.value.category)
  this.from.append('title_en',this.serviceFormEdit.value.title_en)
  this.from.append('title_dutch',this.serviceFormEdit.value.title_dutch)
  this.from.append('status',this.serviceFormEdit.value.status?'1':'2')
  console.log(this.from)
  this.http.put(`${environment.apiUrl}/service/update`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getServices()
        console.log(data)
      }
    });
}
getServices(){
  this.http.get(`${environment.apiUrl}/service/list`,).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.services=data.data
        this.imagePath=data.imageFolderPath
        console.log(data.data)
      }
    });
}
status(id:any){
  const data={
    id:id
  }
  this.http.put(`${environment.apiUrl}/service/changeStatus`,data).subscribe((data:any)=>{
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
  this.http.delete(`${environment.apiUrl}/service/delete`,{body:data}).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        console.log(data)
        this.getServices()
      }
    })
}
categories:any
getCategories(){
  this.http.get(`${environment.apiUrl}/category/list`,).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.categories=data.data
      }
    });
}
}
