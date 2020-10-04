import { AppComponent } from './app.component';
import { IMocked, Mock, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { ExplorerPanelApiService } from './services/shared/explorer-panel-api.service';
import { of } from 'rxjs';
import { Api } from './interfaces/api';
import { ExplorerEndpointDetails } from './interfaces/apiSpecification';

describe('AppComponent', () => {
	let mockExplorerPanelApiService: IMocked<ExplorerPanelApiService>;

	const mockendpointDetails: ExplorerEndpointDetails[] = [
		{
			endpoint: { path: '/trades', description: 'Returns all trades' },
			api: {
				specificationLocation: 'http://localhost/trades/v2/api-docs',
				department: 'PB',
				displayName: 'Trades'
			}
		}
	];

	function getInstance() {
		return new AppComponent(mockExplorerPanelApiService.mock);
	}

	beforeEach(() => {
		mockExplorerPanelApiService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('explorerEndpointDetails$', of(mockendpointDetails))
		);
	});

	it('should create the app component', () => {
		const appComponent = getInstance();
		expect(appComponent).toBeDefined();
	});

	it('should create subscription when init is called', () => {
		const appComponent = getInstance();
		appComponent.ngOnInit();

		expect(appComponent.subscription.closed).toBe(false);
	});

	it('should record the number of api on panel on init', () => {
		const appComponent = getInstance();
		appComponent.ngOnInit();

		expect(appComponent.numberOfApiOnExplorerPanel).toEqual(mockendpointDetails.length);
	});

	it('should remove subscription when destroy is called', () => {
		const appComponent = getInstance();
		appComponent.ngOnDestroy();

		expect(appComponent.subscription.closed).toBe(true);
	});
});
