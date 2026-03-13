export interface AccountDetails {
  clientId?: number;
  name: string;
  email: string;
  mobile: string;
  pan: string;
  dob: string;
  gender: string;
  placeOfBirth: string;
  nationality: string;
  stateName: string;
  cityName: string;
  correspondingStateName: string;
  correspondingCityName: string;
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

  guardianName?: string;      // <-- make sure these match JSON
  guardianRelation?: string;
  guardianDob?: string;
  guardianPan?: string;
}
