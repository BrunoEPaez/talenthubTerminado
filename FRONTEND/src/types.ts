export interface User {
  id: number;
  email: string;
}

// El nombre debe ir todo junto (PascalCase)
export interface JobApplication {
  id: number;
  job_id: number;
  user_id: number;
  cv_url?: string;
  job?: any; // O Partial<Job> si tienes esa interfaz definida
  user?: Partial<User>;
}