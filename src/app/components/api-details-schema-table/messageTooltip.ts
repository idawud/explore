export function getTooltipMessage(message: string, cutoffLength: number): string | undefined {
	return message.length > cutoffLength ? message : undefined;
}
