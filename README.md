# e-Daiary

This plugin was created to make daily entries in a journal based on the day of the year.

## How to install?

1. Download the lastest release e-daiary.zip file.
2. Extract the folder.
3. Put it inside the following folder: "\\YourVault\\.obsidian\\plugins\\".
4. Open your Vault using Obsidian.
5. Enable "Community plugin" on Obsidian Settings.
6. Enable the "e-Daiary" plugin.
7. Click "Options" and select the folder where you want your journal to be created.
8. Click on the Ribbon Icon "Create New Entry".
9. This will automatically create a "YYYY\\Day X (DD-MM-YYYY HH-mm)\\Day X (DD-MM-YYYY HH-mm).md" folder inside the folder.
10. Write your journal inside the "Day X (DD-MM-YYYY HH-mm).md" file.
11. Repeat step 8-10 every day to create a consistent journal.

## How to modify?
1. Download the source code.
2. Make sure you have [NodeJS](https://nodejs.org/en/download/package-manager) installed.
3. Open it inside [VSCode](https://code.visualstudio.com/download).
4. Open a terminal.
5. Install the dependencies:
	1. `npm install`
6. Start compilation in watch mode
	1. `npm run dev`
7. Once finished the coding, use the command below to end the coding:
	1. `npm run build`
8. After that, follow the instructions in: [this website](https://publish.obsidian.md/hub/04+-+Guides%2C+Workflows%2C+%26+Courses/Guides/How+to+release+a+new+version+of+your+plugin) to update the plugin.

## Authors

  - **Thomas Campanholi** - *coded everything* -
    [wholetomy](https://github.com/wholetomy/)
