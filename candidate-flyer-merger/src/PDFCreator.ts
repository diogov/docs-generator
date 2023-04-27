import FlyerMergeConfig from "./FlyerMergeConfig";
import DriveUtilities from "./DriveUtilities";

export default class PDFCreator {
    private _driveUtilities: DriveUtilities;

    constructor(driveUtilities: DriveUtilities) {
        this._driveUtilities = driveUtilities;
    }

    createRoleFlyerPDF(presentationId: string, config: FlyerMergeConfig) {
        console.info("Start - Creating the PDF");

        const outputFolderName = "Candidate Flyers - PDF";
        const presentationFile = DriveApp.getFileById(presentationId);
        const pdf = presentationFile.getAs('application/pdf');

        let existingFiles = this._driveUtilities.getFilesByName(
            pdf.getName(),
            config.destinationDriveName,
            outputFolderName
        );

        if (existingFiles.length > 0) {
            console.info(`Updating existing PDF`);
            this._driveUtilities.updatePDF(existingFiles[0].id, pdf);
        } else {
            console.info(`Generating new PDF`);
            this._driveUtilities.generatePDF(pdf.getName(), pdf, outputFolderName, config.destinationDriveName);
        }

        this._driveUtilities.removeFile(presentationId);

        console.info("Finish - Creating the PDF");
    }
}