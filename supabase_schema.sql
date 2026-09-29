-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR PDUDE PORTAL
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL DEFAULT '{}'::jsonb,
    tagline JSONB DEFAULT '{}'::jsonb,
    description JSONB DEFAULT '{}'::jsonb,
    icon TEXT,
    badge TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by slug
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 3. Sites Table
CREATE TABLE IF NOT EXISTS public.sites (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    domain TEXT,
    url TEXT NOT NULL,
    category_slug TEXT REFERENCES public.categories(slug) ON DELETE CASCADE,
    rating NUMERIC(3, 1) DEFAULT 9.0,
    review_count INT DEFAULT 0,
    votes_count INT DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    is_safe BOOLEAN DEFAULT true,
    is_18_plus BOOLEAN DEFAULT true,
    is_trending BOOLEAN DEFAULT false,
    rank_change TEXT DEFAULT 'same',
    badge TEXT,
    short_description JSONB DEFAULT '{}'::jsonb,
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    logo_url TEXT,
    thumbnail_url TEXT,
    pricing_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_slug ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_category_slug ON public.sites(category_slug);
CREATE INDEX IF NOT EXISTS idx_sites_rating ON public.sites(rating DESC);

-- 4. User Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_slug TEXT REFERENCES public.sites(slug) ON DELETE CASCADE,
    user_name TEXT DEFAULT 'Anonymous',
    user_avatar TEXT,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
    comment TEXT NOT NULL,
    likes INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_site ON public.reviews(site_slug);

-- 5. Site Click / Analytics Tracker
CREATE TABLE IF NOT EXISTS public.site_clicks (
    id BIGSERIAL PRIMARY KEY,
    site_slug TEXT REFERENCES public.sites(slug) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    country_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_clicks_slug ON public.site_clicks(site_slug);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_clicks ENABLE ROW LEVEL SECURITY;

-- 7. Public Read Access Policies (Anyone can read sites, categories, reviews)
CREATE POLICY "Allow public read access on categories"
ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access on sites"
ON public.sites FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access on reviews"
ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved = true);

-- 8. Public User Review Submission Policy
CREATE POLICY "Allow public user reviews insert"
ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 9. Public Click Tracking Insert Policy
CREATE POLICY "Allow public click tracking insert"
ON public.site_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 10. Full Access for Service Role (Admin)
CREATE POLICY "Allow service role full access on categories"
ON public.categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on sites"
ON public.sites FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on reviews"
ON public.reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on site_clicks"
ON public.site_clicks FOR ALL TO service_role USING (true) WITH CHECK (true);
