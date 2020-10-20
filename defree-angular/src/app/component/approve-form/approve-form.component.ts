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
      recipientAddress: ['', Validators.required],
      valueApprove: ['', Validators.required, Validators.pattern("^[0-9]*$")],
      gasFee: ['', Validators.required, Validators.pattern("^[0-9]*$")],
      deadline: ['', Validators.required, Validators.pattern("^[0-9]*$")],
    });
  }

  ngOnInit(): void {
    this.phase = "preTx";
  }

  connectMetamask() {
    this.metamaskService.connectWallet();
  }

  get f() { return this.approveForm.controls; }

  async confirmApprove() {
    if(this.phase == "unconnected"){
      return window.alert('You need to connect Metamask for use this site.')
    }
    this.phase = "approveGasFee";
    this.userAddress = await this.metamaskService.getAccount();
    const approveGasFee = await this.metamaskService.signGasFeeApprove(this.userAddress, this.f.gasFee.value, this.f.deadline.value);
    if (approveGasFee == true) {
      this.phase = "approveTx";
      const approveTx = await this.metamaskService.signTxApprove(this.userAddress, this.f.recipientAddress.value, this.f.valueApprove.value, this.f.gasFee.value, this.f.deadline.value);
      if (approveTx == true) {
        this.phase = "congratulations";
      } else {
        this.phase = "preTx";
      }
    } else {
      this.phase = "preTx";
    }
  }

  newApprove(){
    this.phase = 'preTx';
  }

}
