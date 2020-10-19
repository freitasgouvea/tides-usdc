import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Approve } from '../../model/approval';
import { ApproveTableService } from '../../services/approval-table.service';
import { NgbdSortableHeader, SortEvent } from '../../helpers/approve.directive';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-send-list',
  templateUrl: './send-list.component.html',
  styleUrls: ['./send-list.component.css'],
  providers: [ApproveTableService, DecimalPipe]
})
export class SendListComponent implements OnInit {

  approves$: Observable<Approve[]>;
  total$: Observable<number>;
  form: FormGroup;
  totalTxs: number;
  totalGasFee: number;
  txOff;
  APPROVES = JSON.parse(localStorage.getItem('approves'));
  ActiveApproves;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    public approveService: ApproveTableService,
    private formBuilder: FormBuilder
    ) {
    this.approves$ = approveService.approves$;
    this.total$ = approveService.total$;
    this.totalTxs = 0;
    this.totalGasFee = 0;
  }

  ngOnInit(): void {
    this.txOff = true;
    this.ActiveApproves = this.APPROVES.filter(approve => approve.deadline > (Date.now() / 1000));
    this.ActiveApproves.forEach(() => this.totalTxs = this.totalTxs + 1);
    for (let approve of this.ActiveApproves) {
      this.totalGasFee = this.totalGasFee + approve.gasFee;
    }
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.approveService.sortColumn = column;
    this.approveService.sortDirection = direction;
  }

}
