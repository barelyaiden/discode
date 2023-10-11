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
const vscode = require("vscode");
const eol = require("eol");
const discord_webhook_node_1 = require("discord-webhook-node");
const hastebin = require('hastebin-save');
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('The "Discode" extension has been loaded successfully.');
        function setWebhook(count = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                const webhookInput = yield vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: 'Input a valid Discord webhook link.',
                    validateInput: text => {
                        var expr = /(https?):\/\/((?:ptb\.|canary\.)?discord(?:app)?\.com)\/api(?:\/)?(v\d{1,2})?\/webhooks\/(\d{17,19})\/([\w\-]{68})/i;
                        return expr.test(text) ? null : 'That is not a valid Discord webhook link.';
                    }
                });
                if (count === 1) {
                    const nameInput = yield vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        placeHolder: 'Input a name to show in the embed. Make sure it\'s less than 32 characters.',
                        validateInput: text => {
                            return text.length <= 32 ? null : 'That name is too long.';
                        }
                    });
                    const avatarInput = yield vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        placeHolder: 'Input an image link to show in the embed as the avatar. Supported formats: png, jpg, gif.',
                        validateInput: text => {
                            return text.endsWith('png') || text.endsWith('jpeg') || text.endsWith('jpg') || text.endsWith('gif') ? null : 'That format is not supported.';
                        }
                    });
                    if (webhookInput) {
                        yield vscode.workspace.getConfiguration('discode').update('webhook', webhookInput, vscode.ConfigurationTarget.Global);
                        if (nameInput) {
                            yield vscode.workspace.getConfiguration('discode').update('name', nameInput, vscode.ConfigurationTarget.Global);
                        }
                        if (avatarInput) {
                            yield vscode.workspace.getConfiguration('discode').update('avatar', avatarInput, vscode.ConfigurationTarget.Global);
                        }
                    }
                }
                else {
                    if (webhookInput) {
                        switch (count) {
                            case 2:
                                yield vscode.workspace.getConfiguration('discode').update('webhookSecond', webhookInput, vscode.ConfigurationTarget.Global);
                                break;
                            case 3:
                                yield vscode.workspace.getConfiguration('discode').update('webhookThird', webhookInput, vscode.ConfigurationTarget.Global);
                                break;
                        }
                    }
                }
                yield vscode.window.showInformationMessage('Successfully set a webhook!');
            });
        }
        function shareCode(count = 1) {
            return __awaiter(this, void 0, void 0, function* () {
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
                    let currentHook;
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
                    const hook = new discord_webhook_node_1.Webhook({
                        url: currentHook,
                        retryOnLimit: false
                    });
                    const whitespaceAmount = text.length - text.trimLeft().length;
                    const codeLines = eol.split(text);
                    let code = [];
                    codeLines.forEach(function (line) {
                        code.push(line.substring(whitespaceAmount));
                    });
                    if (`${code}`.length > 2048) {
                        try {
                            let hastebinLink;
                            // @ts-ignore
                            yield hastebin.upload(`${code.join('\n')}`, link => {
                                hastebinLink = `https://hastebin.com/${link}`;
                            });
                            vscode.window.showInformationMessage('Please wait...');
                            setTimeout(function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    let embed = new discord_webhook_node_1.MessageBuilder()
                                        .setColor(0x27b5f4)
                                        .setDescription(`**${document.fileName.substring(document.fileName.lastIndexOf('\\') + 1)}**\n${hastebinLink}`)
                                        .setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png')
                                        .setTimestamp();
                                    if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
                                        embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
                                    }
                                    else {
                                        embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
                                    }
                                    yield hook.send(embed);
                                    yield vscode.window.showInformationMessage('Successfully shared code to Discord!');
                                });
                            }, 3000);
                        }
                        catch (error) {
                            console.log(error);
                            yield vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
                        }
                    }
                    else {
                        try {
                            let embed = new discord_webhook_node_1.MessageBuilder()
                                .setColor(0x27b5f4)
                                .setDescription(`**${document.fileName.substring(document.fileName.lastIndexOf('\\') + 1)}**\`\`\`${document.languageId}\n${code.join('\n')}\`\`\``)
                                .setFooter('Sent with Discode from Visual Studio Code', 'https://cdn.discordapp.com/attachments/798580610686779392/798580822641868870/embedIcon.png')
                                .setTimestamp();
                            if (!vscode.workspace.getConfiguration('discode').get('avatar')) {
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`);
                            }
                            else {
                                embed.setAuthor(`${vscode.workspace.getConfiguration('discode').get('name')}`, `${vscode.workspace.getConfiguration('discode').get('avatar')}`);
                            }
                            yield hook.send(embed);
                            yield vscode.window.showInformationMessage('Successfully shared code to Discord!');
                        }
                        catch (error) {
                            console.log(error);
                            yield vscode.window.showErrorMessage('The webhook configuration is invalid! Please check if everything is correct in the settings or use the "Set a Webhook" command through the Command Palette.');
                        }
                    }
                }
            });
        }
        let set = vscode.commands.registerCommand('discode.set', () => __awaiter(this, void 0, void 0, function* () {
            yield setWebhook(1);
        }));
        let setSecond = vscode.commands.registerCommand('discode.setSecond', () => __awaiter(this, void 0, void 0, function* () {
            yield setWebhook(2);
        }));
        let setThird = vscode.commands.registerCommand('discode.setThird', () => __awaiter(this, void 0, void 0, function* () {
            yield setWebhook(3);
        }));
        let share = vscode.commands.registerCommand('discode.share', () => __awaiter(this, void 0, void 0, function* () {
            yield shareCode(1);
        }));
        let shareSecond = vscode.commands.registerCommand('discode.shareSecond', () => __awaiter(this, void 0, void 0, function* () {
            yield shareCode(2);
        }));
        let shareThird = vscode.commands.registerCommand('discode.shareThird', () => __awaiter(this, void 0, void 0, function* () {
            yield shareCode(3);
        }));
        context.subscriptions.push(set);
        context.subscriptions.push(setSecond);
        context.subscriptions.push(setThird);
        context.subscriptions.push(share);
        context.subscriptions.push(shareSecond);
        context.subscriptions.push(shareThird);
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map