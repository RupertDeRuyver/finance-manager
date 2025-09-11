export interface Transaction {
  transactionId: string;
  userId: number;
  name: string;
  date: Date;
  bookingDate?: Date;
  valueDate?: Date;
  amount: number;
  currency: string;
  creditorName?: string;
  creditorAccount?: string;
  debtorName?: string;
  debtorAccount?: string;
  remittanceInformationUnstructured?: string;
  manual: boolean;
  deleted?: boolean;
  description?: string;
  location?: string;
  postal_code?: string;
  country?: string;
  payment_method?: string;
  category: string;
  subcategory: string;
  bic: string;
  comment: string;
}