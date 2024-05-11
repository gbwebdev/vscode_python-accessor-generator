import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.generateAccessors', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;

            // Get the editor's tab size setting
            const tabSize = editor.options.tabSize as number;
            const indentUnit = ' '.repeat(tabSize);

            // Define class and method indentation
            const classIndentation = indentUnit;
            const methodIndentation = indentUnit.repeat(2);

            // Get the selected text
            const selectedText = document.getText(selection);

            // Generate accessors with proper indentation
            const accessors = generateAccessors(selectedText, classIndentation, methodIndentation);

            // Insert accessors and select the inserted text
            editor.edit(editBuilder => {
                const position = selection.end;
                editBuilder.insert(position, '\n' + accessors);
            }).then(() => {
                // Calculate range of inserted text
                const linesAdded = accessors.split('\n').length;
                const start = selection.end.translate(1, 0);  // Move to the start of inserted text
                const endLineText = accessors.split('\n').pop() || '';
                const end = start.translate(linesAdded - 1, endLineText.length);
                const newSelection = new vscode.Selection(start, end);

                // Apply selection
                editor.selection = newSelection;
                editor.revealRange(new vscode.Range(start, end));
            });
        }
    });

    context.subscriptions.push(disposable);
}

function generateAccessors(selectedText: string, classIndentation: string, methodIndentation: string): string {
    const lines = selectedText.split('\n');
    let accessors = '';

    const pattern = /self\._(\w+)\s*:\s*(\w+)/;

    for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
            const [_, name, typ] = match;
            accessors += `
${classIndentation}@property
${classIndentation}def ${name}(self) -> ${typ}:
${methodIndentation}\"\"\"${name}

${methodIndentation}Returns:
${methodIndentation}    ${typ}: ${name}
${methodIndentation}\"\"\"
${methodIndentation}return self._${name}

${classIndentation}@${name}.setter
${classIndentation}def ${name}(self, ${name}: ${typ}):
${methodIndentation}\"\"\"${name}

${methodIndentation}Args:
${methodIndentation}    ${name} (${typ}): ${name}
${methodIndentation}\"\"\"
${methodIndentation}self._${name} = ${name}
`;
        }
    }
    return accessors;
}

export function deactivate() {}
