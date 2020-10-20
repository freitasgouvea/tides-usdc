import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Approve } from '../../model/approval';
import { NgbdSortableHeader, SortEvent } from '../../helpers/approve.directive';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MetamaskService } from 'src/app/services/metamask.service';

@Component({
  selector: 'app-send-list',
  templateUrl: './send-list.component.html',
  styleUrls: ['./send-list.component.css'],
  providers: [DecimalPipe]
})
export class SendListComponent implements OnInit {

  form: FormGroup;
  totalTxs: number;
  totalGasFee: number;
  txOff;
  approves: Approve[];
  ActiveApproves;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private formBuilder: FormBuilder,
    private metamaskService: MetamaskService
  ) {
  }

  ngOnInit(): void {
    this.txOff = true;
    this.approves = JSON.parse(localStorage.getItem('approvesTxs'));
    if (this.approves !== null) {
      this.ActiveApproves = this.approves.filter(approve => approve.deadline > (Date.now() / 1000) && approve.type == 'mainTx');
      this.ActiveApproves.forEach(() => this.totalTxs = this.totalTxs + 1);
      for (let approve of this.ActiveApproves) {
        this.totalGasFee = this.totalGasFee + approve.gasFee;
      }
    } else {
      this.totalTxs = 0;
      this.totalGasFee = 0;
    }
  }

  sendTxs() {

  }

}
