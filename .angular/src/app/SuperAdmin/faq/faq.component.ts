import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  faqForm:FormGroup
  faqFormEdit:FormGroup
  imageName='assets/images/demo.webp'
  http=inject(HttpClient)
  faqies:any
  imagePath:any

  constructor(private fb:FormBuilder){
    this.faqForm=this.fb.group({
      question_en:['',Validators.required],
      question_dutch:['',Validators.required],
      answer_en:['',Validators.required],
      answer_dutch:['',Validators.required],
      status:['',Validators.required]
    })
    this.faqFormEdit=this.fb.group({
      question_en:['',Validators.required],
      question_dutch:['',Validators.required],
      answer_en:['',Validators.required],
      answer_dutch:['',Validators.required],
      status:['',Validators.required]
    })
  }
  ngOnInit(): void {
    this.getfaqies()
  }
  addfaq(){
    this.from=new FormData();
    this.from.append('question_en',this.faqForm.value.question_en)
    this.from.append('question_dutch',this.faqForm.value.question_dutch)
    this.from.append('answer_en',this.faqForm.value.answer_en)
    this.from.append('answer_dutch',this.faqForm.value.answer_dutch)
    this.from.append('status',this.faqForm.value.status?'1':'2')
    console.log(this.from)
    this.http.post(`${environment.apiUrl}/faq/add`,this.from).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.getfaqies()
          console.log(data)
        }
      });
  }
  updateId:any
  editfaq(data:any){
    this.updateId=data.id
    console.log(data)
    this.faqFormEdit.patchValue({
      question_en: data.question.en,
      question_dutch: data.question.du,
      answer_en: data.answer.en,
      answer_dutch: data.answer.du,
      status: data.status==1?true:false,
    });
  }
  updatefaq(){
    this.from=new FormData();
    this.from.append('id',this.updateId)
    this.from.append('question_en',this.faqFormEdit.value.question_en)
    this.from.append('question_dutch',this.faqFormEdit.value.question_dutch)
    this.from.append('answer_en',this.faqFormEdit.value.answer_en)
    this.from.append('answer_dutch',this.faqFormEdit.value.answer_dutch)
    this.from.append('status',this.faqFormEdit.value.status?'1':'2')
    console.log(this.from)
    this.http.put(`${environment.apiUrl}/faq/update`,this.from).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.getfaqies()
          console.log(data)
        }
      });
  }
  getfaqies(){
    this.http.get(`${environment.apiUrl}/faq/list`,).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          this.faqies=data.data
          console.log(data)
        }
      });
  }
  status(id:any){
    const data={
      id:id
    }
    this.http.put(`${environment.apiUrl}/faq/changeStatus`,data).subscribe((data:any)=>{
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
    this.http.delete(`${environment.apiUrl}/faq/delete`,{body:data}).subscribe((data:any)=>{
      console.log(data)
        if(data.success){
          console.log(data)
          this.getfaqies()
        }
      })
  }
  from:FormData | undefined
}
