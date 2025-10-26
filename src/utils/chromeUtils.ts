type MessageResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };

// Add storage types
export type StorageData = {
  [key: string]: any;
};

export async function sendToBg<T, P extends object = object>(
    message: string, 
    payload: P
  ): Promise<T> {
    try {
      const response = await chrome.runtime.sendMessage({
        message,
        ...payload
      }) as MessageResponse<T>;
  
      if (response.success) {
        return response.data as T;
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred');
    }
  }

// Add storage utility functions
export async function saveToStorage(key: string, data: any): Promise<void> {
  try {
    await sendToBg('saveToStorage', { key, data });
  } catch (error) {
    console.error('Error saving to storage:', error);
    throw error;
  }
}

export async function getFromStorage<T>(key: string): Promise<T | null> {
  try {
    return await sendToBg<T>('getFromStorage', { key });
  } catch (error) {
    console.error('Error getting from storage:', error);
    throw error;
  }
}

export async function removeFromStorage(key: string): Promise<void> {
  try {
    await sendToBg('removeFromStorage', { key });
  } catch (error) {
    console.error('Error removing from storage:', error);
    throw error;
  }
}