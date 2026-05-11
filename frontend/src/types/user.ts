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

export type ProfileUpdatePayload = {
  full_name?: string;
  phone?: string;
  blood_group?: string;
  location?: string;
};

export type HealthProfile = {
  id: string;
  user_id: string;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  activity_level?: string | null;
  pregnancy_status?: string | null;
  allergies?: string | null;
  temperature_f?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  blood_sugar?: number | null;
  symptoms?: string[] | null;
  conditions?: string[] | null;
  created_at: string;
};
