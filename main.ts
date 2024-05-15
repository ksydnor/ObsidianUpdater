import { Plugin, Notice, App, Modal, MarkdownView } from 'obsidian';
class JsonModal extends Modal {
	private jsonData: string = '';
	onCloseCallback: () => void = null;

	constructor(app: App) {
		super(app);
	}
//modal logic
	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Enter your JSON data below:' });

		const textarea = contentEl.createEl('textarea', {
			attr: { id: 'json-data', rows: '10' },
		}) as HTMLTextAreaElement;
		textarea.style.width = '100%';
		textarea.style.resize = 'vertical';

		const confirmButton = contentEl.createEl('button', { text: 'Confirm' });
		confirmButton.style.marginTop = '10px';
		confirmButton.onclick = () => {
			this.jsonData = textarea.value.trim();
			if (!this.jsonData) {
				new Notice('Please enter valid JSON data.');
				return;
			}

			try {
				JSON.parse(this.jsonData);
				this.close();
			} catch (error) {
				new Notice('Error parsing JSON data. Please check your input.');
			}
		};

		setTimeout(() => {
			textarea.focus();
		}, 0);
	}

	onClose() {
		this.contentEl.empty();
		this.onCloseCallback?.();
	}

	getData(): string {
		return this.jsonData;
	}
}

export default class MyPlugin extends Plugin {
	private modal: JsonModal;

	async onload() {
		console.log('Loading MyPlugin');

		this.addCommand({
			id: 'replace-data',
			name: 'Replace Data in Markdown',
			callback: () => this.openJsonModal(),
		});
	}

	openJsonModal() {
		this.modal = new JsonModal(this.app);
		this.modal.open();
		this.modal.onCloseCallback = () => {
			const jsonData = this.modal.getData();
			if (jsonData) {
				this.replaceDataInActiveMarkdown(jsonData);
				console.log('JSON Data:', jsonData);
				new Notice('JSON Data Received Successfully');
			}
		};
	}
	// replacement logic
	replaceDataInActiveMarkdown(jsonData: string) {
		const activeLeaf = this.app.workspace.activeLeaf;
		if (activeLeaf?.view instanceof MarkdownView) {
			const editor = activeLeaf.view.editor;
			let docContent = editor.getValue();

			try {
				const json = JSON.parse(jsonData);
				Object.keys(json).forEach(key => {
					const regex = new RegExp(`{{${key}}}`, 'g');
					docContent = docContent.replace(regex, json[key]);
				});

				editor.setValue(docContent);
				new Notice('Document updated with JSON data.');
			} catch (error) {
				new Notice('Error parsing JSON data. Please check your input.');
				console.error('Error parsing JSON data:', error);
			}
		} else {
			new Notice('No active Markdown document to update.');
		}
	}

	onunload() {
		console.log('Unloading MyPlugin');
	}
}
