import { LoadingModalComponent } from './loading-modal.component';
import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { EventEmitter } from '@angular/core';

describe('LoadingModalComponent', () => {
	let mockEventEmmitter: IMocked<EventEmitter<any>>;

	beforeEach(() => {
		mockEventEmmitter = Mock.create<EventEmitter<any>>().setup(setupFunction('emit', () => {}));
	});

	function getInstance() {
		return new LoadingModalComponent();
	}

	it('should create loader component', () => {
		expect(getInstance()).toBeDefined();
	});

	it('should set isActive to false when dismissModal is invoked', () => {
		const loadingModalComponent = getInstance();

		loadingModalComponent.dismissModal();
		expect(loadingModalComponent.isActive).toBeFalse();
	});

	it('should emit loadApis function when reloadApi is invoked', () => {
		const loadingModalComponent = getInstance();
		loadingModalComponent.loadApis = mockEventEmmitter.mock;

		loadingModalComponent.reloadApi();
		expect(mockEventEmmitter.withFunction('emit')).wasCalledOnce();
	});
});
