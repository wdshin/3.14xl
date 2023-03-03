export interface FormValues {
	name?: string;
	symbol?: string;
	description: string;
	media: string | null;
	validity: {
		start: Date | null;
		end: Date | null;
	};
	price: string;
	payoutAddress: string;
}

export interface UpdateEditionParams {
	image: string;
	description: string;
	payoutAddress: string;
	price: string;
	dateStart: number;
	dateEnd: number;
}
