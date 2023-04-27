export default class PDFExportConfig {
    private readonly _destinationFolderName: string;
    private readonly _destinationDriveName: string;
    private readonly _documentFolderName: string;
    private readonly _documentDriveName: string;
    private readonly _documentNames: string[];

    constructor(destinationFolderName: string, destinationDriveName: string, documentFolderName: string,
                documentDriveName: string, documentNames: string[]) {
        this._destinationFolderName = destinationFolderName;
        this._destinationDriveName = destinationDriveName;
        this._documentFolderName = documentFolderName;
        this._documentDriveName = documentDriveName;
        this._documentNames = documentNames;
    }

    get destinationFolderName(): string {
        return this._destinationFolderName;
    }

    get destinationDriveName(): string {
        return this._destinationDriveName;
    }

    get documentNames(): string[] {
        return this._documentNames;
    }

    get documentFolderName(): string {
        return this._documentFolderName;
    }

    get documentDriveName(): string {
        return this._documentDriveName;
    }
}