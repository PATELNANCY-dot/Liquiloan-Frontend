// client-registration.model.ts
export interface ClientRegistration {
  clientId?: number;
  name: string;
  email: string;
  mobile: string;
  pan: string;
  dob: string;
  gender: string;
  placeOfBirth: string;
  nationality: string;
  permanentAddress: string;
  pincode: string;
  correspondingAddress: string;
  bankName: string;
  accountNumber: string;
  branchName: string;
  ifscCode: string;
  branchAddress: string;
  micrCode: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
  nomineePan: string;
}
