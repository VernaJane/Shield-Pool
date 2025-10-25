import { openDB } from "idb";

type StoredValue = {
  // Accept any shape; SDK evolves and may return objects or strings
  publicKey: unknown;
  publicParams: unknown;
};

const DB_NAME = "fhevm-public-key-db";
const STORE_NAME = "keys";

export async function publicKeyStorageGet(
  aclAddress: `0x${string}`
): Promise<StoredValue> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  const value = await db.get(STORE_NAME, aclAddress);
  if (value && typeof value === "object" && "publicKey" in value) {
    return value as StoredValue;
  }
  return { publicKey: null, publicParams: null };
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: unknown,
  publicParams: unknown
) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, { publicKey, publicParams }, aclAddress);
}


