export interface Approve {
  id: number,
  addressFrom: string;
  addressTo: string;
  valueApprove: string;
  gasFee: string;
  deadline: number;
  nonce: string;
  v: number;
  r: string;
  s: string;
  status: boolean;
  type: string;
  packParam: string;
  packSign: string;
}
