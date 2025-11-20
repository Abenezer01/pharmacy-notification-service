import { pharmacyService } from '../services/pharmacyService';
import { GeoPoint } from '../types/shared';
import { ResponseUtil } from '../utils/response';

export class PharmacyController {
  
  /**
   * Handles the POST request to notify nearby pharmacies.
   */
  public notifyNearby = async (req: any, res: any) => {
    const { requestId, userLocation } = req.body as { requestId: string; userLocation: GeoPoint };

    console.log(`\n[${new Date().toISOString()}] 📩 New Notification Request: ${requestId}`);

    // 1. Validation
    if (!requestId || !userLocation?.latitude || !userLocation?.longitude) {
      console.error("❌ Invalid Payload:", req.body);
      return ResponseUtil.sendError(
        res, 
        'Invalid payload. Required: requestId, userLocation { latitude, longitude }', 
        400
      );
    }

    try {
      // 2. Find matching pharmacies (Service Layer)
      const nearbyPharmacies = await pharmacyService.findNearbyPharmacies(userLocation);
      
      if (nearbyPharmacies.length === 0) {
        console.log("   → No pharmacies found within range.");
        return ResponseUtil.sendSuccess(res, {
          notifiedCount: 0,
          notifiedPharmacies: []
        }, "No nearby pharmacies found.");
      }

      // 3. Send Notifications (Service Layer)
      const notifiedIds = await pharmacyService.notifyPharmacies(requestId, nearbyPharmacies, userLocation);

      // 4. Response
      return ResponseUtil.sendSuccess(res, {
        notifiedCount: notifiedIds.length,
        notifiedPharmacies: notifiedIds
      }, `Successfully notified ${notifiedIds.length} pharmacies.`);

    } catch (error) {
      console.error("🔥 Critical Error:", error);
      return ResponseUtil.sendError(
        res, 
        'Internal Server Error processing notifications.', 
        500, 
        error
      );
    }
  };
}

export const pharmacyController = new PharmacyController();