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
  state;
  approves: Approve[];
  activeApproves;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private formBuilder: FormBuilder,
    private metamaskService: MetamaskService
  ) {
  }

  ngOnInit(): void {
    this.state = 'list';
    this.totalTxs = 0;
    this.totalGasFee = 0;
    this.approves = JSON.parse(localStorage.getItem('approvesTxs'));
    if (this.approves !== null) {
      this.activeApproves = this.approves.filter(approve => approve.deadline > (Date.now() / 1000) && approve.type == 'mainTx');
      this.activeApproves.forEach(() => this.totalTxs = this.totalTxs + 1);
      console.log(this.totalGasFee)
      for (let approve of this.activeApproves) {
        this.totalGasFee = this.totalGasFee + approve.gasFee;
      }
    } else { }
  }

  refreshTxs(){
    this.ngOnInit();
  }

  sendTxs() {
    this.state = 'confirmTransfer';
  }

}
