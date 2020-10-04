import { ButtonCellRendererComponent } from './button-cell-renderer.component';
import { IMocked, Mock, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { ICellRendererParams, ColDef } from 'ag-grid-community';

interface RenderEvent extends ICellRendererParams {
	onClick(params: any): void;
}

describe('ButtonCellRendererComponent', () => {
	let mockEvent: IMocked<Event>;
	let mockICellRendererParams: IMocked<RenderEvent>;
	let mockColDef: IMocked<ColDef>;

	function getInstance() {
		return new ButtonCellRendererComponent();
	}

	beforeEach(() => {
		mockColDef = Mock.create<ColDef>().setup(setupProperty('field', 'productDetail/productId'));
		mockEvent = Mock.create<Event>().setup();
		mockICellRendererParams = Mock.create<RenderEvent>().setup(
			setupProperty('value', 'P999'),
			setupProperty('colDef', mockColDef.mock)
		);
	});

	it('should create ButtonCellRenderer Component', () => {
		const buttonCellRendererComponent = getInstance();
		expect(buttonCellRendererComponent).toBeDefined();
	});

	it('should refresh ButtonCellRenderer Component', () => {
		const buttonCellRendererComponent = getInstance();
		expect(buttonCellRendererComponent.refresh()).toBeTrue();
	});

	it('should set label on agInit', () => {
		const buttonCellRendererComponent = getInstance();
		buttonCellRendererComponent.agInit(mockICellRendererParams.mock);
		expect(buttonCellRendererComponent.label).toEqual('P999');
	});

	it('should set params onClick', () => {
		mockICellRendererParams.setupFunction('onClick', () => {});
		const buttonCellRendererComponent = getInstance();
		buttonCellRendererComponent.agInit(mockICellRendererParams.mock);
		buttonCellRendererComponent.onClick(mockEvent.mock);
		expect(mockICellRendererParams.withFunction('onClick')).wasCalledOnce();
	});

	it('should not set params if not onClick', () => {
		const buttonCellRendererComponent = getInstance();
		buttonCellRendererComponent.agInit(mockICellRendererParams.mock);
		buttonCellRendererComponent.onClick(mockEvent.mock);
		expect(buttonCellRendererComponent.label).toEqual('P999');
	});
});
