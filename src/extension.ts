// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	console.log("started");

	if (!await checkForPython()) {

	}


	//register sidebar dataprovider  
	vscode.window.registerTreeDataProvider("actions", new DataProv());


	let newUiCommand = vscode.commands.registerCommand("pyside6.new-ui", async () => {
		let location = await vscode.window.showSaveDialog();
		if (!location) { return; }
		let pathParts = location.path.split("/");
		let cwd = pathParts.slice(0, Math.max(0, pathParts.length - 1)).join("/");
		let name = pathParts.slice(-1).join("/");
		const processOptions: vscode.ProcessExecutionOptions = {
			"cwd": cwd,
		};
		let pyside6Execution = new vscode.ProcessExecution("pyside6-project", ["new-ui", name], processOptions);
		const taskDef: vscode.TaskDefinition = {
			type: 'create'
		};
		let task = new vscode.Task(
			taskDef,
			vscode.TaskScope.Workspace,
			"pyside6-project-new-ui",
			"pyside6-new-ui",
			pyside6Execution
		);
		const out = await vscode.tasks.executeTask(task);
		// switching the Workspace was to fast, folder didnt existed then    
		setTimeout(async () => await vscode.commands.executeCommand("vscode.openFolder", location), 2000);
	});

	const buildProject = vscode.commands.registerCommand("pyside6.build-project", async () => {
		let pyside6Execution = new vscode.ProcessExecution("pyside6-project", ["build"]);
		const taskDef: vscode.TaskDefinition = {
			type: 'build'
		};
		let task = new vscode.Task(
			taskDef,
			vscode.TaskScope.Workspace,
			"pyside6-project-build",
			"pyside6",
			pyside6Execution
		);
		const out = await vscode.tasks.executeTask(task);
	});

	const runProject = vscode.commands.registerCommand("pyside6.run-project", async () => {
		let pyside6Execution = new vscode.ProcessExecution("pyside6-project", ["run"]);
		const taskDef: vscode.TaskDefinition = {
			type: 'run'
		};
		let task = new vscode.Task(
			taskDef,
			vscode.TaskScope.Workspace,
			"pyside6-project-run",
			"pyside6",
			pyside6Execution
		);
		const out = await vscode.tasks.executeTask(task);
	});

	const openDesigner = vscode.commands.registerCommand("pyside6.open-designer", async (path: vscode.Uri|undefined) => { 
		const openOptions: vscode.OpenDialogOptions = {
			canSelectFiles: true,
			filters: {
				"qtUi": ["ui"],
				"all": ["*"]
			},
			canSelectMany: false,
		};
		path ||= await findUiFile() || await vscode.window.showOpenDialog(openOptions).then((x) => x && x[0]);
		if (!path) { return; }
		const pyside6Execution = new vscode.ProcessExecution("pyside6-designer", [path.fsPath]);
		const taskDef: vscode.TaskDefinition = {
			type: 'Editor'
		};
		let task = new vscode.Task(
			taskDef,
			vscode.TaskScope.Workspace,
			"pyside6-designer",
			"pyside6",
			pyside6Execution
		);
		let execution = await vscode.tasks.executeTask(task);
	});



	context.subscriptions.push(openDesigner);
	context.subscriptions.push(buildProject);
	context.subscriptions.push(runProject);
	context.subscriptions.push(newUiCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Provides Commands to the Sidebar
class DataProv implements vscode.TreeDataProvider<vscode.TreeItem> {
	onDidChangeTreeData?: vscode.Event<void | vscode.TreeItem | vscode.TreeItem[] | null | undefined> | undefined;
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}
	getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
		let children: vscode.TreeItem[] = [];
		let newUiItem = new vscode.TreeItem("new ui project");
		newUiItem.command = {
			title: 'new-ui',
			command: 'pyside6.new-ui'
		};
		let build = new vscode.TreeItem("build project");
		build.command = {
			title: "build project",
			command: "pyside6.build-project"
		};
		let run = new vscode.TreeItem("run project");
		run.command = {
			title: "run project",
			command: "pyside6.run-project"
		};
		let openDesigner = new vscode.TreeItem("open designer");
		openDesigner.command = {
			title: "open designer",
			command: "pyside6.open-designer"
		};
		children.push(...[newUiItem, build, run, openDesigner]);
		return Promise.resolve(children);
	}
}

async function findUiFile(): Promise<vscode.Uri | null> {
	let files = await vscode.workspace.findFiles("**/*.ui", null, 2); 
	if (files.length === 1) {return files[0];} 
	return null;
}	


function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkForPython(): Promise<boolean> {

	return false;
}
