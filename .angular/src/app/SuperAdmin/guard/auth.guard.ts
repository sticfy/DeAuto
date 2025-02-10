import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const local=localStorage.getItem('auth')
  if(local=='super_admin'){
    
  }
  return true;
};
