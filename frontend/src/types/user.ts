export type AuthUser = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  blood_group?: string | null;
  location?: string | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = AuthCredentials & {
  fullName: string;
  phone: string;
  bloodGroup: string;
  location: string;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};
