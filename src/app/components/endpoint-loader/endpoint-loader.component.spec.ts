
import { EndpointLoaderComponent } from './endpoint-loader.component';

describe('EndpointLoaderComponent', () => {

	beforeEach(() => {
	});

	function getInstance() {
		return new EndpointLoaderComponent();
	}

	it('should create endpoint loader component', () => {
		expect(getInstance()).toBeDefined();
	});
});
