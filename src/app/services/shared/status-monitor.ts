export type statusType = 'loading' | 'loaded' | 'error';

export type Status = {
	status: statusType;
	message: string;
};

export class StatusMonitor implements Status {
	status: statusType = 'loading';
	message: '';
}
