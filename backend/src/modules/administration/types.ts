export interface CreateGovernmentUserInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;

  stateId?: string;
  districtId?: string;
  municipalityId?: string;
  departmentId?: string;
}
