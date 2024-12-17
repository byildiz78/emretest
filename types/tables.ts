import { LucideIcon } from "lucide-react";

export type Efr_Users = {
    UserName?: string;
    UserID?: string;
    UserBranchs?: string;
    Category: number;
    ExpoToken: string;
    ExpoTokenUpdatedDate: Date;
}

export type Efr_Branches = {
    BranchID: number;
    BranchName: string;
    VersionInfo: string;
    StartDateTime: Date;
    ReSendDate: Date;
    Query: string;
    CallCenterTime: Date;
    CountryName: string;
    CurrencyName: string;
    Region: string;
    ExternalCode: string;
    AccountingCode: string;
    RevenueCenterCode: string;
    ProjectCode: string;
    AccountingRegisterAccount: string;
    GtfFileDirectory: string;
    Addresss: string;
    CustomField1: string;
    CustomField2: string;
    CustomField3: string;
    CustomField4: string;
    CustomField5: string;
    IsActive: boolean;
    LastDailyControlDatetime: Date;
    LastDailyControl_Notes: string;
    LastInstantControlDatetime: Date;
    Ciro: number;
    BranchSquareMeter: number;
    NumberOfServicePersonnel: number;
    OpeningTime: string;
    ClosingTime: string;
    CustomField6: string;
    CustomField7: string;
    CustomField8: string;
    CustomField9: string;
    CustomField10: string;
    CustomField11: string;
    ShowDashboard: boolean;
    CustomField12: string;
    CustomField13: string;
    CustomField14: string;
    CustomField15: string;
    CustomField16: string;
    LogoWarehouseCode: string;
    OrderNumber: number;
    CpmBranchID: number;
    IntegrationCompany: string;
    RegionID: number;
    Operasyon_Muduru: string;
    Operasyon_Grup_Muduru: string;
    Paket_Tipi: string;
    OfficeID: string;
    BranchReportOrder: number;
    WebMails: string;
    ParentBranchID: number;
    BranchMenuCode: string;
    InvestorMail: string;
    RegionalDirectorMail: string;
    RegionalManagerMail: string;
    LogoExternalCode: string;
}

export type WebWidget = {
    AutoID: number;
    ReportName?: string;
    ReportID: number;
    ReportIndex: number;
    ReportIcon?: string;
    V1Type?: number;
    V2Type?: number;
    V3Type?: number;
    V4Type?: number;
    V5Type?: number;
    V6Type?: number;
    ReportQuery?: string;
    ReportQuery2?: string;
    IsActive?: boolean;
    ReportColor?: string;
    ReportType?: string;
}

export type WebWidgetData = {
    BranchID: number;
    ReportID: number;
    reportValue1: string;    // SubeAdi
    reportValue2: number;    // TC (Cari dönem ciro)
    reportValue3: number;    // GHTC (Geçen hafta aynı saat ciro)
    reportValue4: number;    // GHTCTUM (Geçen hafta tüm gün ciro)
    reportValue5: number;    // KisiSayisi
    reportValue6: number;    // GHKisiSayisi
    reportValue7: number;    // GHKisiSayisiTUM
    reportValue8: number;    // Oran
    reportValue9: number;    // GecenHaftaOran
}

export type WebReport = {
    AutoID: number;
    ReportID: number;
    GroupID: number;
    ReportName?: string;
    ReportType?: number;
    ShowDesktop?: number;
    ShowMobile?: number;
    DisplayOrderID?: number;
    SecurityLevel?: number;
    ReportQuery?: string;
    ReportIcon?: string;
}

export type WebReportGroup = {
    GroupAutoID: number;
    GroupName?: string;
    GroupDisplayOrderID?: number;
    GroupSecurityLevel?: number;
    GroupIcon?: string;
}

export interface RawReportData {
    Group: WebReportGroup;
    Reports: WebReport[];
}

export type Notification = {
    autoId: number;
    logKey: string;
    branchId: number;
    orderDateTime: string;
    orderKey: string;
    userName: string;
    voidAmount: number;
    discountAmount: number;
    amountDue: number;
    deliveryTime: string;
    logTitle: string;
    logDetail: string;
    addDateTime: string;
    deviceSended: boolean;
    branchName?: string;
    type: 'sale' | 'discount' | 'cancel' | 'alert';
}

export type OrderHeader = {
    OrderKey: string;
    OrderType: number;
    OrderDateTime: string;
    CustomerCount: number;
    PersonelName: string;
    TarihText: string;
    SatisTuru: string;
}

export type OrderPayment = {
    OrderKey: string;
    PaymentDateTime: string;
    Amount: number;
    PaymentType: number;
    Status: string;
    SaatText: string;
}

export type OrderTransaction = {
    OrderKey: string;
    ProductName: string;
    Quantity: number;
    UnitPrice: number;
    TotalAmount: number;
    Status: string;
    SaatText: string;
    ParentLineID: number | null;
    LineID: number;
}

export type OrderDetail = {
    header?: OrderHeader;
    payments?: OrderPayment[];
    transactions?: OrderTransaction[];
}

export type Branch = {
    BranchID: string | number;
}

export type SupersetDashboard = {
    AutoID: number;
    DashboardID: string;
    Title: string;
    Standalone: number;
    ExtraParams: Record<string, string>;
    Icon: string;
}

export type ChatBotRole = 'system' | 'user' | 'assistant' | 'function'

export type ChatBot = {
    AutoID: number;
    ChatBotID: string;
    ChatbotQuery: string;
    ChatbotQueryParams: string;
    ChatbotRole: ChatBotRole;
    ChatbotContent: string;
    AnalysisTitle: string;
    Icon: string;
    FunctionName?: string;
}

export type ProjectSettings = {
    AutoID: number;
    Kod: string;
    Value: string;
    Description: string;
    Project: string;
}

export type DatabaseResponse = {
    databaseId: string;
    tenantId: string;
    apiKey: string;
    database:string;
}

export type ExpoTokens = {
    AutoID: number;
    ExpoToken: string;
    UpdatedAt: Date;
    UserID: string;
}