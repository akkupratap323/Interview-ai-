export interface Question {
  id: string;
  question: string;
  follow_up_count: number;
}

export interface Quote {
  quote: string;
  call_id: string;
}

export interface InterviewBase {
  user_id: string;
  organization_id: string | null;
  name: string | null;
  interviewer_id: string | null;
  objective: string | null;
  question_count: number;
  time_duration: string | null;
  is_anonymous: boolean;
  questions: any;
  description: string | null;
  response_count: number;
}

export interface InterviewDetails {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  url: string | null;
  insights: any;
  quotes: any;
  details: any;
  is_active: boolean;
  theme_color: string | null;
  logo_url: string | null;
  respondents: any;
  readable_slug: string | null;
}

export interface Interview extends InterviewBase, InterviewDetails {}
