import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.css'
})
export class PromotionComponent {

  bannerForm:FormGroup
  bannerFormEdit:FormGroup
  filesave=false
  imageName='assets/images/demo.webp'
  http=inject(HttpClient)
  banners:any
  imagePath:any
  filesaveTo(){
    this.filesave=true
  }
  constructor(private fb:FormBuilder){
    this.bannerForm=this.fb.group({
      title_en:['',Validators.required],
      image:['',Validators.required],
      status:['',Validators.required]
    })
    this.bannerFormEdit=this.fb.group({
      title_en:['',Validators.required],
      image:['',Validators.required],
      status:['',Validators.required]
    })
  }
  ngOnInit(): void {
    this.getbanners()
  }
  addbanner(){
  
    this.from=new FormData();
    this.from.append('image',this.imageFile)
    this.from.append('status',this.bannerForm.value.status?'1':'2')
    console.log(this.from)
    this.http.post(`${environment.apiUrl}/banner/add`,this.from).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.getbanners()
          console.log(data)
        }
      });
  }
  updateId:any
  editbanner(data:any){
    this.updateId=data.id
    console.log(data)
    this.bannerFormEdit.patchValue({
      status: data.status==1?true:false,
    });
    this.filesave=false
    this.imageName=`${this.imagePath}/${data.image}`
  }
  updatebanner(){
    this.from=new FormData();
    this.from.append('id',this.updateId)
    this.from.append('image',this.imageFile)
    this.from.append('status',this.bannerFormEdit.value.status?'1':'2')
    console.log(this.from)
    this.http.put(`${environment.apiUrl}/banner/update`,this.from).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.getbanners()
          console.log(data)
        }
      });
  }
  getbanners(){
    this.http.get(`${environment.apiUrl}/banner/list`,).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.banners=data.data
          this.imagePath=data.imageFolderPath
          console.log(data)
        }
      });
  }
  status(id:any){
    const data={
      id:id
    }
    this.http.put(`${environment.apiUrl}/banner/changeStatus`,data).subscribe((data:any)=>{
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
    this.http.delete(`${environment.apiUrl}/banner/delete`,{body:data}).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          console.log(data)
          this.getbanners()
        }
      })
  }
  imageFile:any
  from:FormData | undefined
  imageUpload(event:any){
  
    this.imageFile=event.target.files[0]
  
  }
}
