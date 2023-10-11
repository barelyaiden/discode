# Discode

A Visual Studio Code extension that allows you to share code to Discord with webhooks.

*[Make sure to join the official Discode Discord server here!](https://discord.gg/Cm3ADqfPpp)*

## Usage

After installing the extension, open up the Command Palette and under "Discode" use the "Set a Webhook" command.
This command can also be used to update an existing webhook, and while you can configure it in the settings it is generally recommended to do so with the command.

![settingUp](images/settingUp.png)

After you're done setting up, all it takes is to select text, right click and press "Share Code to Discord"!

![usage](images/usage.png)

![result](images/result.png)

*You can also use the same command through the Command Palette.*

## Extension Settings

This extension contributes the following settings:

* `discode.webhook`: The webhook the extension uses to share the code to.
* `discode.webhookSecond`: An additional second webhook.
* `discode.webhookThird`: An additional third webhook.
* `discode.name`: The name that gets set as the embed's author.
* `discode.avatar`: The image that gets set as the embed's author's avatar.

## Known Issues

* None so far!

## Release Notes

### Release 2.0.1

* Added additional two webhook slots.
* Removed the "Community Projects" section from the README.

### Release 2.0.0

* Major code and file restructuring.
* Re-added support for generating Hastebin links for longer code.

### Release 1.1.3

* Added support for Discord Canary and PTB webhook links.
* Added "Community Projects" section in the README.md file.

### Release 1.1.2

* Removed Hastebin share feature due to outdated and incompatible modules.
* Upped long code length limit to Discord's maximum message length limit (2000 characters).
* Embed now shows the file name above the code.

### Release 1.1.1

* Hotfix for Release 1.1.0 throwing an error when attempting to share code.

### Release 1.1.0

* "Set a Webhook" command's input boxes don't disappear now if window focus is lost.
* Code longer than 1024 characters is now sent through a Hastebin link.
* Unnecessary whitespace is now removed from selection.
* The embed's footer now has Discode's logo.
* Grammatical fixes.

### Release 1.0.0

* Initial release of Discode.
