// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	vscode.languages.registerInlayHintsProvider('markdown', new class implements vscode.InlayHintsProvider {

		provideInlayHints(document: vscode.TextDocument, range: vscode.Range): vscode.InlayHint[] {

			const result: vscode.InlayHint[] = [];
			const text = document.getText(range);

			let end = document.offsetAt(range.end);
			let pos = document.offsetAt(range.start);
			while (pos < end) {

				const fooIdx = text.indexOf('foo', pos);
				const barIdx = text.indexOf('bar', pos);

				if (barIdx < 0 && fooIdx < 0) {
					break; // not found
				}

				if (fooIdx < 0 || barIdx < fooIdx) {
					// before BAR
					const before = document.positionAt(barIdx);
					const part = new vscode.InlayHintLabelPart('foo');

					const firstFooIdx = text.indexOf('foo');
					if (firstFooIdx >= 0) {
						part.location = new vscode.Location(document.uri, document.positionAt(firstFooIdx));
					}

					const hint = new vscode.InlayHint([part], before);
					result.push(hint);
					pos = barIdx + 4;
					continue;
				}

				if (barIdx < 0 || fooIdx < barIdx) {
					// after FOO
					const after = document.positionAt(fooIdx + 3 /* 'foo'.length */);
					const part = new vscode.InlayHintLabelPart('bar');
					const hint = new vscode.InlayHint([part], after);
					result.push(hint);
					pos = fooIdx + 4;
					continue;
				}
			}

			return result;
		}

		async resolveInlayHint(hint: vscode.InlayHint): Promise<vscode.InlayHint> {
			await new Promise(resolve => setTimeout(resolve, 567));
			hint.tooltip = new vscode.MarkdownString('$(pass) Tooltip _resolved_!', true);
			return hint;
		}
	});

	vscode.languages.registerDefinitionProvider('markdown', new class implements vscode.DefinitionProvider {

		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

			const range = document.getWordRangeAtPosition(position);
			if (!range || document.getText(range) !== 'foo') {
				return undefined;
			}

			const result: vscode.Location[] = [];
			const text = document.getText();
			let pos = 0;
			while (true) {
				pos = text.indexOf('foo', pos);
				if (pos < 0) {
					break;
				}
				result.push(new vscode.Location(document.uri, document.positionAt(pos)));
				pos += 4;
			}

			return result;
		}
	});
}
