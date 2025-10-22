import { LucideIcon } from 'lucide-react';
import WorkspaceSelector from '../components/workspace-switcher';

export interface Auth {
    user: User;
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
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
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

export interface WorkspaceSelectorProps {
    workspaces: Workspace[];
}
