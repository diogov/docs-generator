import PDFCreator from "./PDFCreator";
import DriveUtilities from "./DriveUtilities";
import ConfigLoader from "./ConfigLoader";

function entryPoint() {
    const driveUtilities = new DriveUtilities();
    const pdfCreator = new PDFCreator(driveUtilities);

    let configLoader = new ConfigLoader();
    const config = configLoader.loadConfig()

    config.forEach(configItem => {
        configItem.documentNames.forEach(documentName => {
            console.time("PDF Export");

            let document = driveUtilities.getFileByName(
                documentName,
                configItem.documentDriveName,
                configItem.documentFolderName,
            )

            let file = DriveApp.getFileById(document.id);
            pdfCreator.generatePDF(file, configItem);

            console.timeEnd("PDF Export");
        })
    });
}

