import { ExplorerPanelComponent } from './explorer-panel.component';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import {
	IMocked,
	Mock,
	setupProperty,
	addMatchers,
	replacePropertiesBeforeEach,
	setupFunction
} from '@morgan-stanley/ts-mocking-bird';
import * as rxjs from 'rxjs';
import { of, Subscription } from 'rxjs';
import { tick, fakeAsync } from '@angular/core/testing';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';
import { mockExplorerChanges, mockEndpointDetails } from './mock-data-samples-exlorer-panel';

describe('ExplorerPanelComponent', () => {
	let mockExplorerPanelApiPanelService: IMocked<ExplorerPanelApiService>;
	let mockExplorerChangesService: IMocked<ExplorerChangesService>;
	let mockSubscription: IMocked<Subscription>;
	let mockSubscriptionPackage: IMocked<typeof rxjs>;

	function getInstance() {
		const explorerPanelComponent = new ExplorerPanelComponent(
			mockExplorerPanelApiPanelService.mock,
			mockExplorerChangesService.mock
		);
		return explorerPanelComponent;
	}

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
		mockExplorerPanelApiPanelService = Mock.create<ExplorerPanelApiService>().setup(
			setupProperty('explorerEndpointDetails$', of([mockEndpointDetails]))
		);
		mockExplorerChangesService = Mock.create<ExplorerChangesService>().setup(
			setupFunction('publishChanges', () => {}),
			setupProperty('explorerChanges$', of(mockExplorerChanges)),
			setupProperty('hasChanges$', of(true))
		);
	});

	it('should create new explorer panel component', () => {
		const explorerPanelComponent = getInstance();
		expect(explorerPanelComponent).toBeDefined();
	});

	it('should check add subscription was called when init runs', async () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();

		expect(mockSubscription.withFunction('add')).wasCalled(4);
	});

	it('should check unsubscribe was called when destroy is invoked', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnDestroy();

		expect(mockSubscription.withFunction('unsubscribe')).wasCalledOnce();
	});

	it('should return explorer Endpoint Details when init is called', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();

		expect(explorerPanelComponent.explorerEndpointDetails).toEqual([mockEndpointDetails]);
	});

	it('should return explorer Endpoint Details when init is called for saved changes', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();

		expect(explorerPanelComponent.explorerEndpointDetailsView).toEqual([ mockEndpointDetails ]);
	});

	it('should have no changes by default', () => {
		const explorerPanelComponent = getInstance();
		expect(explorerPanelComponent.hasChanges).toBeFalse();
	});

	it('should return true if explore endpoint list is not empty', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();

		expect(explorerPanelComponent.isEndpointDetailsAvailable).toBeTrue();
	});

	it('should return false if explore endpoint list is empty', () => {
		const explorerPanelComponent = getInstance();

		expect(explorerPanelComponent.isEndpointDetailsAvailable).toBeFalse();
	});

	it('should return true by default to show edit tab', () => {
		const explorerPanelComponent = getInstance();
		expect(explorerPanelComponent.showCustomizeScreen).toBeTrue();
	});

	it('should go back without applying changes', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.switchScreen();
		expect(explorerPanelComponent.showCustomizeScreen).toBeFalse();
	});

	it('should return false to show data output tab', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.switchScreenSaveAndApply();
		expect(explorerPanelComponent.showCustomizeScreen).toBeFalse();
	});

	it('should return true when there are unsaved changes', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();
		explorerPanelComponent.switchBackScreen();
		explorerPanelComponent.switchBackScreen();
		expect(explorerPanelComponent.isSaved).toBeTrue();
		expect(explorerPanelComponent.hasChanges).toBeTrue();
	});

	it('should return false when there are no changes', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.switchBackScreen();
		expect(explorerPanelComponent.hasChanges).toBeFalse();
	});

	it('should return true if all apis are removed from panel', () => {
		mockExplorerPanelApiPanelService.setupProperty('explorerEndpointDetails$', of([]));
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();

		expect(explorerPanelComponent.showCustomizeScreen).toBeTrue();
	});

	it('should display alert message when save & apply is clicked', async () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();
		explorerPanelComponent.switchScreenSaveAndApply();

		expect(explorerPanelComponent.savedChangesMessage).toEqual(`Changes Applied`);
	});
	it('should display alert message when back button is clicked', async () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.ngOnInit();
		explorerPanelComponent.switchBackScreen();
		expect(explorerPanelComponent.unsavedChangesMessage).toEqual(`You have unsaved changes`);
	});

	it('should not display alert message when switched to customize screen', async () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.switchScreenSaveAndApply();
		explorerPanelComponent.switchScreenSaveAndApply();

		expect(explorerPanelComponent.savedChangesMessage).toEqual(``);
	});

	it(
		'should auto hide the alert message after 3 sec',
		fakeAsync(() => {
			const explorerPanelComponent = getInstance();
			explorerPanelComponent.ngOnInit();
			explorerPanelComponent.switchScreenSaveAndApply();
			tick(3000);

			expect(explorerPanelComponent.savedChangesMessage).toEqual(``);
		})
	);

	it('should hide alert if closed', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.closeAlert();

		expect(explorerPanelComponent.savedChangesMessage).toEqual(``);
	});
	it('should hide warning alert if closed', () => {
		const explorerPanelComponent = getInstance();
		explorerPanelComponent.closeWarningAlert();
		expect(explorerPanelComponent.unsavedChangesMessage).toEqual(``);
	});
});
