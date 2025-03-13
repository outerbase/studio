export function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}
