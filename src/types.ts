// Shared domain types used across the application

export type DocumentType = 'INVOICE' | 'RECEIPT' | 'QUOTE';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  id?: string;
  type: DocumentType;
  language?: string;
  currency?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyContact?: string;
  companyNuit?: string;
  number?: string;
  date?: string;
  dueDate?: string;
  clientName?: string;
  clientContact?: string;
  clientLocation?: string;
  clientNuit?: string;
  items: LineItem[];
  subtotal?: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  stampText?: string;
  signatureData?: string;
}

export interface CompanySettings {
  name?: string;
  logo?: string;
  address?: string;
  contact?: string;
  nuit?: string;
  currency?: string;
  language?: string;
  plan?: string;
  [key: string]: any;
}

export interface SavedClient {
  name: string;
  contact?: string;
  nuit?: string;
  location?: string;
}

export interface SavedProduct {
  description: string;
  unitPrice: number;
}

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE' | string;

export interface ItemDetails {
  itemId: string;
  price: { value: string; currency: string };
  title?: string;
}

export interface PurchaseDetails {
  purchaseToken: string;
  itemId: string;
  [key: string]: any;
}

// Bluetooth types are part of the experimental Web Bluetooth API and may
// not be available in every TypeScript configuration.  Using `any` here keeps
// the project compiling without strict type requirements.
export interface BluetoothPrinter {
  gatt?: any;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  userName: string;
  userLogo?: string;
  content: string;
  timestamp: number;
  location: string;
  likes: number;
}

export interface DigitalGoodsService {
  getDetails(ids: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<PurchaseDetails[]>;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  user_name: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  [key: string]: any;
}
