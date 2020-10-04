import { StatusMonitor } from './status-monitor';

describe('StatusMonitorService', () => {
	function getInstance() {
		return new StatusMonitor();
	}

	it('should create Status Monitor Service', () => {
		expect(getInstance()).toBeDefined();
	});
});
