
import { KJUR, hextob64 } from 'jsrsasign';

const API_KEY = process.env.NEXT_PUBLIC_CHANGELLY_C2C_API_KEY;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_CHANGELLY_C2C_PRIVATE_KEY?.replace(/\\n/g, '\n');
const API_URL = 'https://api.changelly.com/v2';

// Function to sign the request payload
const signMessage = (message: string) => {
  if (!PRIVATE_KEY) {
    throw new Error('Private key is not defined in environment variables.');
  }
  // Create a new signature object
  const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
  // Initialize with the private key
  sig.init(PRIVATE_KEY);
  // Add the message to be signed
  sig.updateString(message);
  // Get the signature in hex format and convert it to Base64
  const hexSignature = sig.sign();
  return hextob64(hexSignature);
};

// Generic function to make a signed API request
const apiRequest = async (method: string, params: any = {}) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    id: 'test',
    method: method,
    params: params,
  });

  const signature = signMessage(message);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'X-Api-Signature': signature,
      },
      body: message,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  } catch (error) {
    console.error(`Error in ${method}:`, error);
    throw error; // Re-throw the error to be handled by the component
  }
};

// --- API Methods ---

export const getCurrenciesFull = () => apiRequest('getCurrenciesFull');

export const getPairsParams = (from: string, to: string) => apiRequest('getPairsParams', { from, to });

export const getExchangeAmount = (from: string, to: string, amount: string) =>
  apiRequest('getExchangeAmount', [{ from, to, amount }]);

export const createTransaction = (from: string, to: string, amount: string, address: string) =>
  apiRequest('createTransaction', { from, to, amount, address });
  
export const getTransaction = (id: string) => apiRequest('getTransaction', { id });

export const getTransactions = (limit = 10, offset = 0, currency = null, address = null) =>
  apiRequest('getTransactions', { limit, offset, currency, address });
