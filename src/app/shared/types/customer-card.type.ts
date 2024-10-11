
export interface ICustomerCard {
  numberMasked: string,
  name: string,
  token: string,
  accountNumber: string,
  status: string,
  manufacturer: 'UZCARD' | 'HUMO' | 'VISA' | 'MASTERCARD',
}
