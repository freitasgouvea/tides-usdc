import { environment } from '../../environments/environment';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { LocalStorageUtil } from '../utils/localstorage';

export abstract class BaseService {

    protected LocalStorage = new LocalStorageUtil();

    protected extractData(response: any) {
        return response.data || {};
    }

    protected serviceError(response: Response | any) {
        let customError: string[] = [];
        let customResponse = { error: { errors: [] } }

        if (response instanceof HttpErrorResponse) {

            if (response.statusText === 'Unknown Error') {
                customError.push('An unknown error has occurred');
                response.error.errors = customError;
            }
        }
        if (response.status === 500) {
            customError.push('Processing error occurred, please try again later or contact support');

            customResponse.error.errors = customError;
            return throwError(customResponse);
        }

        return throwError(response);
    }
}
