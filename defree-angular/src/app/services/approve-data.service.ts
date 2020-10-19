import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { LocalStorageKeys } from '../utils/localstorage';
import { Approve } from '../model/approval'

@Injectable()
export class ApproveDataService extends BaseService {
  constructor() {
    super();
  }

  public saveApproveLocalStorage(data) {
    this.LocalStorage.set(LocalStorageKeys.approves, data);
  }

  public getApproveLocalStorage(): any {
    return this.LocalStorage.get(LocalStorageKeys.approves);
  }

  public removeApproveStorage() {
    this.LocalStorage.remove(LocalStorageKeys.approves);
  }

}
