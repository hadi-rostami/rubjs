export class BuilderException extends Error {
	constructor(message: string, public code: string, public data?: any) {
		super(message);
		this.name = 'BuilderException';
	}
}

export const MeaagesErrors: Record<string, string> = {
	INVALID_ACCESS: ' invalid access error:',
	INVALID_INPUT: ' invalid input error:',
};
