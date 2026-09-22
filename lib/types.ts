// Hand-written types matching supabase/schema.sql. If you change the
// schema, update these to match (or generate them with the Supabase CLI:
// `supabase gen types typescript --project-id <ref> > lib/types.ts`,
// then re-add the convenience aliases below).

export type GiType = "gi" | "nogi" | "gi_nogi";
export type VisitorPolicy = "open" | "conditions" | "members_only";
export type ListingStatus = "active" | "closed";
export type ReportType = "closed" | "members_only" | "correction";

export interface Listing {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string | null;
  day: string;
  time: string;
  gi: GiType;
  fee_cents: number | null;
  fee_note: string | null;
  visitor_policy: VisitorPolicy;
  policy_note: string | null;
  status: ListingStatus;
  source: string;
  report_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingWithRating extends Listing {
  rating_avg: number;
  rating_count: number;
}

export interface Rating {
  id: string;
  listing_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  listing_id: string;
  user_id: string;
  type: ReportType;
  payload: { day?: string; time?: string; fee_note?: string } | null;
  note: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

// Minimal Database type so `createBrowserClient<Database>` / server
// client type-check without generating the full Supabase CLI output.
export type Database = {
  public: {
    Tables: {
      listings: { Row: Listing; Insert: Partial<Listing>; Update: Partial<Listing> };
      ratings: { Row: Rating; Insert: Partial<Rating>; Update: Partial<Rating> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
    };
    Views: {
      listings_with_rating: { Row: ListingWithRating };
    };
    Functions: {
      apply_report: {
        Args: {
          p_listing_id: string;
          p_type: ReportType;
          p_day?: string | null;
          p_time?: string | null;
          p_fee_note?: string | null;
          p_note?: string | null;
        };
        Returns: void;
      };
    };
  };
};
