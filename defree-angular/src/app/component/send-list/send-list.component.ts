import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Approve } from '../../model/approval';
import { ApproveTableService } from '../../services/approval-table.service';
import { NgbdSortableHeader, SortEvent } from '../../helpers/approve.directive';

@Component({
  selector: 'app-send-list',
  templateUrl: './send-list.component.html',
  styleUrls: ['./send-list.component.css'],
  providers: [ApproveTableService, DecimalPipe]
})
export class SendListComponent implements OnInit {

  approves$: Observable<Approve[]>;
  total$: Observable<number>;

  txOff;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(public approveService: ApproveTableService) {
    this.approves$ = approveService.approves$;
    this.total$ = approveService.total$;
  }

  ngOnInit(): void {
    this.txOff = true;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.approveService.sortColumn = column;
    this.approveService.sortDirection = direction;
  }

}
