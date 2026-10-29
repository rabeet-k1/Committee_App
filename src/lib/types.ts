export type CommitteeStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'USER' | 'ADMIN';
  trustScore: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Committee {
  id: string;
  name: string;
  description: string | null;
  contributionPkr: number;
  frequency: number;
  totalMembers: number;
  startDate: string;
  status: CommitteeStatus;
  inviteCode: string;
}

export interface CommitteeListItem extends Committee {
  _count: { members: number };
}

export interface CommitteeDetail extends Committee {
  members: {
    id: string;
    role: 'ORGANIZER' | 'MEMBER';
    payoutOrder: number | null;
    user: { id: string; name: string; phone: string; trustScore: number };
  }[];
}
