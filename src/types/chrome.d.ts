// Chrome extension type definitions
declare namespace chrome {
  namespace identity {
    function getAuthToken(details: { interactive: boolean }, callback: (token?: string) => void): void;
  }
  
  namespace storage {
    interface StorageArea {
      get(keys: string[]): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string[]): Promise<void>;
    }

    const local: StorageArea;
    const sync: StorageArea;
  }
  
  namespace runtime {
    const lastError: { message?: string } | undefined;
    function sendMessage(message: any, callback?: (response: any) => void): void;
    const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response: any) => void) => void): void;
    };
    const onInstalled: {
      addListener(callback: () => void): void;
    };
  }
}

interface ChromeStorageData {
  writingPurpose?: string;
} 