import { IMocked, Mock, setupFunction } from '@morgan-stanley/ts-mocking-bird';
import { of } from 'rxjs';
import { Api } from 'src/app/interfaces/api';
import { mockedSpecificationData } from 'src/app/services/OpenApiSpecSamples';
import { ApiCallManagementService } from 'src/app/services/shared/api-call-management.service';
import { ModalEndpointListComponent } from './modal-endpoint-list.component';
import { EventEmitter } from '@angular/core';
import { mockEndpointDetails } from '../explorer-panel/mock-data-samples-exlorer-panel';

describe('ModalEndpointListComponent', () => {
	let mockApiCallManagementService: IMocked<ApiCallManagementService>;
	let mockEventEmmitter: IMocked<EventEmitter<any>>;

	const mockApi: Api = {
		specificationLocation: 'http://localhost/trades/v2/api-docs',
		department: 'PB',
		displayName: 'Trades'
	};

	function getInstance() {
		return new ModalEndpointListComponent(mockApiCallManagementService.mock);
	}

	beforeEach(() => {
		mockApiCallManagementService = Mock.create<ApiCallManagementService>().setup(
			setupFunction('isEndpointsSetToStore', () => false),
			setupFunction('setEndpointsToStoreByApi', () => of(mockedSpecificationData))
		);

		mockEventEmmitter = Mock.create<EventEmitter<any>>().setup(setupFunction('emit', () => {}));
	});

	it('should create new api component', () => {
		const modalEndpointListComponent = getInstance();
		expect(modalEndpointListComponent).toBeTruthy();
	});

	it('should populate the api endpoints when setEndPoints is invoked', () => {
		const modalEndpointListComponent = getInstance();
		modalEndpointListComponent.setEndPoints(mockApi);

		expect(
			mockApiCallManagementService.withFunction('setEndpointsToStoreByApi').withParameters(mockApi)
		).wasCalledOnce();
	});

	it('should emit publishApisToExplorer function when publishToExplorer is invoked', () => {
		const modalEndpointListComponent = getInstance();
		modalEndpointListComponent.publishApisToExplorer = mockEventEmmitter.mock;

		modalEndpointListComponent.publishToExplorer();
		expect(mockEventEmmitter.withFunction('emit')).wasCalledOnce();
	});

	it('should emit endpointListToAddChangeValue function when listToAddChangeValue is invoked', () => {
		const modalEndpointListComponent = getInstance();
		modalEndpointListComponent.endpointListToAddChangeValue = mockEventEmmitter.mock;

		modalEndpointListComponent.listToAddChangeValue(mockEndpointDetails);
		expect(mockEventEmmitter.withFunction('emit')).wasCalledOnce();
	});
});
