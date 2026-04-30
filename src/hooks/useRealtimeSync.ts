import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSync(
  table: string,
  onUpdate: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtimeListener = async () => {
      try {
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
            },
            () => {
              console.log(`Real-time update received for ${table}`);
              onUpdate();
            }
          )
          .subscribe();

        console.log(`Subscribed to real-time updates for ${table}`);
      } catch (error) {
        console.error(`Failed to setup realtime listener for ${table}:`, error);
      }
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, onUpdate, ...deps]);
}
