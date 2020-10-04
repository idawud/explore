import { Component, Input } from '@angular/core';
import { ApiPathDescription, ExplorerEndpointDetails, OpenAPISpecification } from 'src/app/interfaces/apiSpecification';

@Component({
	selector: 'app-new-explorer-view',
	templateUrl: './new-explorer-view.component.html',
	styleUrls: [ './new-explorer-view.component.scss' ]
})
export class NewExplorerViewComponent {
	@Input() explorerEndpointDetails: ExplorerEndpointDetails[];

	trackByEndpoint(index: number, endpointDetails: ExplorerEndpointDetails): ApiPathDescription{
		return endpointDetails.endpoint;
	}
}
