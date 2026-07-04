export type Route =
  | { view: 'home' }
  | { view: 'edit'; id: string }
  | { view: 'play'; id: string }
  | { view: 'import'; q: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [path = '', query = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'edit' && parts[1]) return { view: 'edit', id: parts[1] };
  if (parts[0] === 'play' && parts[1]) return { view: 'play', id: parts[1] };
  if (parts[0] === 'import') {
    const q = new URLSearchParams(query).get('q');
    if (q) return { view: 'import', q };
  }
  return { view: 'home' };
}

export function navigate(path: string): void {
  location.hash = path;
}
