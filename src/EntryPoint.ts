import RoleFile from './RoleFile';
import RoleSheet from './RoleSheet';
import RoleDoc from './RoleDoc';

function updateRoleDocs() {
    const spreadsheet = SpreadsheetApp.getActive();

    const scriptProps = PropertiesService.getScriptProperties();
    const sharedDrivesAccess: boolean = scriptProps.getProperty('SHARED_DRIVES_ACCESS') === 'false' ? false : true;

    const sheetData = RoleSheet.getRoleDocumentsData(spreadsheet);

    const templateFileURL = sheetData[RoleSheet.TEMPLATE_URL_KEY];

    sheetData[RoleSheet.DATA_ROLES_STRUCTURED].forEach(roleData => {
        const folderName = roleData[RoleSheet.FOLDER_KEY];
        const fileName = roleData[RoleSheet.FILE_NAME_KEY];
        const driveName = roleData[RoleSheet.DRIVER_KEY];

        const roleFile = new RoleFile(folderName, fileName, sharedDrivesAccess ? driveName : undefined );
        roleFile.removeFile();
        const file = roleFile.makeTemplateDocumentCopyForNewRole(templateFileURL);
        
        RoleDoc.generateDoc(file, roleData);

        RoleSheet.fillDoNoEditCells(roleData, file.embedLink);
    });
}

function onOpen() {
    const ui = SpreadsheetApp.getUi();

    ui.createMenu('Generate')
        .addItem('Update Role Docs', 'updateRoleDocs')
        .addToUi();
}