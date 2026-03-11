import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RegistrationDataService } from '../services/ client-registration.service';

@Component({
  selector: 'app-registration3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration3.html',
  styleUrls: ['./registration3.css'],
})
export class Registration3 {
  registrationForm: FormGroup;
  step = 3;
  banks: any[] = [];
  bankBranches: any[] = [];
 
  apiUrl = 'http://localhost:5048/api/ifscMaster';

  ngOnInit() {



    this.loadBanks();
    this.registrationForm.get('bankName')?.valueChanges.subscribe(bankId => {

      // Clear branch and auto-filled fields
      this.bankBranches = [];
      this.registrationForm.patchValue({
        branchName: '',
        ifscCode: '',
        micrCode: '',
        branchAddress: ''
      });

      if (bankId) {
        this.loadBranches(bankId);
      }

    });


    this.registrationForm.get('branchName')?.valueChanges.subscribe(branchId => {
      if (branchId) {

        const selectedBranch = this.bankBranches.find(b => b.id == branchId);

        if (selectedBranch) {
          this.registrationForm.patchValue({
            ifscCode: selectedBranch.ifscCode,
            micrCode: selectedBranch.micrCode,
            branchAddress: selectedBranch.bankAddress
          });
        }

      }
    });

  }

 
  loadBranches(bankId: number) {
    this.http.get<any[]>(
      `${this.apiUrl}/branches/${bankId}`
    ).subscribe(data => {
      this.bankBranches = data;
    });
  }

  loadBanks() {
    this.http.get<any[]>('http://localhost:5048/api/Bank')
      .subscribe(data => {
        this.banks = data;
      });
  }



  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private registrationService: RegistrationDataService) {
    this.registrationForm = this.fb.group({
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      branchName: ['', Validators.required],
      ifscCode: [{ value: '', disabled: true }],
      micrCode: [{ value: '', disabled: true }],
      branchAddress: [{ value: '', disabled: true }]
    });


  }
  async goNext() {

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formData = this.registrationForm.getRawValue();

    const selectedBank = this.banks.find(b => b.bankId == formData.bankName);
    const selectedBranch = this.bankBranches.find(b => b.id == formData.branchName);

    const updatedData: any = {
      ...formData,
      bankName: selectedBank ? selectedBank.bankName : '',
      branchName: selectedBranch ? selectedBranch.bankBranch : ''
    };

    if (this.selectedBankStatementFile)
      updatedData.bankStatementFile = await this.fileToBase64(this.selectedBankStatementFile);

    if (this.selectedCancelChequeFile)
      updatedData.cancelChequeFile = await this.fileToBase64(this.selectedCancelChequeFile);

    this.registrationService.setData(updatedData);

    this.router.navigate(['/registration4']);
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = error => {
        reject(error);
      };

    });
  }

  goBack() {
    this.router.navigate(['/registration2']);
  }


  // -------------------- File Uploads --------------------

  // Bank Statement
  selectedBankStatementFile: File | null = null;
  filePreviewBankStatement: string | ArrayBuffer | null = null;

  onBankStatementSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedBankStatementFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.filePreviewBankStatement = reader.result;
      reader.readAsDataURL(this.selectedBankStatementFile);
    }
  }

  removeBankStatementFile() {
    this.selectedBankStatementFile = null;
    this.filePreviewBankStatement = null;
    const input = document.getElementById('bankStatementUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  openBankStatementFile() {
    if (this.filePreviewBankStatement) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreviewBankStatement}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }

  // Cancel Cheque
  selectedCancelChequeFile: File | null = null;
  filePreviewCancelCheque: string | ArrayBuffer | null = null;

  onCancelChequeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedCancelChequeFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.filePreviewCancelCheque = reader.result;
      reader.readAsDataURL(this.selectedCancelChequeFile);
    }
  }

  removeCancelChequeFile() {
    this.selectedCancelChequeFile = null;
    this.filePreviewCancelCheque = null;
    const input = document.getElementById('cancelChequeUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  openCancelChequeFile() {
    if (this.filePreviewCancelCheque) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreviewCancelCheque}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }


  

  // ================= CUSTOM DROPDOWN =================

  bankNameDropdown = false;
  branchNameDropdown = false;

  toggleBank() {
    this.bankNameDropdown = !this.bankNameDropdown;
  }

  toggleBranch() {
    this.branchNameDropdown = !this.branchNameDropdown;
  }

  selectBank(bank: any) {
    this.registrationForm.patchValue({
      bankName: bank.bankId
    });

    this.bankNameDropdown = false;
  }

  selectBranch(branch: any) {
    this.registrationForm.patchValue({
      branchName: branch.id   // use correct property from API
    });

    this.branchNameDropdown = false;
  }


  

  getSelectedBankName(): string {
    const id = this.registrationForm.get('bankName')?.value;
    const bank = this.banks.find(b => b.bankId == id);
    return bank ? bank.bankName : 'Select Bank';
  }

  getSelectedBranchName(): string {
    const id = this.registrationForm.get('branchName')?.value;
    const branch = this.bankBranches.find(b => b.id == id);
    return branch ? branch.bankBranch : 'Select Branch';
  }

}


