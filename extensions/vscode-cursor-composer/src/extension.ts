import * as vscode from "vscode";

// Add an output channel
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  // Create output channel
  outputChannel = vscode.window.createOutputChannel("Cursor Composer");
  outputChannel.show();

  outputChannel.appendLine("Cursor Composer extension is now active!");

  // Register URI handler
  const uriHandler = vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
      outputChannel.appendLine("\nReceived URI request:");
      outputChannel.appendLine(`Full URI: ${uri.toString()}`);
      outputChannel.appendLine(`Scheme: ${uri.scheme}`);
      outputChannel.appendLine(`Authority: ${uri.authority}`);
      outputChannel.appendLine(`Path: ${uri.path}`);
      outputChannel.appendLine(`Query: ${uri.query}`);

      // Handle both cursor:// and vscode:// protocols
      if (uri.scheme === "cursor" || uri.scheme === "vscode-cursor-composer") {
        let errorText = "";

        // Handle different URI formats
        if (uri.path.startsWith("/composer/")) {
          errorText = decodeURIComponent(uri.path.replace("/composer/", ""));
        } else if (uri.query) {
          // Handle query parameters if present
          const params = new URLSearchParams(uri.query);
          errorText = params.get("text") || "";
        } else {
          // Fallback to the whole path
          errorText = decodeURIComponent(uri.path.slice(1));
        }

        console.log("Decoded error text:", errorText);

        if (!errorText) {
          vscode.window.showErrorMessage("No error text provided in URI");
          return;
        }

        vscode.window.showInformationMessage(
          `Received error text via ${uri.scheme}://, attempting to send to Cursor...`
        );

        return openComposer(errorText).then(() => undefined);
      }
    },
  });

  context.subscriptions.push(uriHandler);

  // Register command for testing
  const commandHandler = vscode.commands.registerCommand(
    "cursor-composer.openError",
    async () => {
      const testMessage = "This is a test message for Cursor chat";
      console.log("Testing with message:", testMessage);
      await openComposer(testMessage);
    }
  );

  context.subscriptions.push(commandHandler);
}

async function openComposer(errorText: string): Promise<string | undefined> {
  try {
    outputChannel.appendLine("\nAttempting to open composer:");
    outputChannel.appendLine(`Error text: ${errorText}`);

    // Copy text to clipboard first
    await vscode.env.clipboard.writeText(errorText);
    outputChannel.appendLine("Text copied to clipboard");

    // Try to execute Cursor's chat command directly
    try {
      // Try different known Cursor commands
      const cursorCommands = [
        "cursor.newChat",
        "cursor.showChatPanel",
        "cursor.chat.focus",
      ];

      let success = false;
      for (const cmd of cursorCommands) {
        try {
          await vscode.commands.executeCommand(cmd);
          console.log(`Successfully executed ${cmd}`);
          success = true;
          break;
        } catch (err) {
          console.log(`Failed to execute ${cmd}:`, err);
        }
      }

      if (!success) {
        throw new Error("No Cursor commands worked");
      }
    } catch (err) {
      console.log(
        "Failed to execute Cursor commands, trying keyboard shortcut..."
      );

      // Try keyboard shortcut (Ctrl+Shift+P)
      await vscode.commands.executeCommand("workbench.action.quickOpen");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Send the keyboard shortcut for Cursor chat
      const cursorCommand = ">Cursor: New Chat";
      const input = await vscode.window.showInputBox({
        value: cursorCommand,
        prompt: "Press Enter to open Cursor chat",
      });

      if (!input) {
        throw new Error("Command cancelled");
      }

      // Execute the entered command
      await vscode.commands.executeCommand(
        "workbench.action.executeCommand",
        input.replace(">", "")
      );
    }

    // Wait for chat to open
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to paste
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    console.log("Tried to paste text");

    return vscode.window.showInformationMessage(
      "Error text sent to Cursor chat"
    );
  } catch (error) {
    outputChannel.appendLine(`Error: ${error}`);
    return vscode.window.showErrorMessage(
      "Failed to open Cursor composer: " + error
    );
  }
}

export function deactivate() {
  outputChannel.appendLine("Cursor Composer extension deactivated");
  outputChannel.dispose();
}
