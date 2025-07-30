import Client from '../../client';

type AllSettingsType = 'Nobody' | 'Everybody' | 'MyContacts';
type SettingsType = 'Everybody' | 'MyContacts';

interface InputType {
	updated_parameters: string[];
	show_my_last_online?: AllSettingsType;
	show_my_phone_number?: AllSettingsType;
	show_my_profile_photo?: SettingsType;
	link_forward_message?: AllSettingsType;
	can_join_chat_by?: SettingsType;
}

const allSettingsType = ['Nobody', 'Everybody', 'MyContacts'];
const settingsType = ['Everybody', 'MyContacts'];

async function setSetting(
	this: Client,
	show_my_last_online?: AllSettingsType,
	show_my_phone_number?: AllSettingsType,
	link_forward_message?: AllSettingsType,
	show_my_profile_photo?: SettingsType,
	can_join_chat_by?: SettingsType,
) {
	let input: InputType = {
		updated_parameters: [],
	};

	if (typeof show_my_last_online === 'string') {
		if (!allSettingsType.includes(show_my_last_online)) {
			console.warn(
				'The `show_my_last_online` can only be in `["Nobody", "Everybody", "MyContacts"]`. Using default "Hidden".',
			);
			show_my_last_online = 'Everybody';
		}
		input.show_my_last_online = show_my_last_online;
		input.updated_parameters.push('show_my_last_online');
	}

	if (typeof show_my_phone_number === 'string') {
		if (!allSettingsType.includes(show_my_phone_number)) {
			console.warn(
				'The `show_my_phone_number` can only be in `["Nobody", "Everybody", "MyContacts"]`. Using default "Hidden".',
			);
			show_my_phone_number = 'Everybody';
		}
		input.show_my_phone_number = show_my_phone_number;
		input.updated_parameters.push('show_my_phone_number');
	}

	if (typeof link_forward_message === 'string') {
		if (!allSettingsType.includes(link_forward_message)) {
			console.warn(
				'The `link_forward_message` can only be in `["Nobody", "Everybody", "MyContacts"]`. Using default "Hidden".',
			);
			link_forward_message = 'Everybody';
		}
		input.link_forward_message = link_forward_message;
		input.updated_parameters.push('link_forward_message');
	}

	if (typeof show_my_profile_photo === 'string') {
		if (!settingsType.includes(show_my_profile_photo)) {
			console.warn(
				'The `show_my_profile_photo` can only be in `["Everybody", "MyContacts"]`. Using default "Hidden".',
			);
			show_my_profile_photo = 'Everybody';
		}
		input.show_my_profile_photo = show_my_profile_photo;
		input.updated_parameters.push('show_my_profile_photo');
	}

	if (typeof can_join_chat_by === 'string') {
		if (!settingsType.includes(can_join_chat_by)) {
			console.warn(
				'The `can_join_chat_by` can only be in `["Everybody", "MyContacts"]`. Using default "Hidden".',
			);
			can_join_chat_by = 'Everybody';
		}
		input.can_join_chat_by = can_join_chat_by;
		input.updated_parameters.push('can_join_chat_by');
	}

	return await this.builder('setSetting', input);
}

export default setSetting;
