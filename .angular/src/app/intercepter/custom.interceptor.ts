import { HttpInterceptorFn } from '@angular/common/http';

export const customInterceptor: HttpInterceptorFn = (req, next) => {

  let token=localStorage.getItem('super_token')
  const clonereq=req.clone({
    setHeaders:{
      'x-access-token':`${token}`
    }
  })

  return next(clonereq);
};
