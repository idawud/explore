import { Component, Input } from '@angular/core';
import { ApiSpecificationService } from 'src/app/services/api_specification.service';
import { SharedEndpointDetailsService } from 'src/app/services/shared/shared-endpoint-details.service';
import { ApiPathDescription } from 'src/app/interfaces/apiSpecification';

@Component({
	selector: 'app-endpoint-list',
	templateUrl: './endpoint-list.component.html',
	styleUrls: [ './endpoint-list.component.scss' ]
})
export class EndpointListComponent {
	@Input() apiStore;

	constructor(
		private apiSpecification: ApiSpecificationService,
		private sharedEndpointDetailsService: SharedEndpointDetailsService
	) {}

	publishApiDetails(endpoint: ApiPathDescription): void {
		this.apiSpecification
			.getSpecificationAsync(this.apiStore.api.specificationLocation)
			.subscribe(apiSpecificationDoc => {
				const endpointDetails = this.apiSpecification.getReferenceDefinitionModel(
					endpoint.path,
					apiSpecificationDoc
				);

				const endpointDescription = this.apiSpecification.getApiEndpointDescription(
					endpoint.path,
					apiSpecificationDoc
				);

				this.sharedEndpointDetailsService.setEndPointsDetails(endpointDetails);
				this.sharedEndpointDetailsService.setEndPointDescription(endpointDescription);
				this.sharedEndpointDetailsService.publishEndpointDetails({ api: this.apiStore.api, endpoint });
			});
	}
}
