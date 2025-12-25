export type ScheduleStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'declined'
  | string;

export interface ScheduleFilters {
  status?: ScheduleStatus;
  threadId?: string;
  /** when true, only future events */
  upcoming?: boolean;
}

export interface ScheduleParticipant {
  userId: string;
  status?: ScheduleStatus;
  joinedAt?: string;
  role?: string;
}

export interface Schedule {
  _id: string;
  title: string;
  description?: string;
  startAt?: string;
  date?: string;
  time?: string;
  threadId: string;
  userId?: string;
  createdBy?: string;
  status?: ScheduleStatus;
  upcoming?: boolean;
  participants?: ScheduleParticipant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleResponse<T = Schedule | Schedule[]> {
  success: boolean;
  message: string;
  data: T;
}

export interface GetUserSchedulesResponse extends ScheduleResponse<Schedule[]> {}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startAt?: string;
  date?: string;
  time?: string;
  threadId: string;
  userId: string;
}
