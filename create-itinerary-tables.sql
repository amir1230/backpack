-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL,
    title varchar NOT NULL,
    plan_json jsonb NOT NULL,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Create itinerary_items table (for future detailed breakdown)
CREATE TABLE IF NOT EXISTS itinerary_items (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id varchar NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number integer NOT NULL,
    location varchar NOT NULL,
    activity_type varchar,
    description text,
    estimated_cost decimal(10,2),
    start_time time,
    end_time time,
    notes text,
    created_at timestamp DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for itineraries
CREATE POLICY "Users can view their own itineraries" ON itineraries
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own itineraries" ON itineraries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own itineraries" ON itineraries
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own itineraries" ON itineraries
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for itinerary_items
CREATE POLICY "Users can view their own itinerary items" ON itinerary_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE itineraries.id = itinerary_items.itinerary_id 
        AND itineraries.user_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert their own itinerary items" ON itinerary_items
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE itineraries.id = itinerary_items.itinerary_id 
        AND itineraries.user_id = auth.uid()::text
    ));

CREATE POLICY "Users can update their own itinerary items" ON itinerary_items
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE itineraries.id = itinerary_items.itinerary_id 
        AND itineraries.user_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete their own itinerary items" ON itinerary_items
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM itineraries 
        WHERE itineraries.id = itinerary_items.itinerary_id 
        AND itineraries.user_id = auth.uid()::text
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON itineraries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_number ON itinerary_items(itinerary_id, day_number);