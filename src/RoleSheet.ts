export default class RoleSheet {

    static readonly DATA_ROLES_STRUCTURED = 'dataRoles';
    static readonly TEMPLATE_URL_KEY = 'TEMPLATE_URL';
    static readonly DRIVER_KEY = 'Drive';
    static readonly FOLDER_KEY = 'Folder';
    static readonly FILE_NAME_KEY = 'File Name';
    static readonly MODIFIED_TIME_DATE_KEY = 'Modified (Time/Date)';
    static readonly URL_KEY = 'URL';

    static readonly ROLE_KEY = '{{ROLE_NAME}}';
    static readonly DESCRIPTION_KEY = '{{DESCRIPTION}}';

    static readonly KEY_STARTS_WITH = '{{';
    static readonly KEY_ENDS_WITH = '}}';


    private static readonly FIRST_LINE_WITH_ROLE = 1;
    private static readonly CONFIG = 'config';
    public static readonly ROLE = 'role';
    private static readonly DO_NO_EDIT = '(DO NO EDIT)';

    private static readonly LINK_OBJECT_REGEX = /{{LINK.*?}}/g;
    private static readonly LINK_OBJECT_SEPARATOR = ':';


    static getRoleDocumentsData(spreadsheet): object {
        const sheets = spreadsheet.getSheets();

        const dataStructured = {};
        const dataRoles : object[] = [];
        dataStructured[RoleSheet.DATA_ROLES_STRUCTURED] = dataRoles;

        sheets.forEach(sheet => {
            const name = sheet.getName().trim().toLowerCase();
            const sheetData = RoleSheet.getSheetData(sheet);

            if (name.startsWith(RoleSheet.CONFIG)) {
                for (let i = 0; i < sheetData.length; i++) {
                    dataStructured[ sheetData[i][0] ] = sheetData[i][1];
                }
            }
            else if (name.startsWith(RoleSheet.ROLE)) {
                const rolesLinesNumbers = RoleSheet.getRolesLinesNumbersPlusLastLine(sheetData);

                for (let i = 0; i < rolesLinesNumbers.length - 1; i++) {
                    const roleData = RoleSheet.getRoleData(sheetData, rolesLinesNumbers[i], rolesLinesNumbers[i+1], sheet);
                    dataRoles.push(roleData);
                }
            }
        });
        return dataStructured;
    }

    static fillDoNoEditCells(roleData: object, fileLink: string): void {
        const modifiedRangeCell = roleData[RoleSheet.MODIFIED_TIME_DATE_KEY];
        const urlKeyRangeCell = roleData[RoleSheet.URL_KEY];
        modifiedRangeCell.setValue(new Date().toLocaleString());
        urlKeyRangeCell.setValue(fileLink);
    }

    static getLinkObjectElementsOrNull(itemText: string) : object | null {
        const linkTextArray : string[] | null = itemText.match(RoleSheet.LINK_OBJECT_REGEX);
        if (linkTextArray == null || linkTextArray.length == 0){
            return null;
        }
        const linkObject = linkTextArray[0];

        const linkText = linkObject.substring(2, linkObject.length-2);
        const linkTextElems: string[] = linkText.split(RoleSheet.LINK_OBJECT_SEPARATOR);

        const textUrl = linkTextElems[1].substring(1, linkTextElems[1].length - 1);
        const url = linkTextElems[2].substring(1) + RoleSheet.LINK_OBJECT_SEPARATOR + linkTextElems[3].substring(0, linkTextElems[3].length -1);
        
        return {
            linkObjectStr: linkObject,
            textUrl: textUrl,
            url: url
        };
    }

    private static getRoleData(sheetData: string[][], minLine: number, maxLine: number, sheet): object {
        const roleData = {};
        roleData[RoleSheet.ROLE] = sheetData[minLine][0];

        for (let iColumn = 1; iColumn < sheetData[0].length; iColumn++) {
            let key = sheetData[0][iColumn].trim();
            if (key.startsWith(RoleSheet.KEY_STARTS_WITH) && key.endsWith(RoleSheet.KEY_ENDS_WITH) ) {
                roleData[key] = [];

                for (let iLine = minLine; iLine < maxLine && iLine < sheetData.length; iLine++) {
                    const cellData = sheetData[iLine][iColumn];
                    if (cellData) {
                        roleData[key].push(cellData);
                    }
                }
            }
            else if (key.endsWith(RoleSheet.DO_NO_EDIT)) {
                const range = RoleSheet.getLetter(iColumn + 1) + (minLine + 1);
                const cell = sheet.getRange(range);
                key = key.replace(RoleSheet.DO_NO_EDIT, '').replace('\n', '').trim();
                roleData[key] = cell;
            }
            else {
                const member = sheetData[minLine][iColumn];
                roleData[key] = member ? member : sheetData[1][iColumn];
            }
        }
        return roleData;
    }

    private static getRolesLinesNumbersPlusLastLine(sheetData: string[][]): number[] {
        const rolesLines : number[] = [];
        for (let i = RoleSheet.FIRST_LINE_WITH_ROLE; i < sheetData.length; i++) {
            if (sheetData[i][0] != '') {
                rolesLines.push(i);
            }
        }
        rolesLines.push(sheetData.length);
        return rolesLines;
    }

    private static getSheetData(sheet): string[][] {
        const totalRange = RoleSheet.getTotalRange(sheet);
        return sheet.getRange(totalRange).getValues();
    }

    private static getTotalRange(sheet): string {
        const lastColumn = sheet.getLastColumn();
        const lastRow = sheet.getLastRow();

        const charCodeA = 'A'.charCodeAt(0);

        const lastLetter = String.fromCharCode(charCodeA + lastColumn - 1);

        return 'A1:' + lastLetter + lastRow;
    }

    private static getLetter(alphabetPosition: number): string {
        const charCodeA = 'A'.charCodeAt(0);
        return String.fromCharCode(charCodeA + alphabetPosition - 1);
    }
}