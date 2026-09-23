/** Body scroll-u bağlayır; qaytarılan funksiya açır. İç-içə modallar üçün sayğaclı. */
let locks = 0;
export function lockScroll(): () => void {
  if (locks++ === 0) document.documentElement.style.overflow = 'hidden';
  return () => {
    if (--locks === 0) document.documentElement.style.overflow = '';
  };
}
