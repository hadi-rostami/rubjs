// rubika-models.ts

// ================= Enums =================

export enum ChatTypeEnum {
	User = 'User',
	Bot = 'Bot',
	Group = 'Group',
	Channel = 'Channel',
}

export enum ForwardedFromEnum {
	User = 'User',
	Channel = 'Channel',
	Bot = 'Bot',
}

export enum PaymentStatusEnum {
	Paid = 'Paid',
	NotPaid = 'NotPaid',
}

export enum PollStatusEnum {
	Open = 'Open',
	Closed = 'Closed',
}

export enum LiveLocationStatusEnum {
	Stopped = 'Stopped',
	Live = 'Live',
}

export enum FileTypeEnum {
	File = 'File',
	Image = 'Image',
	Voice = 'Voice',
	Music = 'Music',
	Gif = 'Gif',
	Video = 'Video',
}

export enum ButtonSelectionTypeEnum {
	TextOnly = 'TextOnly',
	TextImgThu = 'TextImgThu',
	TextImgBig = 'TextImgBig',
}

export enum ButtonSelectionSearchEnum {
	None = 'None',
	Local = 'Local',
	Api = 'Api',
}

export enum ButtonSelectionGetEnum {
	Local = 'Local',
	Api = 'Api',
}

export enum ButtonCalendarTypeEnum {
	DatePersian = 'DatePersian',
	DateGregorian = 'DateGregorian',
}

export enum ButtonTextboxTypeKeypadEnum {
	String = 'String',
	Number = 'Number',
}

export enum ButtonTextboxTypeLineEnum {
	SingleLine = 'SingleLine',
	MultiLine = 'MultiLine',
}

export enum ButtonLocationTypeEnum {
	Picker = 'Picker',
	View = 'View',
}

export enum MessageSenderEnum {
	User = 'User',
	Bot = 'Bot',
}

export enum UpdateTypeEnum {
	UpdatedMessage = 'UpdatedMessage',
	NewMessage = 'NewMessage',
	RemovedMessage = 'RemovedMessage',
	StartedBot = 'StartedBot',
	StoppedBot = 'StoppedBot',
	UpdatedPayment = 'UpdatedPayment',
}

export enum ChatKeypadTypeEnum {
	None = 'None',
	New = 'New',
	Remove = 'Remove',
}

export enum UpdateEndpointTypeEnum {
	ReceiveUpdate = 'ReceiveUpdate',
	ReceiveInlineMessage = 'ReceiveInlineMessage',
	ReceiveQuery = 'ReceiveQuery',
	GetSelectionItem = 'GetSelectionItem',
	SearchSelectionItems = 'SearchSelectionItems',
}

export enum ButtonTypeEnum {
	Simple = 'Simple',
	Selection = 'Selection',
	Calendar = 'Calendar',
	NumberPicker = 'NumberPicker',
	StringPicker = 'StringPicker',
	Location = 'Location',
	Payment = 'Payment',
	CameraImage = 'CameraImage',
	CameraVideo = 'CameraVideo',
	GalleryImage = 'GalleryImage',
	GalleryVideo = 'GalleryVideo',
	File = 'File',
	Audio = 'Audio',
	RecordAudio = 'RecordAudio',
	MyPhoneNumber = 'MyPhoneNumber',
	MyLocation = 'MyLocation',
	Textbox = 'Textbox',
	Link = 'Link',
	AskMyPhoneNumber = 'AskMyPhoneNumber',
	AskLocation = 'AskLocation',
	Barcode = 'Barcode',
}

// ================= Interfaces =================

export interface Chat {
	chat_id: string;
	chat_type: ChatTypeEnum;
	user_id: string;
	first_name: string;
	last_name: string;
	title: string;
	username: string;
}

export interface File {
	file_id: string;
	file_name: string;
	size: string;
}

export interface ForwardedFrom {
	type_from: ForwardedFromEnum;
	message_id: string;
	from_chat_id: string;
	from_sender_id: string;
}

export interface PaymentStatus {
	payment_id: string;
	status: PaymentStatusEnum;
}

export interface MessageTextUpdate {
	message_id: string;
	text: string;
}

export interface Bot {
	bot: {
		bot_id: string;
		bot_title: string;
		avatar: File;
		description: string;
		username: string;
		start_message: string;
		share_url: string;
	};
}

export interface BotCommand {
	command: string;
	description: string;
}

export interface Sticker {
	sticker_id: string;
	file: File;
	emoji_character: string;
}

export interface ContactMessage {
	phone_number: string;
	first_name: string;
	last_name: string;
}

export interface PollStatus {
	state: PollStatusEnum;
	selection_index: number;
	percent_vote_options: number[];
	total_vote: number;
	show_total_votes: boolean;
}

export interface Poll {
	question: string;
	options: string[];
	poll_status: PollStatus;
}

export interface Location {
	longitude: string;
	latitude: string;
}

export interface LiveLocation {
	start_time: string;
	live_period: number;
	current_location: Location;
	user_id: string;
	status: LiveLocationStatusEnum;
	last_update_time: string;
}

export interface ButtonSelectionItem {
	text: string;
	image_url: string;
	type: ButtonSelectionTypeEnum;
}

export interface ButtonSelection {
	selection_id: string;
	search_type: string;
	get_type: string;
	items: ButtonSelectionItem[];
	is_multi_selection: boolean;
	columns_count: string;
	title: string;
}

export interface ButtonCalendar {
	default_value?: string;
	type: ButtonCalendarTypeEnum;
	min_year: string;
	max_year: string;
	title: string;
}

export interface ButtonNumberPicker {
	min_value: string;
	max_value: string;
	default_value?: string;
	title: string;
}

export interface ButtonStringPicker {
	items: string[];
	default_value?: string;
	title?: string;
}

export interface ButtonTextbox {
	type_line: ButtonTextboxTypeLineEnum;
	type_keypad: ButtonTextboxTypeKeypadEnum;
	place_holder?: string;
	title?: string;
	default_value?: string;
}

export interface ButtonLocation {
	default_pointer_location: Location;
	default_map_location: Location;
	type: ButtonLocationTypeEnum;
	title?: string;
	location_image_url: string;
}

export interface AuxData {
	start_id: string;
	button_id: string;
}

export interface Button {
	id: string;
	type: ButtonTypeEnum;
	button_text: string;
	button_selection?: ButtonSelection;
	button_calendar?: ButtonCalendar;
	button_number_picker?: ButtonNumberPicker;
	button_string_picker?: ButtonStringPicker;
	button_location?: ButtonLocation;
	button_textbox?: ButtonTextbox;
}

export interface KeypadRow {
	buttons: Button[];
}

export interface Keypad {
	rows: KeypadRow[];
	resize_keyboard?: boolean;
	on_time_keyboard?: boolean;
}

export interface InlineKeypad {
	rows: KeypadRow[];
}

export interface MessageKeypadUpdate {
	message_id: string;
	inline_keypad: Keypad;
}

export interface Message {
	message_id: string;
	text?: string;
	time: number;
	is_edited: boolean;
	sender_type: MessageSenderEnum;
	sender_id: string;
	aux_data?: AuxData;
	file?: File;
	reply_to_message_id?: string;
	forwarded_from?: ForwardedFrom;
	forwarded_no_link?: string;
	location?: Location;
	sticker?: Sticker;
	contact_message?: ContactMessage;
	poll?: Poll;
	live_location?: LiveLocation;
}

export interface Update {
	type: UpdateTypeEnum;
	chat_id: string;
	removed_message_id?: string;
	new_message?: Message;
	updated_message?: Message;
	updated_payment?: PaymentStatus;
}

export interface InlineMessage {
	sender_id: string;
	text: string;
	file?: File;
	location?: Location;
	aux_data?: AuxData;
	message_id: string;
	chat_id: string;
}

// methods

export interface SendMessage {
	message_id: string;
}

export interface UploadFile {
	status: string;
	status_det: string;
	data: { file_id: string };
}

// utils
export interface Commend {
	command: string;
	description: string;
}
