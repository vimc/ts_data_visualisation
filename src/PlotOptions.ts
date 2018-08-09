export interface TrackingParameters {
    report_id: string;
    data_id: string;
    application_id: string;
}

export class TrackingInfo {
    repId: KnockoutObservable<string>; // id of montagu report for app
    depId: KnockoutObservable<string>; // id of montagu report for data
    AppId: KnockoutObservable<string>; // git has of app source code

    constructor () {
        
    }
}