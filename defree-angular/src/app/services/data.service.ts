import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class DataService {

    private userSourceAddress = new BehaviorSubject<string>("0x00");
    currentTokenAddress = this.userSourceAddress.asObservable();

    constructor() { }

    changeTokenAddress(userAddress: string){
        this.userSourceAddress.next(userAddress)
    }

}
