import PDFExportConfig from "./PDFExportConfig";
import DriveUtilities from "./DriveUtilities";

export default class PDFCreator {
    private _driveUtilities: DriveUtilities;

    constructor(driveUtilities: DriveUtilities) {
        this._driveUtilities = driveUtilities;
    }

    generatePDF(file: GoogleAppsScript.Drive.File, config: PDFExportConfig) {
        console.info("Start - Creating the PDF");

        const pdf = file.getAs('application/pdf');

        this.exportPdf(file, pdf, config);

        console.info("Finish - Creating the PDF");
    }

    private exportPdf(file: GoogleAppsScript.Drive.File, pdf: GoogleAppsScript.Base.Blob, config: PDFExportConfig) {
        let existingFiles = this._driveUtilities.getFilesByName(
            pdf.getName(),
            config.destinationDriveName,
            config.destinationFolderName
        );

        if (existingFiles.length > 0) {
            console.info(`Updating existing PDF`);

            let existingFile = DriveApp.getFileById(existingFiles[0].id)

            if (file.getLastUpdated().valueOf() > existingFile.getLastUpdated().valueOf()) {
                console.log("File has changed since last exported - exporting")
                this._driveUtilities.updatePDF(existingFiles[0].id, pdf);
            } else {
                console.log("File has NOT changed since last exported - NOT exporting")
            }
        } else {
            console.info(`Generating new PDF`);
            this._driveUtilities.generatePDF(pdf.getName(), pdf, config.destinationFolderName, config.destinationDriveName);
        }
    }
}