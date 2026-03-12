export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "user" | "author" | "admin";
  avatar?: string;
  xp?: number;
  points?: number;
  author_profile?: Author;
}

export interface Author {
  id: number;
  user_id: number;
  bio: string;
  occupation: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  data?: any;
}

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  progress?: number;
  xp?: number;
  created_by?: number;
  status?: "draft" | "published";
  is_claimed?: boolean;
  certificate_id?: number;
  certificate_code?: string;
  has_final_assignment?: boolean;
  final_assignment_instructions?: string;
  final_submission_status?: "pending" | "approved" | "rejected" | "";
  modules?: Module[];
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  order_index: number;
  stages: StageSummary[];
  is_locked?: boolean;
  is_completed?: boolean;
}

export interface StageSummary {
  id: number;
  title: string;
  is_locked: boolean;
  is_completed: boolean;
}

export interface StageDetail {
  id: number;
  title: string;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: number;
  stage_id: number;
  type: "text" | "image" | "video" | "code" | "quiz" | "input";
  content: string;
  order_index: number;
}

export interface Certificate {
  id: number;
  user_id: number;
  learning_path_id: number;
  final_score: number;
  final_grade: string;
  certificate_code: string;
  issued_at: string;
  learning_path?: LearningPath; // Assuming backend might populate this or we fetch it separately
}

export interface Webinar {
  id: number;
  title: string;
  description: string;
  banner: string;
  scheduled_at: string;
  duration: number;
  link: string;
  recording_link?: string;
  material_link?: string;
  author_name?: string;
  status: "draft" | "pending" | "published" | "rejected" | "expired";
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "published";
  created_by: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  blocks?: ChallengeBlock[];
  is_completed?: boolean;
  submission?: ChallengeSubmission;
}

export interface ChallengeBlock {
  id: number;
  challenge_id: number;
  type: "text" | "image" | "video" | "code" | "quiz" | "input";
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleSubmission {
  id: number;
  user_id: number;
  module_id: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  score?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  module?: Module;
}

export interface ChallengeSubmission {
  id: number;
  user_id: number;
  challenge_id: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  score?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  challenge?: Challenge;
}

export interface PathSubmission {
  id: number;
  user_id: number;
  learning_path_id: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  score?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  learning_path?: LearningPath;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
