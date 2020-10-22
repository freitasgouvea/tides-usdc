import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Approve } from '../../model/approval';
import { NgbdSortableHeader, SortEvent } from '../../helpers/approve.directive';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MetamaskService } from 'src/app/services/metamask.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

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
  selectedApproves;
  activeApproves;
  closeResult = '';
  content;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  get approvesFormArray() {
    return this.form.controls.activeApproves as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private metamaskService: MetamaskService,
    private modalService: NgbModal,
  ) {
    this.form = this.formBuilder.group({
      activeApproves: new FormArray([])
    });
    of(this.getApprovals()).subscribe(approves => {
      if (this.approves !== null) {
        this.activeApproves = this.approves.filter(approve => approve.deadline > (Date.now() / 1000) && approve.type == 'mainTx');
        this.addCheckboxes();
      } else {  }
    });
  }

  ngOnInit(): void {
    this.state = 'list';
    this.totalTxs = 0;
    this.totalGasFee = 0;
  }

  getApprovals(){
    this.approves = JSON.parse(localStorage.getItem('approvesTxs'));
  }

  private addCheckboxes() {
    this.activeApproves.forEach(() => this.approvesFormArray.push(new FormControl(false)));
  }

  submit() {
    const selectedApprovesIds = this.form.value.activeApproves
      .map((checked, i) => checked ? this.activeApproves[i].id : null)
      .filter(v => v !== null);
    return selectedApprovesIds;
  }

  FieldsChange(values: any, gasFee: number) {
    if (values.currentTarget.checked) {
      this.totalGasFee = this.totalGasFee + +gasFee;
      this.totalTxs = this.totalTxs + 1;
    } else {
      this.totalGasFee = this.totalGasFee - gasFee;
      this.totalTxs = this.totalTxs - 1;
    }
  }

  refreshTxs(){
    this.getApprovals();
  }

  sendTxs() {
    this.state = 'confirmTransfer';
    this.selectedApproves = this.submit();
    console.log(this.selectedApproves);
    this.metamaskService.sendTxs(this.selectedApproves);
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-send'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
