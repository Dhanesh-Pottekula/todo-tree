import * as vscode from 'vscode';

interface Todo {
  file: string;
  line: number;
  text: string;
  todoStartIndex:number;
}
// Function to extract TODOs from files
export async function getTodos(): Promise<Todo[]> {
  const todos: Todo[] = [];
  const textDocuments = await vscode.workspace.findFiles('**/*.js', '**/node_modules/**');

  for (const file of textDocuments) {
    const content = (await vscode.workspace.fs.readFile(file)).toString();
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const match = line.match(/\/\/\s*TODO:\s*(.*)/);
      const todoStartIndex = line.indexOf('TODO:');
      if (match) {
        todos.push({
          file: file.fsPath,
          line: index + 1,
          text: match[0].trim(),
          todoStartIndex:todoStartIndex
        });
      }
    });
  }

  return todos;
}
