import Http from './http';
import {
	CreateScheduleRequest,
	GetUserSchedulesResponse,
	ScheduleResponse,
	ScheduleFilters,
	Schedule,
} from '../types/schedule.type';

const buildQueryString = (filters: ScheduleFilters = {}) => {
	const params = new URLSearchParams();

	if (filters.status) params.append('status', filters.status);
	if (filters.threadId) params.append('threadId', filters.threadId);
	if (typeof filters.upcoming === 'boolean') {
		params.append('upcoming', String(filters.upcoming));
	}

	const query = params.toString();
	return query ? `?${query}` : '';
};

export const getUserSchedules = async (filters: ScheduleFilters = {}) => {
	const res = Http.get<GetUserSchedulesResponse>(`/schedule${buildQueryString(filters)}`);
	return res.then((response) => response.data);
};

export const getThreadSchedules = async (threadId: string, filters: ScheduleFilters = {}) => {
	const res = Http.get<ScheduleResponse<Schedule[]>>(`/schedule${buildQueryString({ ...filters, threadId })}`);
	return res.then((response) => response.data);
};

export const createSchedule = async (payload: CreateScheduleRequest) => {
	const res = Http.post<ScheduleResponse>('/schedule', payload);
	return res.then((response) => response.data);
};

export const joinSchedule = async (scheduleId: string) => {
	const res = Http.post<ScheduleResponse>(`/schedule/${scheduleId}/join`);
	return res.then((response) => response.data);
};

export const leaveSchedule = async (scheduleId: string) => {
	const res = Http.post<ScheduleResponse>(`/schedule/${scheduleId}/leave`);
	return res.then((response) => response.data);
};

export const getScheduleById = async (scheduleId: string) => {
	const res = Http.get<ScheduleResponse>(`/schedule/${scheduleId}`);
	return res.then((response) => response.data);
};
