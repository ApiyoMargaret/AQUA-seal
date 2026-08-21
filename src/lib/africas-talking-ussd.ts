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