import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Registration, PetQuestionnaire } from '../types/database';

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegistrations(): UseSupabaseQueryResult<Registration[]> {
  const [data, setData] = useState<Registration[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: registrations, error: fetchError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(registrations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useQuestionnaires(): UseSupabaseQueryResult<PetQuestionnaire[]> {
  const [data, setData] = useState<PetQuestionnaire[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: questionnaires, error: fetchError } = await supabase
        .from('pet_questionnaire')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(questionnaires || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
