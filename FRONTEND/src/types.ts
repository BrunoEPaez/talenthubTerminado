export interface User {
  id: number;
  email: string;
}

export interface Job Application {
  id: number;
  job_id: number;
  user_id: number;
  cv_url?: string;
  job?: Partial<Job>;
  user?: Partial<User>;
}