import { createModel } from '../db/pgModel.js';

const ApiKey = createModel('apiKey', 'api_keys', {
  fields: ['id', 'userId', 'name', 'hashedKey', 'prefix', 'lastUsedAt'],
});

export default ApiKey;
