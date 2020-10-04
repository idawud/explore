import { Component, Input } from '@angular/core';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';

@Component({
	selector: 'app-endpoint-loader',
	templateUrl: './endpoint-loader.component.html',
	styleUrls: ['./endpoint-loader.component.scss']
})
export class EndpointLoaderComponent {
	@Input() statusMonitor: StatusMonitor;
}
