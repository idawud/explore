import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatusMonitor } from 'src/app/services/shared/status-monitor';

@Component({
	selector: 'app-loading-modal',
	templateUrl: './loading-modal.component.html',
	styleUrls: ['./loading-modal.component.scss']
})
export class LoadingModalComponent {
	@Input() statusMonitor: StatusMonitor;
	@Output() loadApis: EventEmitter<any> = new EventEmitter();

	isActive = true;

	reloadApi(): void {
		this.loadApis.emit();
	}

	dismissModal() {
		this.isActive = false;
	}
}
