# Discode

A Visual Studio Code extension that allows you to share code to Discord with webhooks.

## Usage

After installing the extension, open up the Command Palette and under "Discode" use the "Set A Webhook" command.
This command can also be used to update an existing webhook, and while you can configure it in the settings it is generally recommended to do so with the command.

![settingUp](images/settingUp.png)

After you're done setting up, all it takes is to select text, right click and press "Share Code To Discord"!

![usage](images/usage.png)

![result](images/result.png)

*You can also use the same command through the Command Palette.*

## Extension Settings

This extension contributes the following settings:

* `discode.webhook`: The webhook the extension uses to share the code to.
* `discode.name`: The name that gets set as the embed's author.
* `discode.avatar`: The image that gets set as the embed's author's avatar.

## Known Issues

* Indented code gets sent without getting the unnecessary indent removed first.
* Currently you cannot share code longer than 1024 characters, it is already planned to make it send a file instead when the limit is reached.

## Release Notes

### Release 1.0.0

Initial release of Discode.
