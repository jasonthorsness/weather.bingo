export async function searchLatLon(v: string) {
  return fetch(`/e/x?z=${v}`);
}
