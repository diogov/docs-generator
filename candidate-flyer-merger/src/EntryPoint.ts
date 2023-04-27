import FlyerMerger from "./FlyerMerger";
import PDFCreator from "./PDFCreator";
import DriveUtilities from "./DriveUtilities";
import ConfigLoader from "./ConfigLoader";

function entryPoint() {
    const driveUtilities = new DriveUtilities();
    const flyerMerger = new FlyerMerger(driveUtilities);
    const pdfCreator = new PDFCreator(driveUtilities);

    let configLoader = new ConfigLoader();
    const config = configLoader.loadConfig()

    config.forEach(configItem => {
        console.time("Flyer Merge");

        let presentation = flyerMerger.mergeRoleFlyer(configItem);
        pdfCreator.createRoleFlyerPDF(presentation.getId(), configItem);

        console.timeEnd("Flyer Merge");
    });
}

