"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// The module 'discord-webhook=node' allows compatibility with Discord webhooks.
// The module 'eol' allows additional functionality with line endings of strings.
// The module 'hastebin' allows the functionality of creating Hastebin links.
const vscode = require("vscode");
const discord_webhook_node_1 = require("discord-webhook-node");
const eol = require("eol");
const hastebin = require("hastebin");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Discode has been loaded successfully.');
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        // The "set" command.
        let set = vscode.commands.registerCommand('discode.set', () => __awaiter(this, void 0, void 0, function* () {
            // The code you place here will be executed every time your command is executed
            // Sends an input box to retrieve a Discord webhook link.
            const firstInput = yield vscode.window.showInputBox({
                // Sets it so the input box doesn't close when window focus is lost.
                ignoreFocusOut: true,
                // Sets the text in the input field.
                placeHolder: 'Input a valid Discord webhook link.',
                // Function that checks if the input is a valid Discord webhook link.
                validateInput: text => {
                    return text.startsWith('https://discordapp.com/api/webhooks/') || text.startsWith('https://discord.com/api/webhooks/') ? null : 'That is not a valid Discord webhook link.';
                }
            });
            // Sends an input box to retrieve the name that should appear in the embed that gets sent.
            const secondInput = yield vscode.window.showInputBox({
                // Sets it so the input box doesn't close when window focus is lost.
                ignoreFocusOut: true,
                // Sets the text in the input field.
                placeHolder: 'Input a name to show in the embed. Make sure it\'s less than 32 characters.',
                // Function that checks if the input is of a valid length.
                validateInput: text => {
                    return text.length <= 32 ? null : 'That name is too long.';
                }
            });
            // Sends an input box to retrieve the avatar that should appear in the embed that gets sent.
            const thirdInput = yield vscode.window.showInputBox({
                // Sets it so the input box doesn't close when window focus is lost.
                ignoreFocusOut: true,
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
                yield vscode.workspace.getConfiguration('discode').update('webhook', firstInput, vscode.ConfigurationTarget.Global);
                // Checks if there was an input for the name that's meant to appear in the embed.
                if (secondInput) {
                    // Updates the global configuration file to include the inputted name.
                    yield vscode.workspace.getConfiguration('discode').update('name', secondInput, vscode.ConfigurationTarget.Global);
                }
                // Checks if there was an input for the avatar that's meant to appear in the embed.
                if (thirdInput) {
                    // Updates the global configuration file to include the inputted avatar.
                    yield vscode.workspace.getConfiguration('discode').update('avatar', thirdInput, vscode.ConfigurationTarget.Global);
                }
                // Alerts the user that the configuration was successfully set up.
                yield vscode.window.showInformationMessage('Successfully set a webhook!');
            }
        }));
        // The "share" command.
        let share = vscode.commands.registerCommand('discode.share', () => __awaiter(this, void 0, void 0, function* () {
            // Checks if the extension has not been set up.
            if (!vscode.workspace.getConfiguration('discode').get('webhook') || !vscode.workspace.getConfiguration('discode').get('name')) {
                // Alerts the user that the extension has not been set up.
                yield vscode.window.showErrorMessage('Discode has not been set up! Please use the "Set a Webhook" command through the Command Palette or configure it in the settings.');
            }
            else {
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
                    const hook = new discord_webhook_node_1.Webhook({
                        url: `${vscode.workspace.getConfiguration('discode').get('webhook')}`,
                        retryOnLimit: false
                    });
                    // Calculates how much whitespace is needed to be removed.
                    const whitespaceAmount = text.length - text.trimLeft().length;
                    // Separates code to lines.
                    const codeLines = eol.split(text);
                    // An array variable that will contain the final code.
                    let code = [];
                    // For each line in the code it executes a function.
                    codeLines.forEach(function (line) {
                        // Adds line to the "code" array.
                        code.push(line.substring(whitespaceAmount));
                    });
                    // Checks if the code is too long to send in an embed.
                    if (`${code}`.length > 1024) {
                        // Tries to execute the code below and catches an error if one occurs.
                        try {
                            // Creates a hastebin link of the code.
                            const haste = yield hastebin.createPaste(`${code.join('\n')}`, {
                                // Hastebin link options.
                                raw: false,
                                // @ts-ignore
                                contentType: document.languageId,
                                server: 'https://hastebin.com'
                            });
                            // Creates an embed that gets sent to the Discord webhook.
                            let embed = new discord_webhook_node_1.MessageBuilder()
                                // Sets the embed's current timestamp.
                                .setTimestamp()
                                // Sets the embed's color.
                                .setColor(0x27b5f4)
                                // Sets the embed's description.
                                .setDescription(`Check out the code here: [Hastebin](${haste})`)
                                // Sets the embed's footer.
                                .setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png');
                            // Checks if there's no avatar in the configuration.
                            if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
                                // Sets the embed's author.
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
                            }
                            else {
                                // Sets the embed's author.
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
                            }
                            // Sends a request to the webhook.
                            yield hook.send(embed);
                            // Alerts the user that the code was successfully shared.
                            yield vscode.window.showInformationMessage('Successfully shared code to Discord!');
                        }
                        catch (error) {
                            console.log(error);
                            // Alerts the user that the Discode configuration is not valid.
                            yield vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
                        }
                    }
                    else {
                        // Tries to execute the code below and catches an error if one occurs.
                        try {
                            // Creates an embed that gets sent to the Discord webhook.
                            let embed = new discord_webhook_node_1.MessageBuilder()
                                // Sets the embed's current timestamp.
                                .setTimestamp()
                                // Sets the embed's color.
                                .setColor(0x27b5f4)
                                // Sets the embed's description.
                                .setDescription(`\`\`\`${document.languageId}\n${code.join('\n')}\`\`\``)
                                // Sets the embed's footer.
                                .setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png');
                            // Checks if there's no avatar in the configuration.
                            if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
                                // Sets the embed's author.
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
                            }
                            else {
                                // Sets the embed's author.
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
                            }
                            // Sends a request to the webhook.
                            yield hook.send(embed);
                            // Alerts the user that the code was successfully shared.
                            yield vscode.window.showInformationMessage('Successfully shared code to Discord!');
                        }
                        catch (error) {
                            console.log(error);
                            // Alerts the user that the Discode configuration is not valid.
                            yield vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
                        }
                    }
                }
            }
        }));
        // Registers the "set" command.
        context.subscriptions.push(set);
        // Registers the "share" command.
        context.subscriptions.push(share);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map