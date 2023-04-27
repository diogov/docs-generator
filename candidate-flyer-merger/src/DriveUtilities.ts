export default class DriveUtilities {
    getSharedDriveByName(driveName: string) {
        const drives = Drive.Drives.list({
            q: `name='${driveName}'`,
        });

        if (drives.items.length != 1) {
            throw new Error(`Found ${drives.items.length} drive(s) with name ${driveName}. Expected 1`);
        }

        console.info(`Found drive with id ${drives.items[0].id} for name ${driveName}`);

        return drives.items[0];
    }

    getFolderByName(folderName: string, driveId: string) {
        let folders = Drive.Files.list({
            q: `title='${folderName}' and mimeType = 'application/vnd.google-apps.folder'`,
            corpora: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            driveId: driveId
        });

        if (folders.items.length != 1) {
            throw new Error(`Found ${folders.items.length} folder(s) with name ${folderName}. Expected 1`);
        }

        console.info(`Found folder with id ${folders.items[0].id} for name ${folderName}`);

        return folders.items[0];
    }

    getFileByName(fileName, driveName, folderName: string): { id?: string } {
        let files = this.getFilesByName(fileName, driveName, folderName);

        if (files.length != 1) {
            throw new Error(`${files.length} files found for name ${fileName}, expected 1`);
        }

        return files[0];
    }

    getFilesByName(fileName, driveName, folderName: string): { id?: string }[] {
        console.info(`Finding file ${fileName} in drive ${driveName}, folder ${folderName}`);

        const drive = this.getSharedDriveByName(driveName);
        const folder = this.getFolderByName(folderName, drive.id);

        return Drive.Files.list({
            q: `title='${fileName}' and trashed = false and '${folder.id}' in parents and mimeType != 'application/vnd.google-apps.folder'`,
            corpora: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            driveId: drive.id
        }).items;
    }

    generatePDF(fileName: string, content: GoogleAppsScript.Base.Blob, destinationFolderName: string, destinationDriveName: string) {
        const destinationDrive = this.getSharedDriveByName(destinationDriveName);
        const destinationFolder = this.getFolderByName(destinationFolderName, destinationDrive.id);

        const file = {
            title: fileName,
            mimeType: 'application/pdf',
            parents: [{
                "kind": "drive#parentReference",
                "id": destinationFolder.id,
                "isRoot": false
            }]
        };

        Drive.Files.insert(file, content, {
            supportsAllDrives: true,
            driveId: destinationDrive.id
        });
    }

    updatePDF(existingFileId: string, content: GoogleAppsScript.Base.Blob) {
        let existingFile = Drive.Files.get(existingFileId, {
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        Drive.Files.update(existingFile, existingFileId, content, {
            supportsAllDrives: true
        });
    }

    removeFile(fileId) {
        Drive.Files.remove(fileId);
    }
}