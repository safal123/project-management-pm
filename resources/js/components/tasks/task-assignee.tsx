import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCheck, X, ChevronDown, Search, Mail, Send } from 'lucide-react';
import { SharedData, Task, User } from '@/types';

interface TaskAssigneeProps {
  task: Task;
  className?: string;
}

// --- Shared Dropdown Sections --- //
const SearchInputSection = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) => (
  <div className="px-2 py-2 border-b">
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8 h-8"
      />
    </div>
  </div>
);

const MemberListSection = ({
  members,
  onSelect,
}: {
  members: User[];
  onSelect: (id: string) => void;
}) => (
  <div className="max-h-60 overflow-y-auto">
    {members.length ? (
      members.map((member) => (
        <DropdownMenuItem
          key={member.id}
          onClick={() => onSelect(member.id.toString())}
          className="flex items-center gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-xs">
              {member.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">
            {member.name}
            <span className="text-xs text-muted-foreground ml-2">
              {member.email}
            </span>
          </span>
        </DropdownMenuItem>
      ))
    ) : (
      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
        No members found
      </div>
    )}
  </div>
);

const EmailAssignmentSection = ({
  showEmailInput,
  setShowEmailInput,
  emailInput,
  setEmailInput,
  onAssignByEmail,
}: {
  showEmailInput: boolean;
  setShowEmailInput: (v: boolean) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  onAssignByEmail: () => void;
}) => (
  <>
    <div className="border-t">
      <DropdownMenuItem onClick={(e) => {
        e.preventDefault();
        setShowEmailInput(true);
      }}>
        <Mail className="h-4 w-4 mr-2" />
        Invite via email
      </DropdownMenuItem>
    </div>

    {showEmailInput && (
      <div className="px-2 py-2 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAssignByEmail();
              else if (e.key === 'Escape') {
                setShowEmailInput(false);
                setEmailInput('');
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={onAssignByEmail}
            disabled={!emailInput.trim()}
            className="h-8 px-3"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowEmailInput(false);
            setEmailInput('');
          }}
          className="h-6 px-2 text-xs mt-1"
        >
          Cancel
        </Button>
      </div>
    )}
  </>
);

// --- Dropdown Content --- //
const AssigneeDropdownContent = ({
  task,
  auth,
  filteredMembers,
  onAssignToMe,
  onAssignTo,
  onUnassign,
  emailState,
}: any) => {
  const { showEmailInput, setShowEmailInput, emailInput, setEmailInput, handleAssignByEmail } =
    emailState;

  return (
    <DropdownMenuContent align="start" className="w-96">
      <SearchInputSection
        searchQuery={emailState.searchQuery}
        setSearchQuery={emailState.setSearchQuery}
      />

      {/* Assign to me */}
      {(!task.assigned_to || task.assigned_to.id !== auth.user.id) && (
        <DropdownMenuItem onClick={onAssignToMe}>
          <UserCheck className="h-4 w-4 mr-2" />
          Assign to me
        </DropdownMenuItem>
      )}

      <MemberListSection members={filteredMembers} onSelect={onAssignTo} />
      <EmailAssignmentSection
        showEmailInput={showEmailInput}
        setShowEmailInput={setShowEmailInput}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        onAssignByEmail={handleAssignByEmail}
      />

      {/* Unassign */}
      {task.assigned_to && (
        <div className="border-t">
          <DropdownMenuItem onClick={onUnassign} className="text-destructive">
            <X className="h-4 w-4 mr-2" />
            Unassign
          </DropdownMenuItem>
        </div>
      )}
    </DropdownMenuContent>
  );
};

// --- Main Component --- //
export default function TaskAssignee({ task, className = '' }: TaskAssigneeProps) {
  const { auth, members } = usePage<SharedData & { members: User[] }>().props;
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showEmailInput, setShowEmailInput] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState('');

  const handleAssign = (data: any) =>
    router.patch(`/tasks/${task.id}`, data, { preserveScroll: true });

  const handleAssignToMe = () => handleAssign({ assigned_to: auth.user.id });
  const handleAssignTo = (userId: string) => handleAssign({ assigned_to: userId });
  const handleUnassign = () => handleAssign({ assigned_to: null });

  const handleAssignByEmail = () => {
    if (emailInput.trim()) {
      alert(`Assigning task to: ${emailInput}`);
      setEmailInput('');
      setShowEmailInput(false);
    }
  };

  const filteredMembers =
    members?.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const emailState = {
    showEmailInput,
    setShowEmailInput,
    emailInput,
    setEmailInput,
    handleAssignByEmail,
    searchQuery,
    setSearchQuery,
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className="w-24 text-sm text-muted-foreground">Assignee</Label>

      {task.assigned_to ? (
        <div className="flex items-center gap-2 flex-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assigned_to.avatar} alt={task.assigned_to.name} />
            <AvatarFallback className="text-xs">
              {task.assigned_to.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {task.assigned_to.name}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <AssigneeDropdownContent
              task={task}
              auth={auth}
              filteredMembers={filteredMembers}
              onAssignToMe={handleAssignToMe}
              onAssignTo={handleAssignTo}
              onUnassign={handleUnassign}
              emailState={emailState}
            />
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={handleUnassign}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start -ml-2 text-muted-foreground hover:text-foreground"
            >
              Add assignee
            </Button>
          </DropdownMenuTrigger>
          <AssigneeDropdownContent
            task={task}
            auth={auth}
            filteredMembers={filteredMembers}
            onAssignToMe={handleAssignToMe}
            onAssignTo={handleAssignTo}
            onUnassign={handleUnassign}
            emailState={emailState}
          />
        </DropdownMenu>
      )}
    </div>
  );
}
