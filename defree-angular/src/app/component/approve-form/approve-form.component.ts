import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { MetamaskService } from 'src/app/services/metamask.service';

@Component({
  selector: 'app-approve-form',
  templateUrl: './approve-form.component.html',
  styleUrls: ['./approve-form.component.css']
})
export class ApproveFormComponent implements OnInit {

  phase: string;
  approveForm: FormGroup;
  dataMessage: string;
  userAddress;

  constructor(
    private formBuilder: FormBuilder,
    private metamaskService: MetamaskService
  ) {
    this.approveForm = this.formBuilder.group({
      recipientAddress: [''],
      valueApprove: [''],
      gasFee: [''],
      deadline: [''],
    });
  }

  ngOnInit(): void {
    this.phase = "preTx";
  }

  connectMetamask(){
    this.metamaskService.connectWallet();
  }

  get f() { return this.approveForm.controls; }

  async confirmApprove() {
    this.userAddress = await this.metamaskService.getAccount();
    console.log(this.userAddress)
    const approve = await this.metamaskService.signApprove(this.userAddress, this.f.recipientAddress.value, this.f.valueApprove.value, this.f.gasFee.value, this.f.deadline.value);
    console.log(approve)
  }

}
