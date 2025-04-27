import { findIconUrl, platforms, Platform } from '@/lib/icons';


describe('Platforms', () => {
  describe('Platform type', () => {
    it('powinno mieć poprawną strukturę typu Platform', () => {
      const platform: Platform = {
        name: 'Test Platform',
        url: 'test.com',
        logo: 'https://test.com/favicon.ico',
      };

      expect(platform).toHaveProperty('name', 'Test Platform');
      expect(platform).toHaveProperty('url', 'test.com');
      expect(platform).toHaveProperty('logo', 'https://test.com/favicon.ico');
    });
  });

  describe('platforms array', () => {
    it('powinno zawierać obiekty zgodne z typem Platform', () => {
      platforms.forEach((platform) => {
        expect(platform).toHaveProperty('name');
        expect(typeof platform.name).toBe('string');
        expect(platform).toHaveProperty('url');
        expect(typeof platform.url).toBe('string');
        expect(platform).toHaveProperty('logo');
        expect(typeof platform.logo).toBe('string');
      });
    });

    it('powinno zawierać poprawne przykładowe platformy', () => {
      expect(platforms).toContainEqual({
        name: 'Google',
        url: 'google.pl',
        logo: 'https://www.google.com/favicon.ico',
      });
      expect(platforms).toContainEqual({
        name: 'YouTube',
        url: 'youtube.com',
        logo: 'https://www.youtube.com/favicon.ico',
      });
    });

    it('powinno mieć co najmniej 10 platform', () => {
      expect(platforms.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('findIconUrl', () => {
    it('powinno zwrócić poprawny URL ikony dla nazwy platformy', () => {
      expect(findIconUrl('Google')).toBe('https://www.google.com/favicon.ico');
      expect(findIconUrl('YouTube')).toBe('https://www.youtube.com/favicon.ico');
      expect(findIconUrl('Allegro')).toBe('https://www.allegro.pl/favicon.ico');
    });

    it('powinno zwrócić poprawny URL ikony dla adresu URL platformy', () => {
      expect(findIconUrl('google.pl')).toBe('https://www.google.com/favicon.ico');
      expect(findIconUrl('youtube.com')).toBe('https://www.youtube.com/favicon.ico');
      expect(findIconUrl('allegro.pl')).toBe('https://www.allegro.pl/favicon.ico');
    });

    it('powinno być niewrażliwe na wielkość liter', () => {
      expect(findIconUrl('GOOGLE')).toBe('https://www.google.com/favicon.ico');
      expect(findIconUrl('youtube.COM')).toBe('https://www.youtube.com/favicon.ico');
    });

    it('powinno ignorować spacje w danych wejściowych', () => {
      expect(findIconUrl('Google  ')).toBe('https://www.google.com/favicon.ico');
      expect(findIconUrl('  You Tube  ')).toBe('https://www.youtube.com/favicon.ico');
    });

    it('powinno zwrócić pusty ciąg dla nieznanej platformy', () => {
      expect(findIconUrl('UnknownPlatform')).toBe('');
      expect(findIconUrl('unknown.com')).toBe('');
    });

    it('powinno obsługiwać częściowe dopasowanie nazwy', () => {
      expect(findIconUrl('YouTube')).toBe('https://www.youtube.com/favicon.ico');
      expect(findIconUrl('You Tube')).toBe('https://www.youtube.com/favicon.ico');
    });

    it('powinno działać poprawnie z pełnymi adresami URL', () => {
      expect(findIconUrl('https://www.google.pl')).toBe('https://www.google.com/favicon.ico');
      expect(findIconUrl('http://www.youtube.com')).toBe('https://www.youtube.com/favicon.ico');
      expect(findIconUrl('www.allegro.pl')).toBe('https://www.allegro.pl/favicon.ico');
    });
  });
});

