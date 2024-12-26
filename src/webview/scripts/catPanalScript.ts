
const vscode = acquireVsCodeApi();
//post message - we communicate to extension through messages 
document.getElementById('myButton')?.addEventListener('click', () => {
    vscode.postMessage({
        command: 'buttonClicked',
        data: 'Hello from the external script!'
    });
});
