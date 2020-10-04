import { Injectable } from '@angular/core';
import { ApiFilters } from 'src/app/interfaces/api';
import { cloneDeep, isObject, isEmpty } from 'lodash';
import { ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import { ExplorerApiColumnFactory, CustomColDef } from './explorer-api-column-factory';

export interface RowDataColumnDef {
	rowData: any[];
	columnDef: CustomColDef[];
}
@Injectable({
	providedIn: 'root'
})
export class ExplorerApiDataParser {
	constructor(private explorerColumnFactory: ExplorerApiColumnFactory) {}

	parseRowDataAndColumns(
		data: any[],
		filters: ApiFilters,
		endpointDetails: ExplorerEndpointDetails,
		isConnectable: boolean
	): RowDataColumnDef {
		let rowData = [];
		let columnDef = [];
		if (!isEmpty(filters)) {
			const columns: string[] = [];
			rowData = data.map(row => {
				const updatedRow = this.rowUpdator(filters, row, endpointDetails);
				const tableRow = {};
				this.setTableRowsAndColumns(updatedRow, columns, tableRow);
				return tableRow;
			});

			columnDef = columns.map(column =>
				this.explorerColumnFactory.createColumnDef(column, endpointDetails.endpoint.path, isConnectable)
			);
		}
		return { rowData, columnDef };
	}

	private rowUpdator(filters: ApiFilters, row, endpointDetails: ExplorerEndpointDetails): object {
		const updatedRow = cloneDeep(row);
		Object.keys(row).forEach(key => {
			if (
				filters[endpointDetails.api.displayName]?.[endpointDetails.endpoint.path] &&
				!filters[endpointDetails.api.displayName][endpointDetails.endpoint.path].includes(key)
			) {
				this.removeProperty(updatedRow, key);
			} else {
				if (isObject(row[key])) {
					Object.keys(row[key]).forEach(valueKey => {
						if (
							filters[endpointDetails.api.displayName]?.[endpointDetails.endpoint.path] &&
							!filters[endpointDetails.api.displayName][endpointDetails.endpoint.path].includes(valueKey)
						) {
							this.removeProperty(updatedRow[key], valueKey);
						}
					});
				}
			}
		});

		return updatedRow;
	}

	private removeProperty(value, key) {
		delete value[key];
	}

	private setTableRowsAndColumns(row, columns, tableRow): void {
		Object.entries(row).forEach(entry => {
			const [ key, value ] = entry;
			if (isObject(value)) {
				Object.entries(value).map(subEntry => {
					const [ subKey, subValue ] = subEntry;
					const columnKey = key + '/' + subKey;

					if (!columns.includes(columnKey)) {
						columns.push(columnKey);
					}

					tableRow[columnKey] = subValue;
				});
			} else {
				if (!columns.includes(key)) {
					columns.push(key);
				}
				tableRow[key] = value;
			}
		});
	}
}
