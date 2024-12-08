export type Database = {
  public: {
    Tables: {
      // Add your table definitions here
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          // Add other fields
        };
        Insert: {
          id: string;
          // Add other fields that can be inserted
        };
        Update: {
          // Add fields that can be updated
        };
      };
      // Add other tables
    };
  };
};
