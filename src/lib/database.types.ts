export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          date: string;
          notes: string;
          images: string[];
          tags: string[];
          protocol: string | null;
          stage: "characterization" | "in-vitro" | "in-vivo";
          method:
            | "DLS"
            | "TEM"
            | "PCR"
            | "Western"
            | "ELISA"
            | "Flow cytometry"
            | "Electroporation"
            | "Other"
            | null;
          status: "planning" | "in-progress" | "completed" | "failed";
          sample_id: string | null;
          experiment_type: string | null;
          start_time: string | null;
          end_time: string | null;
          file_links: string[];
          files: Json;
          links: Json;
          mouse_vendor: string | null;
          strain: string | null;
          age_weeks: number | null;
          diet: string | null;
          run_number: number | null;
          in_vivo_metadata: Json | null;
          in_vitro_metadata: Json | null;
          characterization_metadata: Json | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          title: string;
          date?: string;
          notes?: string;
          images?: string[];
          tags?: string[];
          protocol?: string | null;
          stage: "characterization" | "in-vitro" | "in-vivo";
          method?:
            | "DLS"
            | "TEM"
            | "PCR"
            | "Western"
            | "ELISA"
            | "Flow cytometry"
            | "Electroporation"
            | "Other"
            | null;
          status?: "planning" | "in-progress" | "completed" | "failed";
          sample_id?: string | null;
          experiment_type?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          file_links?: string[];
          files?: Json;
          links?: Json;
          mouse_vendor?: string | null;
          strain?: string | null;
          age_weeks?: number | null;
          diet?: string | null;
          run_number?: number | null;
          in_vivo_metadata?: Json | null;
          in_vitro_metadata?: Json | null;
          characterization_metadata?: Json | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          date?: string;
          notes?: string;
          images?: string[];
          tags?: string[];
          protocol?: string | null;
          stage?: "characterization" | "in-vitro" | "in-vivo";
          method?:
            | "DLS"
            | "TEM"
            | "PCR"
            | "Western"
            | "ELISA"
            | "Flow cytometry"
            | "Electroporation"
            | "Other"
            | null;
          status?: "planning" | "in-progress" | "completed" | "failed";
          sample_id?: string | null;
          experiment_type?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          file_links?: string[];
          files?: Json;
          links?: Json;
          mouse_vendor?: string | null;
          strain?: string | null;
          age_weeks?: number | null;
          diet?: string | null;
          run_number?: number | null;
          in_vivo_metadata?: Json | null;
          in_vitro_metadata?: Json | null;
          characterization_metadata?: Json | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
