const passwordHashAlgorithm = 'PBKDF2-SHA256';
const passwordHashIterations = 600_000;
const passwordHashBytes = 32;

const textEncoder = new TextEncoder();

function encodeBase64Url(value: Uint8Array): string {
  let binary = '';

  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/') + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const output = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations,
    },
    key,
    passwordHashBytes * 8,
  );

  return new Uint8Array(output);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index]! ^ right[index]!;
  }

  return difference === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, passwordHashIterations);

  return [
    passwordHashAlgorithm,
    String(passwordHashIterations),
    encodeBase64Url(salt),
    encodeBase64Url(hash),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationValue, encodedSalt, encodedHash, extra] = storedHash.split('$');
  const iterations = Number(iterationValue);

  if (
    algorithm !== passwordHashAlgorithm ||
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 1_000_000 ||
    !encodedSalt ||
    !encodedHash ||
    extra
  ) {
    return false;
  }

  try {
    const expectedHash = decodeBase64Url(encodedHash);
    const actualHash = await derivePasswordHash(password, decodeBase64Url(encodedSalt), iterations);

    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}
