export interface Item {
  name: string;
  quantity: number;
  price: number;
  amount?: number;
}

export interface BillTemplate {
  name: string;
  description: string;
  isBuiltIn: boolean;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopTagline: string;
  pageWidth: number;
  pageHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  baseFontSize: number;
  headerFontSize: number;
  subHeaderFontSize: number;
  footerFontSize: number;
  lineWidth: number;
  lineChar: string;
  colQtyWidth: number;
  colNameWidth: number;
  colPriceWidth: number;
  colAmountWidth: number;
  currencySymbol: string;
  cultureName: string;
  thankYouMessage: string;
  showThankYouMessage: boolean;
  dateFormat: string;
  receiptLeftPadding: number;
  dividerStyle: 'single' | 'double' | 'star';
  headerStyle: 'plain' | 'boxed';
  showSubtotal: boolean;
  showCashLine: boolean;
  showRemainingBalance: boolean;
  showCashier: boolean;
  showPhone: boolean;
  showTagline: boolean;
}

export interface GenerateBillRequest {
  templateName: string;
  items?: Item[];
  billDate: string;
  billTime: string;
  cashierName?: string;
}

export interface GenerateRangeRequest {
  templateName: string;
  startDate: string;
  endDate: string;
}

export interface BillRangeResult {
  date: string;
  fileName: string;
  pdfBase64: string;
  total: number;
}
