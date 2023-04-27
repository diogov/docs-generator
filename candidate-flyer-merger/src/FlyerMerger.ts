import FlyerMergeConfig from './FlyerMergeConfig'
import DriveUtilities from './DriveUtilities'

export default class FlyerMerger {
    private _driveUtilities: DriveUtilities;

    constructor(driveUtilities: DriveUtilities) {
        this._driveUtilities = driveUtilities;
    }

    mergeRoleFlyer(config: FlyerMergeConfig): GoogleAppsScript.Slides.Presentation {
        try {
            const templateSlides = this.getTemplateSlides(config);
            const presentation = this.createNewPresentation(config);

            return this.generateMergedPresentation(templateSlides, presentation, config);
        } catch (e) {
            console.error(e);
        }
    }

    private createNewPresentation(mergeConfig: FlyerMergeConfig): GoogleAppsScript.Slides.Presentation {
        console.info("Start - Creating new presentation");

        const presentation = SlidesApp.create(mergeConfig.presentationName);
        let presentationFile = SlidesApp.openById(presentation.getId());

        console.info("Finish - Creating new presentation");

        return presentationFile;
    }

    private getTemplateSlides(config: FlyerMergeConfig): GoogleAppsScript.Slides.Slide[] {
        console.info("Start - Getting the template slides");

        const templatePresentation = this._driveUtilities.getFileByName(
            config.templatePresentationName,
            config.templatePresentationDriveName,
            config.templatePresentationFolderName
        );

        const templateSlide = SlidesApp.openById(templatePresentation.id);
        const slides = templateSlide.getSlides();

        console.info("Finish - Getting the template slides");

        return slides;
    }

    private generateMergedPresentation(templateSlides: GoogleAppsScript.Slides.Slide[],
                                       presentation: GoogleAppsScript.Slides.Presentation,
                                       config: FlyerMergeConfig): GoogleAppsScript.Slides.Presentation {
        console.info("Start - Generating the merged presentation");

        let insertionIndex = this.getInsertionStartIndex(templateSlides);
        console.info(`Insertion index for new slides is ${insertionIndex}`);

        if (insertionIndex < 0) {
            throw new Error("Unable to detect the insertion index");
        }

        templateSlides.splice(insertionIndex, 1);
        templateSlides.forEach(slide => presentation.appendSlide(slide));

        //TODO - Geraint to add skip slide logic

        const disciplinePresentation = this._driveUtilities.getFileByName(
            config.disciplinePresentationName,
            config.disciplinePresentationDriveName,
            config.disciplinePresentationFolderName,
        );

        const disciplineSlides = SlidesApp.openById(disciplinePresentation.id).getSlides();
        disciplineSlides.forEach(slide => {
            console.info(`Inserting slide ${slide} at index ${insertionIndex}`)
            presentation.insertSlide(++insertionIndex, slide);
        });

        const slides = presentation.getSlides();
        slides[1].replaceAllText("{Role Name Article}", config.roleNameArticle);
        slides[1].replaceAllText("{Role Name}", config.roleName);
        slides[0].remove();

        presentation.saveAndClose();

        console.info("Finish - Generating the merged presentation");

        return presentation;
    }

    private getInsertionStartIndex(templateSlides) {
        const insertionSlide = templateSlides.find(slide => {
            let matchingShapes = slide.getShapes().filter(shape => {
                let shapeText = shape.getText().asString();

                return shapeText.search("<DisciplineSpecificProcessSlideInsertionPoint>") > -1;
            });

            return matchingShapes.length > 0;
        });

        return templateSlides.indexOf(insertionSlide)
    }
}

