import { LANDING_SITES, SPECIES_CATALOG, SpeciesType } from '../types/aqua-seal';
import { storageAdapter } from './storage-adapter';

export interface USSDResponse {
  response: string; // Starts with CON or END
  isTerminal: boolean;
  smsNotification?: {
    to: string;
    message: string;
  };
}

/**
 * Africa's Talking USSD Protocol State Machine
 */
export async function handleUSSDRequest(
  sessionId: string,
  serviceCode: string,
  phoneNumber: string,
  text: string
): Promise<USSDResponse> {
  const steps = text ? text.split('*') : [];
  const rootChoice = steps[0];

  // 1. Root Menu
  if (steps.length === 0 || text === '') {
    const menu = [
      'CON Welcome to Aqua-Seal Lake Victoria',
      '1. Register Catch (Fisher/BMU)',
      '2. Update Cold-Chain & Ice',
      '3. Verify Fish Batch ID',
      '4. Record Batch Sale',
      '5. SACCO Catch & Credit Signal',
      '6. Beach Indicative Prices (KES/kg)',
    ].join('\n');
    return { response: menu, isTerminal: false };
  }

  // Future option blocks go here...

  return { response: 'END Invalid choice. Please dial again.', isTerminal: true };
}

// OPTION 1: Register Catch
  if (rootChoice === '1') {
    // Step 1: Choose Species
    if (steps.length === 1) {
      return {
        response: [
          'CON Select Fish Species:',
          '1. Nile Perch (Mbuta)',
          '2. Nile Tilapia (Ngege)',
          '3. Omena / Dagaa',
          '4. African Catfish (Mumi)',
        ].join('\n'),
        isTerminal: false,
      };
    }

    // Step 2: Choose Landing Site
    if (steps.length === 2) {
      return {
        response: [
          'CON Select Landing Beach BMU:',
          '1. Dunga Beach (Kisumu)',
          '2. Uhanya Beach (Siaya)',
          '3. Mbita Point (Homa Bay)',
          '4. Karungu Bay (Migori)',
        ].join('\n'),
        isTerminal: false,
      };
    }

    // Step 3: Enter Weight in Kg
    if (steps.length === 3) {
      return {
        response: 'CON Enter Catch Weight in Kg (e.g. 50):',
        isTerminal: false,
      };
    }

    // Step 4: Confirm & Create
    if (steps.length === 4) {
      const speciesMap: Record<string, SpeciesType> = {
        '1': 'NILE_PERCH',
        '2': 'TILAPIA',
        '3': 'OMENA',
        '4': 'CATFISH',
      };
      const siteMap: Record<string, string> = {
        '1': 'site-dunga',
        '2': 'site-uhanya',
        '3': 'site-mbita',
        '4': 'site-karungu',
      };

      const species = speciesMap[steps[1]] || 'NILE_PERCH';
      const siteId = siteMap[steps[2]] || 'site-dunga';
      const weightKg = parseFloat(steps[3]) || 25;

      const boats = await storageAdapter.getRegisteredBoats();
      const boat = boats.find((b) => b.bmuSiteId === siteId) || boats[0];

      const newBatch = await storageAdapter.createBatch({
        boatRegistration: boat.registrationNumber,
        species,
        landingSiteId: siteId,
        harvestMethod: boat.approvedGear,
        weightKg,
        temperatureCelsius: 4.0,
        iceRatio: '1:1',
        actorName: boat.captainName,
        actorPhone: phoneNumber,
        channel: 'USSD',
      });

      const smsText = `Aqua-Seal: Batch ${newBatch.batchId} registered. ${weightKg}kg ${newBatch.species} at ${newBatch.landingSiteName}. Verified Lake Fresh! View: https://aqua-seal.lakevictoria.org/verify?b=${newBatch.batchId}`;

      return {
        response: `END Catch recorded!\nBatch ID: ${newBatch.batchId}\nWeight: ${weightKg}kg ${newBatch.species}\nSMS confirmation sent to ${phoneNumber}.`,
        isTerminal: true,
        smsNotification: {
          to: phoneNumber,
          message: smsText,
        },
      };
    }
  }