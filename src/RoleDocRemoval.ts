import RoleDoc from './RoleDoc';
import RoleSheet from './RoleSheet';

export default class RoleDocRemoval {

    static removeSectionsContainingNoMatchedKeys(body): void {
        const paragraphs = body.getParagraphs();

        for (let idx = 0; idx < paragraphs.length; idx++) {
            if (paragraphs[idx].findText(RoleSheet.KEY_OBJECT_REGEX)) {
                RoleDocRemoval.removeParagraphsAboveKeyParagraphUntilTitleIsFound(paragraphs, idx, body);

                const refIdx = RoleDocRemoval.removeKeyParagraphAndParagraphsBelowUntilTitleIsFound(paragraphs, idx, body);
                idx = refIdx;
            }
        }
    }

    private static removeParagraphsAboveKeyParagraphUntilTitleIsFound(paragraphs, keyIdx: number, body): void {
        const keyParagraph = paragraphs[keyIdx];

        //getAttributes() sometimes returns null attributes. 
        //Fortunatelly this is only happening for title paragraphs right now, which also helps us to differentiate those ones
        let fontSize = keyParagraph.getAttributes().FONT_SIZE;
        for (keyIdx = keyIdx - 1; keyIdx >= 0 && fontSize && fontSize < RoleDoc.MIN_FONT_SIZE_SECTION_TITLE; keyIdx--) {
            const prg = paragraphs[keyIdx];
            fontSize = prg.getAttributes().FONT_SIZE;
            body.removeChild(prg);
        }
    }

    private static removeKeyParagraphAndParagraphsBelowUntilTitleIsFound(paragraphs, prgIdx: number, body): number {
        for (; prgIdx < paragraphs.length; prgIdx++) {
            const prg = paragraphs[prgIdx];
            const fontSize = prg.getAttributes().FONT_SIZE;

            if (!fontSize || fontSize >= RoleDoc.MIN_FONT_SIZE_SECTION_TITLE) {
                break;
            }

            if (prgIdx == paragraphs.length - 1) { // it's not possible to remove the last paragraph
                body.appendParagraph('');
            }
            body.removeChild(prg);
        }
        return prgIdx;
    }

    //The unique goal of this function is to remove the last blank paragraphs. 
    //It is not possible to remove last paragraphs with body.removeChild(paragraph)....
    static removeLastEmptyParagraphFromScriptToAvoidBlankPage(docId: number): void {
        const contentElements = Docs.Documents.get(docId, {
            fields: 'body.content'
        }).body.content;

        let prgToExcludeIdx = contentElements.length;

        for (let i = contentElements.length - 1; i >= 0; i--) {
            const content = contentElements[i];

            if (content.endIndex - content.startIndex > 1)
                break;

            if (!content.paragraph || !content.paragraph.elements || content.paragraph.elements == 0)
                break;

            const elements = content.paragraph.elements;

            if (!elements[0].textRun || elements[0].textRun.content != '\n')
                break;

            prgToExcludeIdx--; 
        }

        if (prgToExcludeIdx == contentElements.length)
            return;

        const startIdx = contentElements[prgToExcludeIdx].startIndex;
        const endIdx = contentElements[contentElements.length-1].endIndex;

        const requests = [{
            deleteContentRange: {
                range: { startIndex: startIdx - 1, endIndex: endIdx - 1 }
            }
        }];
        
        Docs.Documents.batchUpdate({ requests: requests }, docId);
    }
}