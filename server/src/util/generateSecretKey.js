import crypto from 'crypto';

export function generateSecretKey() {
    return crypto.randomBytes(64).toString('hex');
}

// Example usage:
const secretKey = generateSecretKey();
console.log('Generated Secret Key:', secretKey);