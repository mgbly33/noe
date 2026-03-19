import { describe, expect, it } from 'vitest';

import {
  getDefaultTheme,
  getThemeBySlug,
  mapThemeToTopicType,
} from './ritual-themes';

describe('ritual themes', () => {
  it('maps healing-focused theme slugs to the current backend topic types', () => {
    expect(mapThemeToTopicType('emotion-healing')).toBe('emotion');
    expect(mapThemeToTopicType('future-direction')).toBe('career');
    expect(mapThemeToTopicType('energy-cleansing')).toBe('growth');
  });

  it('returns a stable default theme', () => {
    expect(getDefaultTheme().slug).toBe('emotion-healing');
  });

  it('returns theme metadata for a valid slug', () => {
    expect(getThemeBySlug('relationship-repair')?.topicType).toBe('emotion');
  });
});
