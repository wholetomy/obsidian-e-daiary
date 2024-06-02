import { Notice, Plugin, PluginSettingTab, Setting, moment } from 'obsidian';

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
        // Carrega as configurações do plugin
        await this.loadSettings();

        // Adiciona a aba de configurações
        this.addSettingTab(new EDaiarySettingTab(this.app, this));

        // Cria um ícone na barra lateral
        const ribbonIconEl = this.addRibbonIcon('create-new', 'Create New Entry', async (evt: MouseEvent) => {
            try {
                // Obtém a data e hora atuais
                const today = new Date();
                const currentYear = today.getFullYear().toString();
                const formattedDate = moment(today).format('DD-MM-YYYY'); // Formatar como 'DD-MM-YYYY'
                const formattedDateTime = moment(today).format('DD-MM-YYYY HH-mm'); // Formatar como 'DD-MM-YYYY HH-mm'
                const startOfYear = new Date(today.getFullYear(), 0, 0);
                const diff = today.getTime() - startOfYear.getTime();
                const oneDay = 1000 * 60 * 60 * 24;
                const dayOfYear = Math.floor(diff / oneDay);
                const dayFolderName = `Dia ${dayOfYear} (${formattedDateTime})`;
                const yearFolderPath = `${this.settings.baseFolderPath}/${currentYear}`;
                const dayFolderPath = `${yearFolderPath}/${dayFolderName}`;
                const noteTitle = dayFolderName;
                const notePath = `${dayFolderPath}/${noteTitle}.md`;

                // Verifica se a pasta do ano já existe
                const yearDirExists = await this.app.vault.adapter.exists(yearFolderPath);

                if (!yearDirExists) {
                    // Cria a pasta do ano
                    await this.app.vault.createFolder(yearFolderPath);
                    console.log(`Directory ${yearFolderPath} created successfully!`);
                    new Notice(`Directory ${yearFolderPath} created successfully!`);
                } else {
                    console.log(`Directory ${yearFolderPath} already exists.`);
                    new Notice(`Directory ${yearFolderPath} already exists.`);
                }

                // Verifica se já existe uma pasta para o dia atual
                const dayFolders = await this.app.vault.adapter.list(yearFolderPath);
                const dayFolderExists = dayFolders.folders.some(folder => folder.includes(`Dia ${dayOfYear} (${formattedDate}`));

                if (!dayFolderExists) {
                    // Cria a pasta do dia
                    await this.app.vault.createFolder(dayFolderPath);
                    console.log(`Directory ${dayFolderPath} created successfully!`);
                    new Notice(`Directory ${dayFolderPath} created successfully!`);
                } else {
                    console.log(`A folder for today already exists.`);
                    new Notice(`A folder for today already exists.`);
                }

                // Verifica se a nota já existe
                const noteExists = await this.app.vault.adapter.exists(notePath);

                if (!noteExists && !dayFolderExists) {
                    // Cria a nova nota
                    await this.app.vault.create(notePath, ``);
                    console.log(`Note ${noteTitle} created successfully!`);
                    new Notice(`Note ${noteTitle} created successfully!`);
                } else if (dayFolderExists) {
                    console.log(`Note for today already exists in an existing folder.`);
                    new Notice(`Note for today already exists in an existing folder.`);
                }

            } catch (error) {
                console.error(`Failed to create directory or note:`, error);
                new Notice(`Failed to create directory or note: ${error.message}`);
            }
        });

        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');
    }

    onunload() {

    }

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

        containerEl.createEl('h2', { text: 'Settings for e-Daiary' });

        const folders = await this.plugin.app.vault.adapter.list('');
        const folderPaths = folders.folders;

        new Setting(containerEl)
            .setName('Base Folder Path')
            .setDesc('Select the base folder where the annual folders will be created.')
            .addDropdown(dropdown => {
                folderPaths.forEach(folder => {
                    dropdown.addOption(folder, folder);
                });
                dropdown.setValue(this.plugin.settings.baseFolderPath);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.baseFolderPath = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Custom Base Folder Path')
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
