import RoleSheet from './RoleSheet';

export default class RoleDoc {

    public static generateDoc(file, roleData: object) {
        const doc = DocumentApp.openById(file.getId());
        const body = doc.getBody();

        const keys = Object.keys(roleData);

        body.replaceText(RoleSheet.ROLE_KEY, roleData[RoleSheet.ROLE]);
        body.getParagraphs().forEach(paragraph => {
            const textParagraph = paragraph.getText();
            const key = RoleDoc.getKeyFromText(textParagraph, keys);

            RoleDoc.processParagraph(body, paragraph, key, roleData);
        });
        doc.saveAndClose();
    }

    private static processParagraph(body, paragraph, key: string | null, roleData: object): void {
        if (!key) 
            return;

        const attr = paragraph.getAttributes();
        const pattr = { FONT_SIZE : attr.FONT_SIZE, FOREGROUND_COLOR : attr.FOREGROUND_COLOR };

        if (key === RoleSheet.DESCRIPTION_KEY) {
            RoleDoc.processDescriptionParagraph(body, paragraph, pattr, roleData);
        }
        else {
            RoleDoc.processBulletPointParagraph(body, paragraph, pattr, key, roleData);
        }
    }

    private static processDescriptionParagraph(body, paragraph, pattr: object, roleData: object) {
        const ixElement = body.getChildIndex(paragraph);
        paragraph.replaceText(RoleSheet.DESCRIPTION_KEY, '');

        const items = roleData[RoleSheet.DESCRIPTION_KEY];
        
        let lastParagraph;
        let idxP = 1;        
        for (const itemText of items) {
            const linkObject = RoleSheet.getLinkObjectElementsOrNull(itemText);
            if (linkObject) {
                lastParagraph = RoleDoc.addParagraphWithUrl(body, ixElement + idxP, itemText, linkObject, pattr);
            }
            else {
                const newParagraph = body.insertParagraph(ixElement + idxP, itemText);
                newParagraph.setAttributes(pattr);
                lastParagraph = body.insertParagraph(ixElement + idxP + 1, '');
                lastParagraph.setAttributes(pattr);
            }
            idxP+=2;
        }
        body.removeChild(paragraph);
        body.removeChild(lastParagraph);
    }

    private static processBulletPointParagraph(body, paragraph, pattr: object, key: string, roleData: object) {
        const ixElement = body.getChildIndex(paragraph);
        paragraph.replaceText(key, '');

        const items = roleData[key];
        for (let idxBp = 0; idxBp < items.length; idxBp++) {
            const itemText = items[idxBp];
            const listItem = body.insertListItem(ixElement + idxBp + 1, itemText);
            listItem.setGlyphType(DocumentApp.GlyphType.BULLET);
            listItem.setAttributes(pattr);
        }
        body.removeChild(paragraph);
    }


    private static getKeyFromText(text: string, keys: string[]): string | null {
        for (const key of keys) {
            if (key.startsWith(RoleSheet.KEY_STARTS_WITH) && key.endsWith(RoleSheet.KEY_ENDS_WITH) && text.includes(key))
                return key;
        }
        return null;
    }

    private static addParagraphWithUrl(body, ixElement: number, itemText: string, linkObjectElems, pattr: object) : object { 
        const urlRef = '<<URL>>';
        itemText = itemText.replace(linkObjectElems.linkObjectStr, urlRef);    
        
        const paragraph = body.insertParagraph(ixElement, itemText);
        paragraph.setAttributes(pattr);

        const lastParagraph = body.insertParagraph(ixElement + 1, '');
        lastParagraph.setAttributes(pattr);

        const textUrl = linkObjectElems.textUrl;
        const url = linkObjectElems.url;
        
        const element = paragraph.findText(urlRef);
        const start = element.getStartOffset();
        const text = element.getElement().asText();
        text.replaceText(urlRef, textUrl);
        text.setLinkUrl(start, start + textUrl.length-1, url);
        
        return lastParagraph;
    }
}