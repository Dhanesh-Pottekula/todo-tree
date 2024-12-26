import * as vscode from 'vscode';
import { applyTodoDecorations } from '../services/textDecorations';
import { getTodos } from './getTodos';

interface Todo {
  file: string;
  line: number;
  text: string;
  todoStartIndex:number;
}

class FileItem extends vscode.TreeItem {
  children: TodoItem[] = [];

  constructor(fileName: string, resourceUri: vscode.Uri) {
    super(fileName, vscode.TreeItemCollapsibleState.Collapsed);
    this.resourceUri = resourceUri;
  }
}

class TodoItem extends vscode.TreeItem {
  constructor(label: string, line: number, resourceUri: vscode.Uri) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: 'todo-tree.openTodo',
      title: 'Open TODO',
      arguments: [resourceUri, line],
    };
  }
}

export class TodoTreeDataProvider implements vscode.TreeDataProvider<FileItem | TodoItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> =
    new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private files: FileItem[] = [];

  async refresh(): Promise<void> {
    const todoData: Todo[] = await getTodos();

    // Group TODOs by file
    const groupedByFile = todoData.reduce((acc, todo) => {
      if (!acc[todo.file]) {
        acc[todo.file] = [];
      }
      acc[todo.file].push(todo);
      return acc;
    }, {} as Record<string, Todo[]>);

// Apply decorations
applyTodoDecorations(todoData);

    // Create tree structure
    this.files = Object.entries(groupedByFile).map(([filePath, todos]) => {
      const fileName = vscode.workspace.asRelativePath(filePath);
      const fileItem = new FileItem(fileName, vscode.Uri.file(filePath));

      fileItem.children = todos.map(
        (todo) =>
          new TodoItem(`Line ${todo.line}: ${todo.text.trim()}`, todo.line, vscode.Uri.file(todo.file))
      );

      return fileItem;
    });

    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem | TodoItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): (FileItem | TodoItem)[] {
    if (!element) {
      // Top-level: Return files
      return this.files;
    }
    // File level: Return TODOs
    return element.children;
  }
}


// Extension activation
export function onActivateOpenStartScan(context: vscode.ExtensionContext) {
  const todoTreeDataProvider = new TodoTreeDataProvider();

  vscode.window.registerTreeDataProvider('vstodo-sidebar', todoTreeDataProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('todo-tree.refresh', () => todoTreeDataProvider.refresh())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('todo-tree.openTodo', (uri: vscode.Uri, line: number) => {
      vscode.window.showTextDocument(uri).then((editor) => {
        const position = new vscode.Position(line - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
      });
    })
  );

  todoTreeDataProvider.refresh();
}
