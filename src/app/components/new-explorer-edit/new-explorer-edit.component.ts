import { Component, Input } from '@angular/core';
import { ApiPathDescription, ExplorerEndpointDetails } from 'src/app/interfaces/apiSpecification';
import 'ag-grid-enterprise';

@Component({
	selector: 'app-new-explorer-edit',
	templateUrl: './new-explorer-edit.component.html',
	styleUrls: [ './new-explorer-edit.component.scss' ]
})
export class NewExplorerEditComponent {
	@Input() explorerEndpointDetails: ExplorerEndpointDetails[];

	trackByEndpoint(endpointDetails: ExplorerEndpointDetails): ApiPathDescription{
		return endpointDetails.endpoint;
	}
}
