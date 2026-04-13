/** Tutarlı önizleme görselleri (picsum yerine) */
export function listingImage(width: number, height: number, label: string): string {
  const safe = encodeURIComponent(label.replace(/[^\w\s-]/g, '').slice(0, 24) || 'Item');
  return `https://placehold.co/${width}x${height}/232736/5b68f6/png?text=${safe}`;
}

export function avatarImage(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.slice(0, 32))}&background=5b68f6&color=fff&size=128`;
}

export function categoryIconLabel(label: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label.slice(0, 2))}&background=32394d&color=fff&size=64&bold=true`;
}
