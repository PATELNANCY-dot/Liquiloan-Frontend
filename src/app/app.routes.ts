import { Routes } from '@angular/router';
import { Login } from './login/login';
import { LoginOtp } from './login-otp/login-otp';
import { Dashboard } from './dashboard/dashboard';
import { Registration1 } from './registration1/registration1';
import { Registration2 } from './registration2/registration2';
import { Registration3 } from './registration3/registration3';
import { Registration4 } from './registration4/registration4';
import { Changepassword } from './changepassword/changepassword';
import { ForgotPassword } from './forgot-password/forgot-password'
import { ForgotPassword2 } from './forgot-password2/forgot-password2';
import { Changepassword2 } from './changepassword2/changepassword2';
import { ManageAccount } from './manage-account/manage-account';
import { ChangeNominee } from './change-nominee/change-nominee';
import { InvestorDetailsPage } from './investor-details-page/investor-details-page';
import { InvestorPage } from './investor-page/investor-page';
import { InvestmentPage } from './investment-page/investment-page';
import { PaymentPage } from './payment-page/payment-page';
import { FactorAuth } from './factor-auth/factor-auth';
import { TransactionStatus } from './transaction-status/transaction-status';
import { MainLayoutComponent } from './main-layout-component/main-layout-component';
import { ViewNominee } from './view-nominee/view-nominee';
import { ManageBank } from './manage-bank/manage-bank';
import { AddBank } from './add-bank/add-bank';
import { ChangeEmail } from './change-email/change-email';
import { ChangeMobile } from './change-mobile/change-mobile';
import { Faq } from './faq/faq';
import { Download } from './download/download';
import { LoginEmail } from './login-email/login-email';

export const routes: Routes = [

  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'login-otp', component: LoginOtp },
  { path: 'login-email', component: LoginEmail },
 
  { path: 'registration1', component: Registration1 },
  { path: 'registration2', component: Registration2 },
  { path: 'registration3', component: Registration3 },
  { path: 'registration4', component: Registration4 },

  { path: 'forgot-password', component: ForgotPassword },
  { path: 'forgot-password2', component: ForgotPassword2 },
  { path: 'changepassword2', component: Changepassword2 },

  { path: 'payment-page', component: PaymentPage },
  { path: 'factor-auth', component: FactorAuth },

  {
    path: '',
    component: MainLayoutComponent, // Root layout with navbar
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'changepassword', component: Changepassword },
      { path: 'manage-account', component: ManageAccount },
      { path: 'change-nominee', component: ChangeNominee },
      { path: 'investor-details-page', component: InvestorDetailsPage },
      { path: 'investor-page', component: InvestorPage },
      { path: 'investment-page', component: InvestmentPage },
      { path: 'transaction-status', component: TransactionStatus },
      { path: 'view-nominee', component: ViewNominee },
      { path: 'manage-bank', component: ManageBank },
      { path: 'add-bank', component: AddBank },
      { path: 'change-email', component: ChangeEmail },
      { path: 'change-mobile', component: ChangeMobile },
      { path: 'faq', component: Faq },
      { path: 'download', component: Download },
      {
        path: 'change-nominee/:id',
        loadComponent: () => import('./change-nominee/change-nominee')
          .then(m => m.ChangeNominee)
      },
      // add all other pages that should show navbar
    ]
  },


  { path: '**', redirectTo: '' }
];
