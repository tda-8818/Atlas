import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    hashedKey: {
      type: String,
      required: true,
      unique: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ApiKey = mongoose.model('apiKey', apiKeySchema);

export default ApiKey;
