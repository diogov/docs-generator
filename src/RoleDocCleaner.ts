import RoleDoc from './RoleDoc';
import RoleSheet from './RoleSheet';

export default class RoleDocCleaner {

    static removeSectionsContainingNoMatchedKeys(body): void {
        const paragraphs = body.getParagraphs();

        for (let idxP = 0; idxP < paragraphs.length; idxP++) {
            if (paragraphs[idxP].findText(RoleSheet.KEY_OBJECT_REGEX)) {
                RoleDocCleaner.removeParagraphsAboveKeyParagraphUntilTitleIsFound(paragraphs, idxP, body);
                const refIdx = RoleDocCleaner.removeKeyParagraphAndParagraphsBelowUntilTitleIsFound(paragraphs, idxP, body);
                idxP = refIdx;
            }
        }
    }

    private static removeParagraphsAboveKeyParagraphUntilTitleIsFound(paragraphs, keyIdxP: number, body): void {
        let paragraph = paragraphs[keyIdxP];

        //getAttributes() sometimes returns null attributes. 
        //Fortunatelly this is only happening for title paragraphs right now, which also helps us to differentiate those ones
        for (let idxP = keyIdxP - 1; idxP >= 0 && !RoleDocCleaner.isTitle(paragraph); idxP--) {
            paragraph = paragraphs[idxP];
            body.removeChild(paragraph);
        }
    }

    private static removeKeyParagraphAndParagraphsBelowUntilTitleIsFound(paragraphs, keyIdxP: number, body): number {
        let idxP: number;
        for (idxP = keyIdxP; idxP < paragraphs.length; idxP++) {
            const paragraph = paragraphs[idxP];
            if (RoleDocCleaner.isTitle(paragraph)) {
                break;
            }
            if (idxP == paragraphs.length - 1) { // it's not possible to remove the last paragraph
                body.appendParagraph('');
            }
            body.removeChild(paragraph);
        }
        return idxP;
    }

    private static isTitle(paragraph): boolean {
        //getAttributes() sometimes returns null attributes. 
        //Right now this is only happening for title paragraphs, which is not totally bad as it also helps to differentiate those ones
        const fontSize = paragraph.getAttributes().FONT_SIZE;
        return !fontSize || fontSize >= RoleDoc.MIN_FONT_SIZE_SECTION_TITLE;
    }

    //The unique goal of this function is to remove the last blank paragraphs. 
    //It is not possible to remove last paragraphs with body.removeChild(paragraph)....
    static removeLastEmptyParagraphFromScriptToAvoidBlankPage(docId: number): void {
        const contents = Docs.Documents.get(docId, {
            fields: 'body.content'
        }).body.content;

        let idxParagraphToExclude = contents.length;

        for (let i = contents.length - 1; i >= 0; i--) {
            const contentObj = contents[i];

            if (contentObj.endIndex - contentObj.startIndex > 1)
                break;
            if (!contentObj.paragraph || !contentObj.paragraph.elements)
                break;

            const elements = contentObj.paragraph.elements;
            if (elements.length == 0 || !elements[0].textRun || elements[0].textRun.content !== '\n')
                break;
            
            idxParagraphToExclude--;
        }

        if (idxParagraphToExclude == contents.length)
            return;

        const startIdx = contents[idxParagraphToExclude].startIndex;
        const endIdx = contents[contents.length - 1].endIndex;

        const requests = [{
            deleteContentRange: {
                range: { startIndex: startIdx - 1, endIndex: endIdx - 1 }
            }
        }];
        Docs.Documents.batchUpdate({ requests: requests }, docId);
    }
}