import { LucideIcon } from 'lucide-react';

export interface Auth {
  user: User;
  permissions: {
    can: string[];
  };
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profile_picture?: Media | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  current_workspace_id?: string;
  current_workspace?: Workspace;
  [key: string]: unknown; // This allows for additional properties...
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  logo: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  users: User[]
}

export interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  token: string;
  expires_at: string;
  invited_at: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
  invited_by?: User | null;
  invited_to?: User | null;
  project?: Project | null;
  workspace?: Workspace | null;
  last_sent_at?: string | null;
}

export interface Media {
  id: string;
  url: string;
  filename?: string;
  original_filename?: string;
  mime_type?: string;
  path?: string;
  filesize?: number;
  filetype?: string;
  disk?: string;
  created_by?: string;
  workspace_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  name: string;
  slug: string;
  parent_task_id: string | null;
  description: string;
  project_id: string;
  workspace_id: string;
  created_by: string;
  assigned_by: User | null;
  assigned_to: User | null;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  order: number | null;
  project: Project | null;
  media?: Media[];
  progress?: number | null;
  color?: string | null;
}

// Kanban Board Types
export interface KanbanCard {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl: string;
  assignedBy?: User | null;
  assignedTo?: User | null;
  dueDate?: string | null;
  priority?: string | null;
  status?: string | null;
  parentTaskId?: string | null;
  order?: number | null;
}

export interface ColumnType {
  id: string | number;
  title: string;
}

export interface ColumnMap {
  [columnId: string]: ColumnType;
}

export interface WorkspaceSelectorProps {
  workspaces: Workspace[];
}
