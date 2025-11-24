import type { Timestamp } from 'firebase-admin/firestore';

// =========================================================================
// 1. COMMON TYPES & ENUMS
// =========================================================================

/** Type for all primary document identifiers. */
export type DocId = string;

/** Type for all timestamp fields, accommodating server/client writes. */
export type DbTimestamp = Timestamp;

/** Standard Geographical Location format. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export enum RequestStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Accepted = 'Accepted',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  Expired = 'Expired'
}

export enum PharmacyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

/**
 * Standardized API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// =========================================================================
// 2. NESTED & STANDALONE INTERFACES
// =========================================================================

export interface DrugSpecification {
  medicineName: string;
  drugStrength?: string;
  drugForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | string;
}

export interface RequestedItem {
  itemId: DocId; 
  drug: DrugSpecification;
  quantity: number;
  prescriptionUrl?: string;
  itemNotes?: string;
}

// =========================================================================
// 3. CORE MODELS
// =========================================================================

export interface UserProfile {
  id: DocId;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'PharmacyOwner';
  avatarUrl?: string;
  isActive: boolean;
}

export interface Pharmacy {
  id: DocId;
  ownerId: DocId;
  name: string; 
  address: string;
  licenseNumber: string;
  phone: string;
  location: GeoPoint;
  createdAt: DbTimestamp | Date;
  status: PharmacyStatus;
  _distance?: number; // Runtime property
}

export interface OfferItemDetail {
    itemId: DocId; 
    quantityProvided: number; 
    unitPrice: number; 
    itemNote?: string;
    isAvailable: boolean;
}

export interface PharmacyOffer {
  offerId: DocId;
  requestId: DocId;
  pharmacyId: DocId;
  pharmacyName: string;
  pharmacyAddress: string;
  fulfilledItems: OfferItemDetail[]; 
  price: number; 
  isAvailable: boolean; 
  deliveryEstimate: string;
  notes?: string;
  createdAt: DbTimestamp;
  status?: 'Accepted';
}

export interface CommunicationEntry {
  id: DocId;
  senderId: DocId | 'System' | 'User';
  sender: string;
  senderRole?: 'User' | 'Pharmacy' | 'Staff';
  message: string;
  timestamp: Timestamp;
}

export interface ProductRequest {
  id: DocId;
  userId: DocId;
  userName: string; 
  userPhone: string | null;
  userLocation?: GeoPoint;
  items: RequestedItem[]; 
  generalNotes?: string;
  status: RequestStatus;
  createdAt: DbTimestamp;
  expiresAt?: DbTimestamp;
  offers?: PharmacyOffer[]; 
  communicationLog?: CommunicationEntry[];
  prescriptionUrl?: string; 
}

export interface NotificationPayload {
  requestId: string;
  userLocation: GeoPoint;
}