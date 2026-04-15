const rankOrder = ["CP", "SSP", "SP", "ASP", "AIP", "CPL", "PC"] as const;

function getRankParts(name: string) {
  const parts = name.trim().split(/\s+/);
  const rank = parts[0]?.toUpperCase() || "";
  const remainder = parts.slice(1).join(" ").trim() || name.trim();
  const rankIndex = rankOrder.indexOf(rank as (typeof rankOrder)[number]);

  return {
    rankIndex: rankIndex === -1 ? Number.MAX_SAFE_INTEGER : rankIndex,
    remainder
  };
}

export function compareCommunityNames(a: string, b: string) {
  const left = getRankParts(a);
  const right = getRankParts(b);

  if (left.rankIndex !== right.rankIndex) {
    return left.rankIndex - right.rankIndex;
  }

  return left.remainder.localeCompare(right.remainder, undefined, {
    sensitivity: "base"
  });
}

export function sortCommunityRows<T extends { name: string }>(rows: T[]) {
  return [...rows].sort((a, b) => compareCommunityNames(a.name, b.name));
}
