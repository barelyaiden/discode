// The module 'vscode' contains the VS Code extensibility API
// The module 'webhook' allows the use of the Discord webhook API.
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as webhook from 'discord-webhook-node';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Discode has been loaded successfully.');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let set = vscode.commands.registerCommand('discode.set', async() => {
		// The code you place here will be executed every time your command is executed
		// Sends an input box to retrieve a Discord webhook link.
		const firstInput = await vscode.window.showInputBox({
			// Sets the text in the input field.
			placeHolder: 'Input a valid Discord webhook link.',
			// Function that checks if the input is a valid Discord webhook link.
			validateInput: text => {
				return text.startsWith('https://discordapp.com/api/webhooks/') || text.startsWith('https://discord.com/api/webhooks/') ? null : 'That is not a valid Discord webhook link.';
			}
		});

		// Sends an input box to retrieve the name that should appear in the embed that gets sent.
		const secondInput = await vscode.window.showInputBox({
			// Sets the text in the input field.
			placeHolder: 'Input a name to show in the embed. Make sure it\'s less than 32 characters.',
			// Function that checks if the input is of a valid length.
			validateInput: text => {
				return text.length <= 32 ? null : 'That name is too long.';
			}
		});

		// Sends an input box to retrieve the avatar that should appear in the embed that gets sent.
		const thirdInput = await vscode.window.showInputBox({
			// Sets the text in the input field.
			placeHolder: 'Input an image link to show in the embed as the avatar. Supported formats: png, jpg, gif.',
			// Function that checks if the input is of a valid format.
			validateInput: text => {
				return text.endsWith('png') || text.endsWith('jpeg') || text.endsWith('jpg') || text.endsWith('gif') ? null : 'That format is not supported.';
			}
		});

		// Checks if there was an input for the Discord webhook link.
		if (firstInput) {
			// Updates the global configuration file to include the inputted Discord webhook link.
			await vscode.workspace.getConfiguration('discode').update('webhook', firstInput, vscode.ConfigurationTarget.Global);

			// Checks if there was an input for the name that's meant to appear in the embed.
			if (secondInput) {
				// Updates the global configuration file to include the inputted name.
				await vscode.workspace.getConfiguration('discode').update('name', secondInput, vscode.ConfigurationTarget.Global);
			}

			// Checks if there was an input for the avatar that's meant to appear in the embed.
			if (thirdInput) {
				// Updates the global configuration file to include the inputted avatar.
				await vscode.workspace.getConfiguration('discode').update('avatar', thirdInput, vscode.ConfigurationTarget.Global);
			}

			// Alerts the user that the configuration was successfully set up.
			await vscode.window.showInformationMessage('Discode: Successfully set a webhook!');
		}
	});

	// The share command.
	let share = vscode.commands.registerCommand('discode.share', async() => {
		// Gets the extension's configuration.
		const configuration = vscode.workspace.getConfiguration('discode');

		// Checks if the extension has not been set up.
		if (!configuration.get('webhook') || !configuration.get('name')) {
			// Alerts the user that the extension has not been set up.
			await vscode.window.showErrorMessage('Discode has not been set up! Please use the "set" command through the command palette or configure it in settings.');
		} else {
			// Gets the current active text editor.
			const editor = vscode.window.activeTextEditor;
			
			// Checks if there's an active text editor.
			if (editor) {
				// Gets the document from the active text editor.
				const document = editor.document;
				// Gets the selection from the active text editor.
				const selection = editor.selection;
				// Gets the selected text from the active text editor.
				const text = document.getText(selection);

				// Creates a new hook with the specified Discord webhook link.
				const hook = new webhook.Webhook({
					url: `${vscode.workspace.getConfiguration('discode').get('webhook')}`,
					retryOnLimit: false
				});
				
				// Creates an embed that gets sent to the Discord webhook.
				let embed = new webhook.MessageBuilder()
					// Sets the embed's current timestamp.
					.setTimestamp()
					// Sets the embed's color.
					.setColor(0x27b5f4)
					// Sets the embed's description.
					.setDescription(`\`\`\`${document.languageId}\n${text}\`\`\``)
					// Sets the embed's footer.
					.setFooter('Sent with Discode from Visual Studio Code');
				
				// Checks if there's no avatar in the configuration.
				if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
					// Sets the embed's author.
					embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
				} else {
					// Sets the embed's author.
					embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
				}
				
				// Checks if the code is too long to send in an embed.
				if (`${text}`.length > 1024) {
					// Alerts the user that the code is too long.
					await vscode.window.showErrorMessage('Discode: That code is longer than 1024 characters and as such, too long to send!');
				} else {
					// Tries to execute the code below and catches an error if one occurs.
					try {
						// Sends a request to the webhook.
						await hook.send(embed);

						// Alerts the user that the code was successfully shared.
						await vscode.window.showInformationMessage('Discode: Successfully shared code to Discord!');
					} catch (error) {
						// Alerts the user that the webhook link is not a valid Discord webhook link.
						await vscode.window.showErrorMessage('Discode: The webhook configuration is invalid! Please check if everything is correct in the settings or use the "set" command through the command palette.');
					}
				}
			}
		}
	});

	// Registers the "set" command.
	context.subscriptions.push(set);
	// Registers the "share" command.
	context.subscriptions.push(share);
}

// this method is called when your extension is deactivated
export function deactivate() {}
