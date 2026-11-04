import { normalizeStamp, type Stamp } from "./adapter.ts";

export interface Holding {
  stampId: string;
  quantity: string;
}

export interface Profile {
  address: string;
  username: string | null;
  bio: string | null;
  holdings: Holding[] | null;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  creatorAddresses: string[];
  stampIds: string[];
}

/** Prices are integer satoshis per stamp unit, never JavaScript floats. */
export interface Listing {
  id: string;
  stampId: string;
  seller: string;
  priceSats: string;
  available: string;
  status: "open" | "closed";
  timestamp: string;
  txHash: string;
}

export interface Activity {
  id: string;
  kind: "sale" | "transfer";
  stampId: string;
  from: string;
  to: string;
  quantity: string;
  priceSats: string | null;
  timestamp: string;
  txHash: string;
}

type Row = Record<string, unknown>;
function row(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid catalog record");
  }
  return value as Row;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > 1000) {
    throw new Error("Invalid catalog array");
  }
  return value;
}
function text(value: unknown, maximum = 256): string {
  if (
    typeof value !== "string" || value.length < 1 ||
    value.length > maximum || [...value].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    })
  ) throw new Error("Invalid catalog text");
  return value;
}
function nullableText(value: unknown, maximum = 256): string | null {
  return value === null || value === undefined ? null : text(value, maximum);
}
function identifier(value: unknown): string {
  const result = typeof value === "number" && Number.isSafeInteger(value)
    ? String(value)
    : text(value, 30);
  if (!/^-?(?:0|[1-9]\d*)$/.test(result) || result === "-0") {
    throw new Error("Invalid stamp identifier");
  }
  return result;
}
function quantity(value: unknown): string {
  const result = text(value, 100);
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(result)) {
    throw new Error("Invalid catalog quantity");
  }
  return result;
}
function sats(value: unknown): string {
  const result = text(value, 30);
  if (!/^(?:0|[1-9]\d*)$/.test(result)) {
    throw new Error("Invalid satoshi price");
  }
  return result;
}
function address(value: unknown): string {
  const result = text(value, 100);
  if (!/^[a-zA-Z0-9]{14,90}$/.test(result)) {
    throw new Error("Invalid catalog address");
  }
  return result;
}
function key(value: unknown): string {
  const result = text(value, 80);
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) {
    throw new Error("Invalid catalog key");
  }
  return result;
}
function hash(value: unknown): string {
  const result = text(value, 64);
  if (!/^[a-f0-9]{64}$/.test(result)) {
    throw new Error("Invalid catalog transaction hash");
  }
  return result;
}
function timestamp(value: unknown): string {
  const result = text(value, 40);
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(result) ||
    !Number.isFinite(Date.parse(result))
  ) {
    throw new Error("Invalid catalog timestamp");
  }
  return result;
}
function unique<T>(items: T[], getKey: (item: T) => string): T[] {
  if (new Set(items.map(getKey)).size !== items.length) {
    throw new Error("Duplicate catalog identity");
  }
  return items;
}
function copy<T>(value: T): T {
  return structuredClone(value);
}

/** Fixed review data only. This module has no network, file or environment IO. */
export function createCatalog(rawCatalog: unknown, rawStamps: unknown) {
  const input = row(rawCatalog);
  if (input.source !== "fixture") {
    throw new Error("The preview catalog must be labelled fixture");
  }
  const stamps = unique(
    list(row(rawStamps).data).map(normalizeStamp),
    (stamp) => stamp.id,
  );
  const stampMap = new Map(stamps.map((stamp) => [stamp.id, stamp]));
  const stampId = (value: unknown) => {
    const id = identifier(value);
    if (!stampMap.has(id)) throw new Error("Unknown catalog stamp reference");
    return id;
  };
  const profiles = new Map<string, Profile>();
  for (const stamp of stamps) {
    if (stamp.creator && !profiles.has(stamp.creator)) {
      profiles.set(stamp.creator, {
        address: stamp.creator,
        username: stamp.creatorName,
        bio: null,
        holdings: null,
      });
    }
  }
  const overrides = unique(
    list(input.profiles).map((value): Profile => {
      const item = row(value);
      return {
        address: address(item.address),
        username: nullableText(item.username, 100),
        bio: nullableText(item.bio, 1000),
        holdings: item.holdings === null ? null : unique(
          list(item.holdings).map((entry): Holding => {
            const holding = row(entry);
            return {
              stampId: stampId(holding.stampId),
              quantity: quantity(holding.quantity),
            };
          }),
          (holding) => holding.stampId,
        ),
      };
    }),
    (profile) => profile.address,
  );
  for (const profile of overrides) profiles.set(profile.address, profile);
  unique(
    [...profiles.values()].filter((profile) => profile.username),
    (profile) => profile.username!.toLowerCase(),
  );
  const knownAddress = (value: unknown) => {
    const result = address(value);
    if (!profiles.has(result)) {
      throw new Error("Unknown catalog profile reference");
    }
    return result;
  };
  const collections = unique(
    list(input.collections).map((value): Collection => {
      const item = row(value);
      return {
        id: key(item.id),
        name: text(item.name, 100),
        description: text(item.description, 1000),
        creatorAddresses: unique(
          list(item.creatorAddresses).map(knownAddress),
          (entry) => entry,
        ),
        stampIds: unique(list(item.stampIds).map(stampId), (entry) => entry),
      };
    }),
    (collection) => collection.id,
  );
  const listings = unique(
    list(input.listings).map((value): Listing => {
      const item = row(value);
      if (item.status !== "open" && item.status !== "closed") {
        throw new Error("Invalid listing status");
      }
      const result: Listing = {
        id: key(item.id),
        stampId: stampId(item.stampId),
        seller: knownAddress(item.seller),
        priceSats: sats(item.priceSats),
        available: quantity(item.available),
        status: item.status,
        timestamp: timestamp(item.timestamp),
        txHash: hash(item.txHash),
      };
      if (
        result.status === "closed" && !/^0(?:\.0+)?$/.test(result.available)
      ) {
        throw new Error("Closed listing has nonzero availability");
      }
      return result;
    }),
    (listing) => listing.id,
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const activity = unique(
    list(input.activity).map((value): Activity => {
      const item = row(value);
      if (item.kind !== "sale" && item.kind !== "transfer") {
        throw new Error("Invalid activity kind");
      }
      if (item.kind === "transfer" && item.priceSats !== null) {
        throw new Error("A transfer cannot be given an inferred sale price");
      }
      return {
        id: key(item.id),
        kind: item.kind,
        stampId: stampId(item.stampId),
        from: knownAddress(item.from),
        to: knownAddress(item.to),
        quantity: quantity(item.quantity),
        priceSats: item.priceSats === null ? null : sats(item.priceSats),
        timestamp: timestamp(item.timestamp),
        txHash: hash(item.txHash),
      };
    }),
    (event) => event.id,
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  function findProfile(value: string): Profile | null {
    if (profiles.has(value)) return profiles.get(value)!;
    const name = value.toLowerCase();
    return [...profiles.values()].find((profile) =>
      profile.username?.toLowerCase() === name
    ) ?? null;
  }
  return {
    source: "fixture" as const,
    description: text(input.description, 2000),
    stamp(id: string): Stamp | null {
      return copy(stampMap.get(id) ?? null);
    },
    profile(value: string): Profile | null {
      return copy(findProfile(value));
    },
    created(value: string): Stamp[] {
      const profile = findProfile(value);
      return copy(
        profile
          ? stamps.filter((stamp) => stamp.creator === profile.address)
          : [],
      );
    },
    held(value: string): { stamp: Stamp; quantity: string }[] | null {
      const profile = findProfile(value);
      return profile?.holdings === null || !profile
        ? null
        : profile.holdings.map((holding) => ({
          stamp: copy(stampMap.get(holding.stampId)!),
          quantity: holding.quantity,
        }));
    },
    collections(query = ""): Collection[] {
      const q = query.trim().toLowerCase();
      return copy(
        collections.filter((collection) =>
          !q ||
          `${collection.name} ${collection.description}`.toLowerCase().includes(
            q,
          )
        ),
      );
    },
    collection(id: string): Collection | null {
      return copy(
        collections.find((collection) => collection.id === id) ?? null,
      );
    },
    collectionsForProfile(value: string): Collection[] {
      const profile = findProfile(value);
      return copy(
        profile
          ? collections.filter((collection) =>
            collection.creatorAddresses.includes(profile.address)
          )
          : [],
      );
    },
    collectionsForStamp(id: string): Collection[] {
      return copy(
        collections.filter((collection) => collection.stampIds.includes(id)),
      );
    },
    listings(
      filters: { status?: "open" | "closed" | "all"; stampId?: string } = {},
    ): Listing[] {
      return copy(
        listings.filter((listing) =>
          (!filters.stampId || listing.stampId === filters.stampId) &&
          (!filters.status || filters.status === "all" ||
            listing.status === filters.status)
        ),
      );
    },
    activity(
      filters: { kind?: "sale" | "transfer" | "all"; stampId?: string } = {},
    ): Activity[] {
      return copy(
        activity.filter((event) =>
          (!filters.stampId || event.stampId === filters.stampId) &&
          (!filters.kind || filters.kind === "all" ||
            event.kind === filters.kind)
        ),
      );
    },
    search(query: string) {
      const q = query.trim();
      if (!q || q.length > 100) {
        return { stamps: [], profiles: [], collections: [], truncated: false };
      }
      const folded = q.toLowerCase();
      const numeric = /^(?:stamp\s*)?#?(-?(?:0|[1-9]\d*))$/i.exec(q)?.[1];
      const matchedStamps = stamps.filter((stamp) =>
        (numeric !== undefined && stamp.id === numeric) ||
        stamp.cpid.toLowerCase() === folded || stamp.txHash === folded ||
        stamp.name?.toLowerCase().includes(folded)
      );
      const matchedProfiles = [...profiles.values()].filter((profile) =>
        profile.address === q ||
        profile.username?.toLowerCase().includes(folded)
      );
      const matchedCollections = collections.filter((collection) =>
        `${collection.name} ${collection.description}`.toLowerCase().includes(
          folded,
        )
      );
      return copy({
        stamps: matchedStamps.slice(0, 8),
        profiles: matchedProfiles.slice(0, 8),
        collections: matchedCollections.slice(0, 8),
        truncated: matchedStamps.length > 8 || matchedProfiles.length > 8 ||
          matchedCollections.length > 8,
      });
    },
  };
}
