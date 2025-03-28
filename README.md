> [!CAUTION]  
> This plugin makes use of an external API.

# Style Translation Plugin (Vencord)
Vencord plugin that allows you to style your message for fun. You can use this for free since it translate your message with the help of free LLM's from [openrouter](https://openrouter.ai/).

### Current Styles Available:
- **Enhanced:** Just enhances your message, making it better.
- **Early Modern English:** This wholly fashion thy message backward in time into the English of the past.
- **Godlike:** For by this transformative decree, thy words shall be utterly transfigured across the infinite expanse of time, resonating with celestial authority, and imbued with puissance that echoes through eternity.

## Installation
> [!IMPORTANT]  
> Inside the `Vencord` folder there is a folder called `src`. If you haven't already, create a folder called `userplugins` inside the `src` folder.

### Clone Installation (Recommended)
1. Navigate to your Vencord installation:
```
cd Vencord/src/userplugins
```
2. Clone the plugin repository:
```
git clone https://github.com/DevDomingoJohn/styleTranslation
```
3. Building Vencord:
```
pnpm build
```
4. Patch Vencord:
```
pnpm inject
```
For more Information about installing custom plugins in Vencord, check the [Official Vencord Docs](https://docs.vencord.dev/installing/custom-plugins/).

### Manual Installation (Not Recommended)
1. Click the green `<> Code` button at the top right of the repository and select Download ZIP
2. Unzip the downloaded ZIP file into the `userplugins` folder.
3. Ensure it's structured as `src/userplugins/styleTranslation`.
4. Run `pnpm build` in the terminal (command prompt/CMD) and the styleTranslation plugin should be added.
