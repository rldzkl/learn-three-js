export type Rapier = typeof import("@dimforge/rapier3d-compat");

export async function getRapier() {
  // eslint-disable-next-line import/no-named-as-default-member
  return await import("@dimforge/rapier3d-compat");
}
