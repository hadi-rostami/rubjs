import Client from '../../client';

interface InputType {
	object_guid: string;
	question: string;
	options: string[];
	allows_multiple_answers: boolean;
	is_anonymous: boolean;
	reply_to_message_id: string | undefined;
	type: 'Regular' | 'Quiz';
	rnd: number;
	correct_option_index?: number;
	explanation?: string;
}

async function createPoll(
	this: Client,
	object_guid: string,
	question: string,
	options: string[],
	type: 'Regular' | 'Quiz' = 'Regular',
	is_anonymous: boolean = true,
	allows_multiple_answers: boolean = true,
	correct_option_index?: number,
	explanation?: string,
	reply_to_message_id?: string,
) {
	if (options.length <= 1)
		return console.warn(
			'The `options` argument must have more than two string values.',
		);

	if (!['Quiz', 'Regular'].includes(type)) {
		console.warn(
			'The `type` argument can only be in `["Quiz", "Regular"]`. Using default "Quiz".',
		);
		type = 'Quiz';
	}

	const input: InputType = {
		object_guid,
		question,
		options,
		allows_multiple_answers,
		is_anonymous,
		reply_to_message_id,
		type,
		rnd: Math.floor(Math.random() * 1e6 + 1),
	};

	if (type === 'Quiz') {
		input['correct_option_index'] = correct_option_index;
		input['explanation'] = explanation;
	}

	return await this.builder('createPoll', input);
}

export default createPoll;
