import { cleanYoutubeTitle } from './cleanYoutubeTitle'; // adjust import to your path

describe('cleanYoutubeTitle', () => {
  const tests: { name: string; input: string; result: string }[] = [
    {
      name: 'should clean [Official Video] and (Lyrics)',
      input: 'Travis Scott - Goosebumps (Lyrics) [Official Video]',
      result: 'Travis Scott - Goosebumps',
    },
    {
      name: 'should remove HD, 4K, and video quality indicators',
      input: "Drake - God's Plan 1080p 4K HD",
      result: "Drake - God's Plan",
    },
    {
      name: 'should remove "ft." inside artist part',
      input: 'Miyagi & Эндшпиль feat. KADI - In Love',
      result: 'Miyagi & Эндшпиль - In Love',
    },
    {
      name: 'should remove "feat." after song title',
      input: 'Travis Scott - Goosebumps feat. Kendrick Lamar',
      result: 'Travis Scott - Goosebumps',
    },
    {
      name: 'should remove text after "|" separator',
      input: 'Maroon 5 - Misery (Lyrics) | i am in misery',
      result: 'Maroon 5 - Misery',
    },
    {
      name: 'should clean unnecessary spaces and dashes',
      input: '  Eminem -   Lose Yourself (Official Video)   ',
      result: 'Eminem - Lose Yourself',
    },
    {
      name: 'should handle title without dash gracefully',
      input: 'Lose Yourself (Official Video)',
      result: 'Lose Yourself',
    },
    {
      name: 'should handle titles with parentheses only',
      input: '(Live) Travis Scott - Goosebumps',
      result: 'Travis Scott - Goosebumps',
    },
    {
      name: 'should remove multiple patterns in complex title',
      input: '米津玄師 - Lemon (Live) [Official Video] 4K',
      result: '米津玄師 - Lemon',
    },
    {
      name: 'should correctly handle edge case with "feat." and no dash',
      input: 'Miyagi feat. Andy Panda In Love (Official Audio)',
      result: 'Miyagi',
    },
  ];

  for (const t of tests) {
    it(t.name, () => {
      const result = cleanYoutubeTitle(t.input);

      expect(result).toBe(t.result);
    });
  }
});
