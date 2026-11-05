export interface StudentContactDetails {
  currentAddress: string;
  permanentAddress: string;
  email: string;
  mobile: string;
  photoUrl: string | null;
}

export interface StudentAccount {
  readonly name: string;
  readonly initials: string;
  readonly studentId: string;
  readonly program: string;
  readonly status: string;
  readonly batch: string;
  readonly yearLevel: string;
  contact: StudentContactDetails;
}
