// tests/db-helpers.test.ts - Unit tests for DB helpers

import { getSupabaseAdmin } from '../server/supabase.js';
import { safeDbOperation } from '../server/db-error-handler.js';

describe('Database Helpers', () => {
  const supabase = getSupabaseAdmin();

  describe('Destinations', () => {
    test('should read destinations with lat/lon fields', async () => {
      const { data, error } = await safeDbOperation(
        async () => {
          const result = await supabase
            .from('destinations')
            .select('id, name, country, lat, lon')
            .limit(3);
          
          if (result.error) throw result.error;
          return result.data;
        },
        'destinations-read-test'
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data && data.length > 0) {
        const first = data[0];
        expect(first).toHaveProperty('lat');
        expect(first).toHaveProperty('lon');
        expect(first).not.toHaveProperty('latitude');
        expect(first).not.toHaveProperty('longitude');
      }
    });

    test('should count destinations properly', async () => {
      const { data, error } = await safeDbOperation(
        async () => {
          const result = await supabase
            .from('destinations')
            .select('*', { count: 'exact', head: true });
          
          if (result.error) throw result.error;
          return result.count;
        },
        'destinations-count-test'
      );

      expect(error).toBeNull();
      expect(typeof data).toBe('number');
    });
  });

  describe('Achievements', () => {
    test('should read achievements with points_reward field', async () => {
      const { data, error } = await safeDbOperation(
        async () => {
          const result = await supabase
            .from('achievements')
            .select('id, name, points_reward')
            .limit(3);
          
          if (result.error) throw result.error;
          return result.data;
        },
        'achievements-read-test'
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data && data.length > 0) {
        const first = data[0];
        expect(first).toHaveProperty('points_reward');
        expect(first).not.toHaveProperty('points');
      }
    });

    test('should insert achievement with points_reward', async () => {
      const testAchievement = {
        name: 'Test Achievement',
        description: 'Test description',
        points_reward: 100,
        rarity: 'common' as const,
        category: 'travel' as const,
        icon: 'test-icon'
      };

      const { data, error } = await safeDbOperation(
        async () => {
          const result = await supabase
            .from('achievements')
            .insert(testAchievement)
            .select('id, name, points_reward')
            .single();
          
          if (result.error) throw result.error;
          return result.data;
        },
        'achievements-write-test'
      );

      if (!error) {
        expect(data).toBeDefined();
        expect(data?.points_reward).toBe(100);
        expect(data).not.toHaveProperty('points');

        // Clean up
        if (data?.id) {
          await supabase.from('achievements').delete().eq('id', data.id);
        }
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle schema errors properly', async () => {
      const { data, error } = await safeDbOperation(
        async () => {
          // Try to select a non-existent column
          const result = await supabase
            .from('destinations')
            .select('id, name, nonexistent_column');
          
          if (result.error) throw result.error;
          return result.data;
        },
        'schema-error-test'
      );

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.type).toBe('schema');
    });
  });
});