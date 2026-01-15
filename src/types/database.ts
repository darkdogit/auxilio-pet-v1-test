export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  ip_address?: string;
  selfie_url?: string;
  pet_photos?: string[];
  created_at: string;
}

export interface PetQuestionnaire {
  id: string;
  registration_id: string;
  quantidade_pets?: number;
  alimentacao?: string;
  frequencia_alimentacao?: string;
  origem?: string;
  emergencia_financeira?: string;
  vacinas?: string;
  castrado?: string;
  controle_parasitas?: string;
  dificuldade_financeira?: string;
  created_at: string;
}

export interface Pet {
  id: string;
  registration_id: string;
  pet_type: string;
  breed: string;
  age: string;
  name: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, 'id' | 'created_at'>;
        Update: Partial<Omit<Registration, 'id' | 'created_at'>>;
        Relationships: [];
      };
      pet_questionnaire: {
        Row: PetQuestionnaire;
        Insert: Omit<PetQuestionnaire, 'id' | 'created_at'>;
        Update: Partial<Omit<PetQuestionnaire, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "pet_questionnaire_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "registrations";
            referencedColumns: ["id"];
          }
        ];
      };
      pets: {
        Row: Pet;
        Insert: Omit<Pet, 'id' | 'created_at'>;
        Update: Partial<Omit<Pet, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "pets_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "registrations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}