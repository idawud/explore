import { InputParametersComponent } from './input-parameters.component';
import { OpenAPIV2 } from 'openapi-types';
import * as rxjs from 'rxjs';
import {
	IMocked,
	setupFunction,
	Mock,
	replacePropertiesBeforeEach,
	addMatchers,
	setupProperty
} from '@morgan-stanley/ts-mocking-bird';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';

describe('InputParametersComponent', () => {
	let mockSubscription: IMocked<rxjs.Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;

	const mockParameter: OpenAPIV2.ParameterObject = {
		name: 'productId',
		in: 'path',
		description: 'productId',
		required: true,
		type: 'number'
	};

	replacePropertiesBeforeEach(() => {
		mockSubscription = Mock.create<rxjs.Subscription>().setup(
			setupFunction('unsubscribe'),
			setupFunction('add', (() => mockSubscription.mock) as any)
		);
		mockSubscriptionPackage = Mock.create<typeof rxjs>().setup(
			setupFunction('Subscription', (() => mockSubscription.mock) as any)
		); // recreate mocks for each test run to reset call counts
		return [{ package: rxjs, mocks: { ...mockSubscriptionPackage.mock } }];
	});

	beforeEach(() => {
		addMatchers();
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupFunction('addInputParameter', () => {}),
			setupProperty('inputParameter$', rxjs.of({ Products: { '/products/{productId}': 'P999' } }))
		);
	});

	function getInstance() {
		return new InputParametersComponent(mockExplorerPanelApiService.mock);
	}

	it('should create an InputParametersComponent instance', () => {
		const inputParametersComponent = getInstance();
		expect(inputParametersComponent).toBeDefined();
	});

	it('should check add subscription was called when ngOnInit is invoked', () => {
		const inputParametersComponent = getInstance();
		inputParametersComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalledOnce();
	});

	it('should set publishedValue ngOnInit is invoked', () => {
		const inputParametersComponent = getInstance();
		inputParametersComponent.path = '/products/{productId}';
		inputParametersComponent.displayName = 'Products';
		inputParametersComponent.ngOnInit();
		expect(inputParametersComponent.publishedValue).toEqual('P999');
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const inputParametersComponent = getInstance();
		inputParametersComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should set value onkeyup', () => {
		const inputParametersComponent = getInstance();
		inputParametersComponent.parameter = mockParameter;
		inputParametersComponent.onKey('test');

		expect(inputParametersComponent.value).toEqual('test');
	});

	describe('validateType', () => {
		it('should return false if type is number and input is not', () => {
			const inputParametersComponent = getInstance();
			inputParametersComponent.parameter = mockParameter;
			inputParametersComponent.onKey('test34.0');

			expect(inputParametersComponent.isValid).toBeFalse();
		});

		it('should return false if type is integer and input is not', () => {
			const inputParametersComponent = getInstance();

			mockParameter.type = 'integer';
			inputParametersComponent.parameter = mockParameter;
			inputParametersComponent.onKey('test');
			expect(inputParametersComponent.isValid).toBeFalse();
		});

		it('should return true if type is number and input is also number', () => {
			const inputParametersComponent = getInstance();
			inputParametersComponent.parameter = mockParameter;
			inputParametersComponent.onKey('23.0');

			expect(inputParametersComponent.isValid).toBeTrue();
			expect(mockExplorerPanelApiService.withFunction('addInputParameter')).wasCalledAtLeastOnce();
		});

		it('should return true if type is integer and input is also number', () => {
			const inputParametersComponent = getInstance();

			mockParameter.type = 'integer';
			inputParametersComponent.parameter = mockParameter;
			inputParametersComponent.onKey('23');

			expect(inputParametersComponent.isValid).toBeTrue();
			expect(mockExplorerPanelApiService.withFunction('addInputParameter')).wasCalledAtLeastOnce();
		});

		it('should true if any other type', () => {
			const inputParametersComponent = getInstance();
			mockParameter.type = 'string';
			inputParametersComponent.parameter = mockParameter;

			inputParametersComponent.onKey('test');
			expect(inputParametersComponent.isValid).toBeTrue();
			expect(mockExplorerPanelApiService.withFunction('addInputParameter')).wasCalledAtLeastOnce();
		});
	});
});
