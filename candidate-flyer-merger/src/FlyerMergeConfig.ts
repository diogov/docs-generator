export default class FlyerMergeConfig {
    private readonly _roleName: string;
    private readonly _roleNameArticle: string;
    private readonly _destinationDriveName: string;
    private readonly _presentationName: string;
    private readonly _templatePresentationName: string;
    private readonly _templatePresentationFolderName: string;
    private readonly _templatePresentationDriveName: string;
    private readonly _disciplinePresentationName: string;
    private readonly _disciplinePresentationFolderName: string;
    private readonly _disciplinePresentationDriveName: string;

    constructor(roleName: string, roleNameArticle: string, destinationDriveId: string, presentationName: string,
                templatePresentationName: string, templatePresentationFolderName:string, templatePresentationDriveName: string,
                disciplinePresentationName: string, disciplinePresentationFolderName: string, disciplinePresentationDriveName: string) {
        this._roleName = roleName;
        this._roleNameArticle = roleNameArticle;
        this._destinationDriveName = destinationDriveId;
        this._presentationName = presentationName;
        this._templatePresentationName = templatePresentationName;
        this._templatePresentationFolderName = templatePresentationFolderName;
        this._templatePresentationDriveName = templatePresentationDriveName;
        this._disciplinePresentationName = disciplinePresentationName;
        this._disciplinePresentationFolderName = disciplinePresentationFolderName;
        this._disciplinePresentationDriveName = disciplinePresentationDriveName;
    }

    get roleName(): string {
        return this._roleName;
    }

    get roleNameArticle(): string {
        return this._roleNameArticle;
    }

    get destinationDriveName(): string {
        return this._destinationDriveName;
    }

    get presentationName(): string {
        return this._presentationName;
    }

    get templatePresentationName(): string {
        return this._templatePresentationName;
    }

    get templatePresentationFolderName(): string {
        return this._templatePresentationFolderName;
    }

    get templatePresentationDriveName(): string {
        return this._templatePresentationDriveName;
    }

    get disciplinePresentationName(): string {
        return this._disciplinePresentationName;
    }

    get disciplinePresentationFolderName(): string {
        return this._disciplinePresentationFolderName;
    }

    get disciplinePresentationDriveName(): string {
        return this._disciplinePresentationDriveName;
    }
}

