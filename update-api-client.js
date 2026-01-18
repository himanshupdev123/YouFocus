const fs = require('fs');

// Read the current file
const currentContent = fs.readFileSync('src/services/YouTubeAPIClient.ts', 'utf8');

// Replace the interface
const updatedContent = currentContent
    .replace(
        'export interface YouTubeAPIClientConfig {\n    /** YouTube Data API v3 key */\n    apiKey: string;',
        'export interface YouTubeAPIClientConfig {\n    /** YouTube Data API v3 key (legacy single key support) */\n    apiKey?: string;\n    /** YouTube Data API v3 keys (multiple keys for quota rotation) */\n    apiKeys?: string[];'
    )
    .replace(
        'import { APICache } from \'./APICache\';',
        'import { APICache } from \'./APICache\';\nimport { APIKeyManager } from \'./APIKeyManager\';'
    )
    .replace(
        'private readonly apiKey: string;',
        'private readonly keyManager: APIKeyManager;'
    )
    .replace(
        'this.apiKey = config.apiKey;',
        `// Support both single key (legacy) and multiple keys (new)
        let keys = [];
        if (config.apiKeys && config.apiKeys.length > 0) {
            keys = config.apiKeys;
        } else if (config.apiKey) {
            keys = [config.apiKey];
        } else {
            throw new Error('Either apiKey or apiKeys must be provided');
        }
        this.keyManager = new APIKeyManager(keys);`
    )
    .replace(
        'this.axiosInstance = axios.create({\n            baseURL: this.baseURL,\n            timeout: 10000,\n            params: {\n                key: this.apiKey\n            }\n        });',
        'this.axiosInstance = axios.create({\n            baseURL: this.baseURL,\n            timeout: 10000\n        });'
    );

// Write the updated content
fs.writeFileSync('src/services/YouTubeAPIClient.ts', updatedContent);
console.log('Updated YouTubeAPIClient.ts successfully');