export interface RegisterUserInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}
