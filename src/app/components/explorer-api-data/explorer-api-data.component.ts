import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import { ExplorerPanelApiService } from 'src/app/services/shared/explorer-panel-api.service';
import { Subscription } from 'rxjs';
import { GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';
import { ApiService } from 'src/app/services/api.service';
import { ButtonCellRendererComponent } from '../button-cell-renderer/button-cell-renderer.component';
import { ExplorerApiColumnFactory, CustomColDef } from './explorer-api-column-factory';
import { ConnectableService } from 'src/app/services/connectable.service';
import { GridHeaderRendererComponent } from '../grid-header-renderer/grid-header-renderer.component';
import { ColumnsGroupService } from 'src/app/services/shared/columns-group.service';
import { ExplorerApiDataParser } from './explorer-api-data-parser';
import { ExplorerChangesService } from 'src/app/services/explorer-changes.service';
import { isEmpty } from 'lodash';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';
import { monitor } from 'src/app/services/shared/monitor-operator';

@Component({
	selector: 'app-explorer-api-data',
	templateUrl: './explorer-api-data.component.html',
	styleUrls: [ './explorer-api-data.component.scss' ]
})
export class ExplorerApiDataComponent implements OnInit, OnDestroy {
	@Input() endpointDetails: ExplorerEndpointDetails;
	subscription: Subscription = new Subscription();
	hostURL: string;
	statusMonitor: StatusMonitor;
	rowData: any[] = [];
	columnDefs: any[] = [];
	isRowDataAvailable = false;
	private _gridOptions: GridOptions;
	private gridApi: GridApi;
	private isConnectable = true;
	private columnDefsMap: { [fieldName: string]: CustomColDef } = {};

	constructor(
		private apiService: ApiService,
		private apiSpecificationService: ApiSpecificationService,
		private explorerPanelApiService: ExplorerPanelApiService,
		private connectableService: ConnectableService,
		private columnsGroupService: ColumnsGroupService,
		private explorerApiDataParser: ExplorerApiDataParser,
		private explorerApiColumnFactory: ExplorerApiColumnFactory,
		private explorerChangesService: ExplorerChangesService
	) {
		this.setupGridOptions();
	}

	ngOnInit(): void {
		this.subscription.add(
			this.apiSpecificationService
				.getSpecificationAsync(this.endpointDetails.api.specificationLocation)
				.subscribe(data => {
					this.hostURL = data.openapi
						? (this.hostURL = `${data.servers[0].url}${this.endpointDetails.endpoint.path}`)
						: (this.hostURL = `${data.host}${this.endpointDetails.endpoint.path}`);

					this.isRowDataAvailable = true;
				})
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	get gridOptions(): GridOptions {
		return this._gridOptions;
	}

	removeEndpoint(): void {
		this.explorerPanelApiService.removeEndpointDetailsFromExplorerPanel(this.endpointDetails);
	}

	private setupGridOptions(): void {
		this._gridOptions = {
			rowData: this.rowData,
			columnDefs: this.columnDefs,
			rowHeight: 27,
			gridAutoHeight: true,
			animateRows: true,
			enableFilter: true,
			masterDetail: true,
			enableColResize: true,
			pagination: true,
			paginationPageSize: 10,
			frameworkComponents: {
				btnCellRenderer: ButtonCellRendererComponent,
				agColumnHeader: GridHeaderRendererComponent
			},
			onGridReady: params => this.onGridReady(params)
		};
	}

	private onGridReady(params: GridReadyEvent): void {
		this.gridApi = params.api;

		this.subscription.add(
			this.explorerChangesService.explorerChanges$.subscribe(explorerChanges => {
				const inputParameters = explorerChanges.inputParameters;
				if (!isEmpty(inputParameters)) {
					const inputParameterValue =
						inputParameters[this.endpointDetails.api.displayName][this.endpointDetails.endpoint.path];

					if (inputParameterValue) {
						this.isConnectable = false;
						const index = this.hostURL.indexOf('{');
						if (index !== -1) {
							this.hostURL = this.hostURL.substring(0, index);
						} else {
							const lastIndex = this.hostURL.lastIndexOf('/');
							this.hostURL = this.hostURL.substring(0, lastIndex + 1);
						}
						this.hostURL = this.hostURL + inputParameterValue;
						this.setTableData();
					} else {
						this.gridApi.setRowData([]);
					}
				}
			})
		);

		this.setTableData();

		this.subscription.add(
			this.connectableService.connectableField$.subscribe(connectableField => {
				if (
					connectableField != null &&
					this.columnDefsMap[connectableField.fieldName] &&
					this.columnDefsMap[connectableField.fieldName].cellRenderer !== 'btnCellRenderer'
				) {
					this.updateConnectableColumns(connectableField.fieldName);
				}
			})
		);
	}

	private setTableData(): void {
		this.statusMonitor = new StatusMonitor();
		this.apiService.fetchDataFromServerAsync(this.hostURL)
			.pipe(monitor(this.statusMonitor))
			.subscribe(data => {
			if (data != null) {
				const arrayData = Array.isArray(data) ? data : [ data ];
				this.parseRowData(arrayData);
			} else {
				this.gridApi.setRowData([]);
			}
		});
	}

	private parseRowData(data: any[]): void {
		this.explorerChangesService.explorerChanges$.subscribe(explorerChanges => {
			const filters = explorerChanges.dataOutputFilter;
			const { rowData, columnDef } = this.explorerApiDataParser.parseRowDataAndColumns(
				data,
				filters,
				this.endpointDetails,
				this.isConnectable
			);
			this.rowData = rowData;
			this.columnDefs = this.columnsGroupService.groupColumns(columnDef);
			this.columnDefsMap = {};
			columnDef.forEach(column => {
				const columnSplit = column.field.split('/');
				this.columnDefsMap[columnSplit[columnSplit.length - 1]] = column;
			});

			this.setGridApi();
		});
	}

	private setGridApi(): void {
		this.gridApi.setColumnDefs(this.columnDefs);
		this.gridApi.setRowData(this.rowData);
	}

	private updateConnectableColumns(fieldName: string): void {
		this.columnDefsMap[fieldName] = this.explorerApiColumnFactory.createColumnDef(
			fieldName,
			this.endpointDetails.endpoint.path,
			this.isConnectable
		);

		this.columnDefs = this.columnDefs.map(columnDef => {
			if (columnDef.children) {
				return {
					headerName: columnDef.headerName,
					children: columnDef.children.map(childColumnDef => {
						const updateColumnDef = this.columnDefsMap[childColumnDef.headerName];
						updateColumnDef.field = childColumnDef.field;
						updateColumnDef.headerName = childColumnDef.headerName;
						return updateColumnDef;
					})
				};
			} else {
				return this.columnDefsMap[columnDef.field];
			}
		});
		this.gridApi.setColumnDefs(this.columnDefs);
	}

	loadEndpoint(){
		this.setTableData();
	}
}
