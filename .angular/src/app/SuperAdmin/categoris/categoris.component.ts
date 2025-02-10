import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categoris',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './categoris.component.html',
  styleUrl: './categoris.component.css'
})
export class CategorisComponent {
categoryForm:FormGroup
categoryFormEdit:FormGroup
filesave=false
imageName='assets/images/demo.webp'
http=inject(HttpClient)
categories:any
imagePath:any
filesaveTo(){
  this.filesave=true
}
constructor(private fb:FormBuilder){
  this.categoryForm=this.fb.group({
    title_en:['',Validators.required],
    title_dutch:['',Validators.required],
    image:['',Validators.required],
    status:['',Validators.required]
  })
  this.categoryFormEdit=this.fb.group({
    title_en:['',Validators.required],
    title_dutch:['',Validators.required],
    image:['',Validators.required],
    status:['',Validators.required]
  })
}
ngOnInit(): void {
  this.getCategories()
}
addCategory(){

  this.from=new FormData();
  this.from.append('title_en',this.categoryForm.value.title_en)
  this.from.append('title_dutch',this.categoryForm.value.title_dutch)
  this.from.append('image',this.imageFile)
  this.from.append('status',this.categoryForm.value.status?'1':'2')
  console.log(this.from)
  this.http.post(`${environment.apiUrl}/category/add`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getCategories()
        console.log(data)
      }
    });
}
updateId:any
editCategory(data:any){
  this.updateId=data.id
  console.log(data)
  this.categoryFormEdit.patchValue({
    title_en: data.title.en,
    title_dutch: data.title.du,
    status: data.status==1?true:false,
  });
  this.filesave=false
  this.imageName=`${this.imagePath}/${data.image}`
}
updateCategory(){
  this.from=new FormData();
  this.from.append('id',this.updateId)
  this.from.append('title_en',this.categoryFormEdit.value.title_en)
  this.from.append('title_dutch',this.categoryFormEdit.value.title_dutch)
  this.from.append('image',this.imageFile)
  this.from.append('status',this.categoryFormEdit.value.status?'1':'2')
  console.log(this.from)
  this.http.put(`${environment.apiUrl}/category/update`,this.from).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.getCategories()
        console.log(data)
      }
    });
}
getCategories(){
  this.http.get(`${environment.apiUrl}/category/list`,).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        this.categories=data.data
        this.imagePath=data.imageFolderPath
        console.log(data)
      }
    });
}
status(id:any){
  const data={
    id:id
  }
  this.http.put(`${environment.apiUrl}/category/changeStatus`,data).subscribe((data:any)=>{
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
  this.http.delete(`${environment.apiUrl}/category/delete`,{body:data}).subscribe((data:any)=>{
    console.log(data)
      if(data.success){
        console.log(data)
        this.getCategories()
      }
    })
}
imageFile:any
from:FormData | undefined
imageUpload(event:any){

  this.imageFile=event.target.files[0]

}
}
