import * as vscode from 'vscode';
import * as eol from 'eol';
import { Webhook, MessageBuilder } from 'discord-webhook-node';
const hastebin = require('hastebin-save');

export async function activate(context: vscode.ExtensionContext) {
	console.log('The "Discode" extension has been loaded successfully.');

	async function setWebhook(count = 1) {
		const webhookInput = await vscode.window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: 'Input a valid Discord webhook link.',
			validateInput: text => {
				var expr = /(https?):\/\/((?:ptb\.|canary\.)?discord(?:app)?\.com)\/api(?:\/)?(v\d{1,2})?\/webhooks\/(\d{17,19})\/([\w\-]{68})/i;
				return expr.test(text) ? null : 'That is not a valid Discord webhook link.';
			}
		});

		if (count === 1) {
			const nameInput = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: 'Input a name to show in the embed. Make sure it\'s less than 32 characters.',
				validateInput: text => {
					return text.length <= 32 ? null : 'That name is too long.';
				}
			});
	
			const avatarInput = await vscode.window.showInputBox({
				ignoreFocusOut: true,
				placeHolder: 'Input an image link to show in the embed as the avatar. Supported formats: png, jpg, gif.',
				validateInput: text => {
					return text.endsWith('png') || text.endsWith('jpeg') || text.endsWith('jpg') || text.endsWith('gif') ? null : 'That format is not supported.';
				}
			});

			if (webhookInput) {
				await vscode.workspace.getConfiguration('discode').update('webhook', webhookInput, vscode.ConfigurationTarget.Global);
					
				if (nameInput) {
					await vscode.workspace.getConfiguration('discode').update('name', nameInput, vscode.ConfigurationTarget.Global);
				}
	
				if (avatarInput) {
					await vscode.workspace.getConfiguration('discode').update('avatar', avatarInput, vscode.ConfigurationTarget.Global);
				}
			}
		} else {
			if (webhookInput) {
				switch (count) {
					case 2:
						await vscode.workspace.getConfiguration('discode').update('webhookSecond', webhookInput, vscode.ConfigurationTarget.Global);
						break;
					case 3:
						await vscode.workspace.getConfiguration('discode').update('webhookThird', webhookInput, vscode.ConfigurationTarget.Global);
						break;
				}
			}
		}

		await vscode.window.showInformationMessage('Successfully set a webhook!');
	}

	async function shareCode(count = 1) {
		const errorMessage = 'Discode has not been set up! You may be missing a name or avatar. Please use the "Set a Webhook" command through the Command Palette or configure it manually in the settings.';

		switch (count) {
			case 1:
				if (!vscode.workspace.getConfiguration('discode').get('webhook') || !vscode.workspace.getConfiguration('discode').get('name')) {
					return vscode.window.showErrorMessage(errorMessage);
				}
				break;
			case 2:
				if (!vscode.workspace.getConfiguration('discode').get('webhookSecond') || !vscode.workspace.getConfiguration('discode').get('name')) {
					return vscode.window.showErrorMessage(errorMessage);
				}
				break;

			case 3:
				if (!vscode.workspace.getConfiguration('discode').get('webhookThird') || !vscode.workspace.getConfiguration('discode').get('name')) {
					return vscode.window.showErrorMessage(errorMessage);
				}
				break;
		}

		const editor = vscode.window.activeTextEditor;
		
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const text = document.getText(selection);

			let currentHook: string;

			switch (count) {
				case 1:
					currentHook = `${vscode.workspace.getConfiguration('discode').get('webhook')}`;
					break;
				case 2:
					currentHook = `${vscode.workspace.getConfiguration('discode').get('webhookSecond')}`;
					break;
				case 3:
					currentHook = `${vscode.workspace.getConfiguration('discode').get('webhookThird')}`;
					break;
			}

			const hook = new Webhook({
				url: currentHook!,
				retryOnLimit: false
			});

			const whitespaceAmount = text.length - text.trimLeft().length;
			const codeLines = eol.split(text);

			let code: string[] = [];

			codeLines.forEach(function(line: string) {
				code.push(line.substring(whitespaceAmount));
			});
			
			if (`${code}`.length > 2048) {
				try {
					let hastebinLink : string;

					// @ts-ignore
					await hastebin.upload(`${code.join('\n')}`, link => {
						hastebinLink = `https://hastebin.com/${link}`;
					});

					vscode.window.showInformationMessage('Please wait...');

					setTimeout(async function() {
						let embed = new MessageBuilder()
							.setColor(0x27b5f4)
							.setDescription(`**${document.fileName.substring(document.fileName.lastIndexOf('\\') + 1)}**\n${hastebinLink}`)
							.setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png')
							.setTimestamp();
		
						if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
							embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
						} else {
							embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
						}

						await hook.send(embed);

						await vscode.window.showInformationMessage('Successfully shared code to Discord!');
					}, 3000);
				} catch (error) {
					console.log(error);
					await vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
				}
			} else {
				try {
					let embed = new MessageBuilder()
						.setColor(0x27b5f4)
						.setDescription(`**${document.fileName.substring(document.fileName.lastIndexOf('\\') + 1)}**\`\`\`${document.languageId}\n${code.join('\n')}\`\`\``)
						.setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png')
						.setTimestamp();
		
					if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
						embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
					} else {
						embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
					}

					await hook.send(embed);

					await vscode.window.showInformationMessage('Successfully shared code to Discord!');
				} catch (error) {
					console.log(error);
					await vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
				}
			}
		}
	}

	let set = vscode.commands.registerCommand('discode.set', async() => {
		await setWebhook(1);
	});

	let setSecond = vscode.commands.registerCommand('discode.setSecond', async() => {
		await setWebhook(2);
	});
	let setThird = vscode.commands.registerCommand('discode.setThird', async() => {
		await setWebhook(3);
	});

	let share = vscode.commands.registerCommand('discode.share', async() => {
		await shareCode(1);
	});

	let shareSecond = vscode.commands.registerCommand('discode.shareSecond', async() => {
		await shareCode(2);
	});

	let shareThird = vscode.commands.registerCommand('discode.shareThird', async() => {
		await shareCode(3);
	});

	context.subscriptions.push(set);
	context.subscriptions.push(setSecond);
	context.subscriptions.push(setThird);
	context.subscriptions.push(share);
	context.subscriptions.push(shareSecond);
	context.subscriptions.push(shareThird);
}

export function deactivate() {}
