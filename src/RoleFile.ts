export default class RoleFile {

    private roleFileName: string;
    private roleFolderId: string;
    private roleFolderName : string;
    private driveId?: string | undefined;
    private driveName?: string | undefined;

    constructor(roleFolderName: string, roleFileName: string, driveName?: string) {
        this.roleFileName = roleFileName;
        this.roleFolderName = roleFolderName;
        if (driveName) {
            this.driveId = RoleFile.getSharedDriveIdOrNull(driveName);
            this.driveName = driveName;
        }
        this.roleFolderId = RoleFile.getFolderId(roleFolderName, this.driveId);
    }

    makeTemplateDocumentCopyForNewRole(templateFileURL: string) : { id: string, embedLink: string } {
        const templateFileId = templateFileURL.match(/[-\w]{25,}/); 
        
        const fileDesc = {
            title: this.roleFileName,
            parents: [{ id: this.roleFolderId }]
        };
        const params = {};
        RoleFile.insertDriveProperties(params, this.driveId);
        return Drive.Files.copy(fileDesc, templateFileId, params);
    }

    removeFile() {
        const files = this.getFilesByName();
        files.forEach(file => {
            DriveApp.getFileById(file.id).setTrashed(true);
        });
    }

    private getFilesByName(): { id?: string }[] {
        console.info(`Finding file ${this.roleFileName} in drive ${this.driveName}, folder ${this.roleFolderName}`);

        const params = {
            q: `title='${this.roleFileName}' and trashed = false and '${this.roleFolderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`
        };
        RoleFile.insertDriveProperties(params, this.driveId);
        return Drive.Files.list(params).items;        
    }

    private static getFolderId(folderName: string, driveId?: string): string {
        const params = {
            q: `title='${folderName}' and mimeType = 'application/vnd.google-apps.folder'`
        };
        RoleFile.insertDriveProperties(params, driveId);

        const folders = Drive.Files.list(params);

        if (folders.items.length != 1) {
            throw new Error(`Found ${folders.items.length} folder(s) with name ${folderName}. Expected 1`);
        }

        console.info(`Found folder with id ${folders.items[0].id} for name ${folderName}`);

        return folders.items[0].id;
    }

    private static getSharedDriveIdOrNull(driveName?: string): undefined | string {
        if (!driveName) {
            return;
        }

        const drives = Drive.Drives.list({
            q: `name='${driveName}'`,
        });

        if (drives.items.length != 1) {
            throw new Error(`Found ${drives.items.length} drive(s) with name ${driveName}. Expected 1`);
        }

        console.info(`Found drive with id ${drives.items[0].id} for name ${driveName}`);

        return drives.items[0].id;
    }

    private static insertDriveProperties(params: object, driveId?: string) : void {
        if (!driveId) {
            return;
        }

        params['corpora'] = 'drive';
        params['supportsAllDrives'] = true;
        params['includeItemsFromAllDrives'] = true;
        params['driveId'] = driveId;
    }
}
