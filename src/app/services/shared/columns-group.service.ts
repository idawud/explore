import { Injectable } from '@angular/core';
import { partition } from 'lodash';
import { CustomColDef } from 'src/app/components/explorer-api-data/explorer-api-column-factory';

@Injectable({
	providedIn: 'root'
})
export class ColumnsGroupService {
	constructor() {}

	groupColumns(columnDefs: CustomColDef[]): CustomColDef[] {
		const [ groupColumns, singleColumns ] = partition(columnDefs, column => column.field.split('/').length === 2);

		if (groupColumns.length >= 1) {
			const distinctHeadersNames = new Set<string>(groupColumns.map(column => column.field.split('/')[0]));
			const groupedColumnHeaders = Array.from(distinctHeadersNames).map(headerName => ({
				headerName,
				children: groupColumns.filter(column => column.field.startsWith(headerName)).map(column => {
					column.headerName = column.field.split('/')[1];
					return column;
				})
			}));

			return groupedColumnHeaders.concat(singleColumns);
		}
		return singleColumns;
	}
}
