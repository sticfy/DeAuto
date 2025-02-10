import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.css'
})
export class CompanyListComponent {

  http=inject(HttpClient)
  companys:any
  imagePath:any
  from:FormData | undefined
  constructor(private fb:FormBuilder){

  }
  ngOnInit(): void {
    this.getcompanys()
  }
  // addcompany(){
  //   this.from=new FormData();
  //   this.from.append('category_id',this.companyForm.value.category)
  //   this.from.append('title_en',this.companyForm.value.title_en)
  //   this.from.append('title_dutch',this.companyForm.value.title_dutch)
  //   this.from.append('status',this.companyForm.value.status?'1':'2')
  //   console.log(this.from)
  //   this.http.post(`${environment.apiUrl}/company/add`,this.from).subscribe((data:any)=>{
  //     console.log(data)
  //       if(data.success){
  //         this.getcompanys()
  //         console.log(data)
  //       }
  //     });
  // }
  // updateId:any
  // editcompany(data:any){
  //   this.updateId=data.id
  //   console.log(data)
  //   this.companyFormEdit.patchValue({
  //     category:data.category_id,
  //     title_en: data.title.en,
  //     title_dutch: data.title.du,
  //     status: data.status==1?true:false,
  //   });
  // }
  // updatecompany(){
  //   this.from=new FormData();
  //   this.from.append('id',this.updateId)
  //   this.from.append('category_id',this.companyFormEdit.value.category)
  //   this.from.append('title_en',this.companyFormEdit.value.title_en)
  //   this.from.append('title_dutch',this.companyFormEdit.value.title_dutch)
  //   this.from.append('status',this.companyFormEdit.value.status?'1':'2')
  //   console.log(this.from)
  //   this.http.put(`${environment.apiUrl}/company/update`,this.from).subscribe((data:any)=>{
  //     console.log(data)
  //       if(data.success){
  //         this.getcompanys()
  //         console.log(data)
  //       }
  //     });
  // }
  getcompanys(){
    this.http.post(`${environment.apiUrl}/company/list`,{}).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.companys=data.data
          this.imagePath=data.imageFolderPath
          console.log(data.data)
        }
      });
  }

  deletedId:number=0
  daletedIDPass(id:any){
    this.deletedId=id
  }
  delete(){
    const data={
      id:this.deletedId
    }
    this.http.delete(`${environment.apiUrl}/company/delete`,{body:data}).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          console.log(data)
          this.getcompanys()
        }
      })
  }
  categories:any

}
