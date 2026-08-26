import ApiKey from '../models/ApiKeyModel.js';
import { generateApiKey } from '../utils/apiKeyUtils.js';

const MAX_KEYS_PER_USER = 10;

export const listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user._id })
      .select('name prefix lastUsedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(keys);
  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({ message: 'Error listing API keys' });
  }
};

export const createApiKey = async (req, res) => {
  try {
    const name = (req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'A key name is required' });
    }

    const existingCount = await ApiKey.countDocuments({ userId: req.user._id });
    if (existingCount >= MAX_KEYS_PER_USER) {
      return res.status(400).json({
        message: `You can have at most ${MAX_KEYS_PER_USER} API keys. Revoke one first.`,
      });
    }

    const { key, hashedKey, prefix } = generateApiKey();
    const created = await ApiKey.create({
      userId: req.user._id,
      name,
      hashedKey,
      prefix,
    });

    res.status(201).json({
      id: created._id,
      name: created.name,
      prefix: created.prefix,
      key,
      createdAt: created.createdAt,
      warning: 'Copy this key now. You will not be able to see it again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Error creating API key' });
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const deleted = await ApiKey.findOneAndDelete({
      _id: keyId,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.status(200).json({ message: 'API key revoked', id: deleted._id });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ message: 'Error revoking API key' });
  }
};
