import * as vscode from 'vscode';
export function getWebviewContent(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
  const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri,'src', 'webview','scripts', 'catPanalScript.ts')
  );
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <button id="myButton">Click Me</button>
      <script src="${scriptUri}"></script>
  </body>
  </html>`;
}


export function onActivateOpenWebView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("open-webview.helloWorld", () => {
          const panel = vscode.window.createWebviewPanel(
            "Todo", // Identifies the type of the webview. Used internally
            "Cat Coding", // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
              enableScripts: true, // Allow running scripts in the webview
            } // Webview options. More on these later.
          );
          panel.webview.html = getWebviewContent(panel, context.extensionUri);
    
          panel.webview.onDidReceiveMessage(
            (message) => {
              switch (message.command) {
                case "buttonClicked":
                  vscode.window.showInformationMessage(message.data);
                  break;
              }
            },
            undefined,
            context.subscriptions
          );
          setTimeout(() => {
            vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
          }, 500);
        })
      );
}