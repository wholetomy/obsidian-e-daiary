import { Notice, Plugin, PluginSettingTab, Setting, moment, TFile, normalizePath } from 'obsidian';

// Interface para as configurações do plugin
interface EDaiarySettings {
    baseFolderPath: string;
}

// Configurações padrão
const DEFAULT_SETTINGS: EDaiarySettings = {
    baseFolderPath: 'Diaries'
};

export default class EDaiary extends Plugin {
    settings: EDaiarySettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new EDaiarySettingTab(this.app, this));
        
        this.addRibbonIcon('create-new', 'Create new entry', this.createNewEntry.bind(this))
            .addClass('my-plugin-ribbon-class');
        
        this.addCommand({
            id: 'create-new-entry',
            name: 'Create new entry',
            callback: this.createNewEntry.bind(this)
        });
    }

    async createNewEntry(evt?: MouseEvent) {
        try {
            const today = new Date();
            const currentYear = today.getFullYear().toString();
            const formattedDateTime = moment(today).format('DD-MM-YYYY HH-mm');
            const dayOfYear = this.getDayOfYear(today);

            const normalizedBaseFolderPath = normalizePath(this.settings.baseFolderPath);
            const yearFolderPath = normalizePath(`${normalizedBaseFolderPath}/${currentYear}`);

            let foldersCreated = 0;
            let notesCreated = 0;

            await this.ensureFolderExists(yearFolderPath);
            const lastDay = await this.getLastRecordedDay(yearFolderPath);

            let lastNotePath: string | null = null;

            for (let day = lastDay + 1; day <= dayOfYear; day++) {
                const currentDateTime = moment().format('DD-MM-YYYY HH-mm');
                const dayFolderName = `Dia ${day} (${currentDateTime})`;
                const dayFolderPath = normalizePath(`${yearFolderPath}/${dayFolderName}`);
                const noteTitle = dayFolderName;
                const notePath = normalizePath(`${dayFolderPath}/${noteTitle}.md`);

                if (await this.ensureFolderExists(dayFolderPath)) {
                    foldersCreated++;
                }
                if (await this.ensureNoteExists(notePath, noteTitle)) {
                    notesCreated++;
                }

                lastNotePath = notePath;
            }

            new Notice(`Created ${foldersCreated} folders and ${notesCreated} notes successfully!`);

            if (lastNotePath) {
                await this.openNoteIfExists(lastNotePath);
            }
        } catch (error) {
            console.error(`Failed to create directory or note:`, error);
            new Notice(`Failed to create directory or note: ${error.message}`);
        }
    }

    getDayOfYear(date: Date): number {
        const startOfYear = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    async ensureFolderExists(folderPath: string): Promise<boolean> {
        const exists = await this.app.vault.adapter.exists(folderPath);
        if (!exists) {
            await this.app.vault.createFolder(folderPath);
            return true;
        }
        return false;
    }

    async getLastRecordedDay(yearFolderPath: string): Promise<number> {
        const yearFolderContent = await this.app.vault.adapter.list(yearFolderPath);
        const dayFolders = yearFolderContent.folders.filter(folder => folder.includes('Dia'));
        if (dayFolders.length === 0) return 0;

        return Math.max(...dayFolders.map(folder => {
            const match = folder.match(/Dia (\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        }));
    }

    async ensureNoteExists(notePath: string, noteTitle: string): Promise<boolean> {
        const noteExists = await this.app.vault.adapter.exists(notePath);
        if (!noteExists) {
            await this.app.vault.create(notePath, ``);
            return true;
        }
        return false;
    }

    async openNoteIfExists(notePath: string) {
        const file = await this.app.vault.getAbstractFileByPath(notePath);
        if (file && file instanceof TFile) {
            const leaf = this.app.workspace.getLeaf(true);
            await leaf.openFile(file);
        } else {
            console.error(`Failed to open file: ${notePath}`);
            new Notice(`Failed to open file: ${notePath}`);
        }
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// Classe para a aba de configurações do plugin
class EDaiarySettingTab extends PluginSettingTab {
    plugin: EDaiary;

    constructor(app: any, plugin: EDaiary) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const { containerEl } = this;

        containerEl.empty();

        const folders = await this.plugin.app.vault.adapter.list('');
        const folderPaths = folders.folders.filter(folder => !/^\./.test(folder));

        new Setting(containerEl)
            .setName('Base folder path')
            .setDesc('Select the base folder where the annual folders will be created.')
            .addDropdown(dropdown => {
                folderPaths.forEach(folder => dropdown.addOption(folder, folder));
                dropdown.setValue(this.plugin.settings.baseFolderPath);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.baseFolderPath = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Custom base folder path')
            .setDesc('Or enter a custom base folder path.')
            .addText(text => text
                .setPlaceholder('Enter folder path')
                .setValue(this.plugin.settings.baseFolderPath)
                .onChange(async (value) => {
                    this.plugin.settings.baseFolderPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}
