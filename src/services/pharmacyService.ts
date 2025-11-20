import { getDistance } from 'geolib';
import { getFirestore, FieldValue, Firestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';
import { GeoPoint, Pharmacy, PharmacyStatus } from '../types/shared';

// ============================================================================
// MOCK DATA
// ============================================================================
const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm_dt_sf',
    ownerId: 'user_owner_1',
    name: 'Downtown CVS',
    address: '123 Market St, San Francisco, CA',
    licenseNumber: 'LIC-1001',
    phone: '+1 415-555-0101',
    location: { latitude: 37.7749, longitude: -122.4194 }, // Exact match for default user
    createdAt: new Date(),
    status: PharmacyStatus.ACTIVE
  },
  {
    id: 'pharm_mission',
    ownerId: 'user_owner_2',
    name: 'Mission District Pharma',
    address: '200 Valencia St, San Francisco, CA',
    licenseNumber: 'LIC-1002',
    phone: '+1 415-555-0102',
    location: { latitude: 37.7600, longitude: -122.4200 }, // ~1.6km away
    createdAt: new Date(),
    status: PharmacyStatus.ACTIVE
  },
  {
    id: 'pharm_oakland',
    ownerId: 'user_owner_3',
    name: 'Oakland Medical Center',
    address: '50 Broadway, Oakland, CA',
    licenseNumber: 'LIC-1003',
    phone: '+1 510-555-0103',
    location: { latitude: 37.8044, longitude: -122.2712 }, // ~13km away
    createdAt: new Date(),
    status: PharmacyStatus.ACTIVE
  },
  {
    id: 'pharm_ny',
    ownerId: 'user_owner_4',
    name: 'New York Chemist',
    address: '100 5th Ave, NY, NY',
    licenseNumber: 'LIC-1004',
    phone: '+1 212-555-0104',
    location: { latitude: 40.7128, longitude: -74.0060 }, // Far away
    createdAt: new Date(),
    status: PharmacyStatus.ACTIVE
  }
];

const SEARCH_RADIUS_METERS = 10000; // 10km

class PharmacyService {
  
  /**
   * Helper to get the Firestore instance if initialized, or null.
   */
  private getDb(): Firestore | null {
    if (getApps().length > 0) {
      return getFirestore();
    }
    return null;
  }

  /**
   * Finds pharmacies within 10km of the given location.
   */
  public async findNearbyPharmacies(userLocation: GeoPoint): Promise<Pharmacy[]> {
    let allPharmacies: Pharmacy[] = [];
    const db = this.getDb();

    if (db) {
      // Production: Fetch 'Active' pharmacies from Firestore
      try {
        const snapshot = await db.collection('pharmacies')
          .where('status', '==', PharmacyStatus.ACTIVE)
          .get();
        
        if (!snapshot.empty) {
          allPharmacies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pharmacy));
        } else {
          console.log("⚠️ No pharmacies in DB, falling back to Mock data.");
          allPharmacies = MOCK_PHARMACIES;
        }
      } catch (error) {
        console.error("DB Read Error:", error);
        allPharmacies = MOCK_PHARMACIES;
      }
    } else {
      // Dev/Mock Mode
      allPharmacies = MOCK_PHARMACIES;
    }

    // Filter using geolib
    const nearby = allPharmacies.filter(pharmacy => {
      if (!pharmacy.location) return false;

      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: pharmacy.location.latitude, longitude: pharmacy.location.longitude }
      );

      pharmacy._distance = distance; // Attach distance for debugging/sorting
      return distance <= SEARCH_RADIUS_METERS;
    });

    return nearby.sort((a, b) => (a._distance || 0) - (b._distance || 0));
  }

  /**
   * Creates notification records for the identified pharmacies.
   */
  public async notifyPharmacies(requestId: string, pharmacies: Pharmacy[], userLocation: GeoPoint): Promise<string[]> {
    const db = this.getDb();
    const results: string[] = [];

    for (const pharmacy of pharmacies) {
      console.log(`   → 🔔 Notifying: ${pharmacy.name} (${pharmacy._distance}m away)`);
      
      if (db) {
        try {
          await db.collection('notifications').add({
            recipientId: pharmacy.id,
            recipientType: 'Pharmacy', 
            type: 'NEW_DRUG_REQUEST',
            title: 'New Request Nearby',
            body: `A new request matches your inventory location. Distance: ${((pharmacy._distance || 0)/1000).toFixed(1)}km`,
            data: {
              requestId: requestId,
              userLocation: userLocation
            },
            createdAt: FieldValue.serverTimestamp(),
            read: false
          });
        } catch (e) {
          console.error(`Failed to save notification for ${pharmacy.id}`, e);
        }
      }
      results.push(pharmacy.id);
    }
    
    return results;
  }
}

export const pharmacyService = new PharmacyService();