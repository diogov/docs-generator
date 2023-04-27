import PDFExportConfig from "./PDFExportConfig";

export default class ConfigLoader {
    loadConfig(): PDFExportConfig[] {
        let scriptProperties = PropertiesService.getScriptProperties();

        if (scriptProperties.getKeys().indexOf('config-file-id') == -1) {
            throw new Error("No script property set 'config-file-id'. Please set this to the location of the config file");
        }

        let configFileId = scriptProperties.getProperty("config-file-id");
        console.info(`Loading config from ${configFileId}`);

        let configFile = DriveApp.getFileById(configFileId);
        let configText = configFile.getBlob().getDataAsString();

        console.info(configText)

        const config = JSON.parse(configText);
        const mergeConfig: PDFExportConfig[] = [];

        config.forEach(configEntry => {
            mergeConfig.push(new PDFExportConfig(
                configEntry.destinationFolderName,
                configEntry.destinationDriveName,
                configEntry.documentFolderName,
                configEntry.documentDriveName,
                configEntry.documentNames,
            ))
        });

        return mergeConfig;
    }
}