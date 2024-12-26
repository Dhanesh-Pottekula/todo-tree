import * as vscode from 'vscode';
import { getTodos } from '../providers/getTodos';



interface Todo {
    file: string;
    line: number;
    text: string;
    todoStartIndex:number;
  }

  const todoDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 223, 0, 0.2)', // Soft bright yellow for a light, energetic background
    color: '#F39C12', // Bright amber-orange for the text, making it more noticeable
    fontWeight: 'bold', // Bold text to make TODO stand out
    fontStyle: 'italic', // Italic for a subtle, modern look
    border: '1px solid rgba(255, 223, 0, 0.4)', // Border color matching the background
    borderRadius: '4px', // Rounded corners for a clean, modern look
  });
  
  
  
  export function applyTodoDecorations(todos: Todo[]) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const todoRanges: vscode.Range[] = [];
  console.log("todos")
      todos.forEach(todo => {
        // Find the position of the 'TODO:' keyword in the comment
        const todoMatch = todo.text.match(/\/\/\s*(TODO:)/);
        if (todoMatch) {
            const todoText = todoMatch[1]; 
          // Positioning based on the line number (1-based index to 0-based index)
          const startPos = new vscode.Position(todo.line - 1, todo?.todoStartIndex); // Start at 'TODO:'
          const endPos = new vscode.Position(todo.line - 1, todo?.todoStartIndex + todoText.length); // End after 'TODO:'
          
          const range = new vscode.Range(startPos, endPos);
          todoRanges.push(range);
        }
      });
  
      // Apply the decoration to the TODO ranges in the editor
      editor.setDecorations(todoDecorationType, todoRanges);
    }
  }
  vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (editor) {
      const todos = await getTodos(); // Retrieve TODOs again when active editor changes
      applyTodoDecorations(todos); // Reapply TODO decorations
    }
  });
  