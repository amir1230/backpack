-- Localized RPC functions for TripWise
-- These functions return data with localized names and descriptions based on locale

-- Function to get localized destinations
CREATE OR REPLACE FUNCTION get_destinations_localized(p_locale text DEFAULT 'en')
RETURNS TABLE (
  id integer,
  location_id varchar,
  name varchar,
  name_localized varchar,
  lat decimal,
  lon decimal,
  address_street1 varchar,
  address_street2 varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  address_string text,
  web_url text,
  photo_count integer,
  timezone varchar,
  created_at timestamp,
  updated_at timestamp
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    d.id,
    d.location_id,
    d.name,
    CASE 
      WHEN p_locale = 'he' THEN COALESCE(d.name_he, d.name)
      ELSE d.name
    END as name_localized,
    d.lat,
    d.lon,
    d.address_street1,
    d.address_street2,
    d.city,
    d.state,
    d.country,
    d.postal_code,
    d.address_string,
    d.web_url,
    d.photo_count,
    d.timezone,
    d.created_at,
    d.updated_at
  FROM destinations d
  ORDER BY d.name;
$$;

-- Function to get localized accommodations
CREATE OR REPLACE FUNCTION get_accommodations_localized(p_locale text DEFAULT 'en')
RETURNS TABLE (
  id integer,
  location_id varchar,
  destination_id integer,
  name varchar,
  name_localized varchar,
  rating decimal,
  num_reviews integer,
  price_level varchar,
  category varchar,
  category_localized varchar,
  lat decimal,
  lon decimal,
  address_street1 varchar,
  address_street2 varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  address_string text,
  web_url text,
  write_review_url text,
  booking_url text,
  is_bookable boolean,
  photo_count integer,
  ranking integer,
  ranking_out_of integer,
  ranking_string varchar,
  geo_location_id varchar,
  geo_location_name varchar,
  amenities text[],
  awards jsonb,
  created_at timestamp,
  updated_at timestamp
)
LANGUAGE sql  
STABLE
AS $$
  SELECT 
    a.id,
    a.location_id,
    a.destination_id,
    a.name,
    CASE 
      WHEN p_locale = 'he' THEN COALESCE(a.name_he, a.name)
      ELSE a.name
    END as name_localized,
    a.rating,
    a.num_reviews,
    a.price_level,
    a.category,
    CASE 
      WHEN p_locale = 'he' THEN 
        CASE a.category
          WHEN 'hotel' THEN 'מלון'
          WHEN 'bed_and_breakfast' THEN 'בית הארחה'
          WHEN 'hostel' THEN 'הוסטל'
          WHEN 'apartment' THEN 'דירה'
          WHEN 'resort' THEN 'אתר נופש'
          ELSE a.category
        END
      ELSE a.category
    END as category_localized,
    a.lat,
    a.lon,
    a.address_street1,
    a.address_street2,
    a.city,
    a.state,
    a.country,
    a.postal_code,
    a.address_string,
    a.web_url,
    a.write_review_url,
    a.booking_url,
    a.is_bookable,
    a.photo_count,
    a.ranking,
    a.ranking_out_of,
    a.ranking_string,
    a.geo_location_id,
    a.geo_location_name,
    a.amenities,
    a.awards,
    a.created_at,
    a.updated_at
  FROM accommodations a
  ORDER BY a.name;
$$;

-- Function to get localized attractions
CREATE OR REPLACE FUNCTION get_attractions_localized(p_locale text DEFAULT 'en')
RETURNS TABLE (
  id integer,
  location_id varchar,
  destination_id integer,
  name varchar,
  name_localized varchar,
  rating decimal,
  num_reviews integer,
  price_level varchar,
  category varchar,
  category_localized varchar,
  subcategory varchar,
  attraction_types text[],
  lat decimal,
  lon decimal,
  address_street1 varchar,
  address_street2 varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  address_string text,
  web_url text,
  write_review_url text,
  photo_count integer,
  ranking integer,
  ranking_out_of integer,
  ranking_string varchar,
  geo_location_id varchar,
  geo_location_name varchar,
  hours jsonb,
  awards jsonb,
  groups jsonb,
  created_at timestamp,
  updated_at timestamp
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    a.id,
    a.location_id,
    a.destination_id,
    a.name,
    CASE 
      WHEN p_locale = 'he' THEN COALESCE(a.name_he, a.name)
      ELSE a.name
    END as name_localized,
    a.rating,
    a.num_reviews,
    a.price_level,
    a.category,
    CASE 
      WHEN p_locale = 'he' THEN 
        CASE a.category
          WHEN 'attraction' THEN 'אטרקציה'
          WHEN 'museum' THEN 'מוזיאון'
          WHEN 'park' THEN 'פארק'
          WHEN 'landmark' THEN 'נקודת ציון'
          WHEN 'beach' THEN 'חוף'
          WHEN 'shopping' THEN 'קניות'
          WHEN 'entertainment' THEN 'בידור'
          ELSE a.category
        END
      ELSE a.category
    END as category_localized,
    a.subcategory,
    a.attraction_types,
    a.lat,
    a.lon,
    a.address_street1,
    a.address_street2,
    a.city,
    a.state,
    a.country,
    a.postal_code,
    a.address_string,
    a.web_url,
    a.write_review_url,
    a.photo_count,
    a.ranking,
    a.ranking_out_of,
    a.ranking_string,
    a.geo_location_id,
    a.geo_location_name,
    a.hours,
    a.awards,
    a.groups,
    a.created_at,
    a.updated_at
  FROM attractions a
  ORDER BY a.name;
$$;

-- Function to get localized restaurants
CREATE OR REPLACE FUNCTION get_restaurants_localized(p_locale text DEFAULT 'en')
RETURNS TABLE (
  id integer,
  location_id varchar,
  destination_id integer,
  name varchar,
  name_localized varchar,
  rating decimal,
  num_reviews integer,
  price_level varchar,
  category varchar,
  category_localized varchar,
  cuisine text[],
  cuisine_localized text[],
  lat decimal,
  lon decimal,
  address_street1 varchar,
  address_street2 varchar,
  city varchar,
  state varchar,
  country varchar,
  postal_code varchar,
  address_string text,
  web_url text,
  write_review_url text,
  photo_count integer,
  ranking integer,
  ranking_out_of integer,
  ranking_string varchar,
  geo_location_id varchar,
  geo_location_name varchar,
  hours jsonb,
  awards jsonb,
  dietary_restrictions text[],
  created_at timestamp,
  updated_at timestamp
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    r.id,
    r.location_id,
    r.destination_id,
    r.name,
    CASE 
      WHEN p_locale = 'he' THEN COALESCE(r.name_he, r.name)
      ELSE r.name
    END as name_localized,
    r.rating,
    r.num_reviews,
    r.price_level,
    r.category,
    CASE 
      WHEN p_locale = 'he' THEN 
        CASE r.category
          WHEN 'restaurant' THEN 'מסעדה'
          WHEN 'cafe' THEN 'בית קפה'
          WHEN 'bar' THEN 'בר'
          WHEN 'fast_food' THEN 'מזון מהיר'
          WHEN 'food_truck' THEN 'משאית אוכל'
          ELSE r.category
        END
      ELSE r.category
    END as category_localized,
    r.cuisine,
    CASE 
      WHEN p_locale = 'he' THEN 
        ARRAY(
          SELECT CASE cuisine_item
            WHEN 'italian' THEN 'איטלקית'
            WHEN 'mexican' THEN 'מקסיקנית'
            WHEN 'chinese' THEN 'סינית'
            WHEN 'japanese' THEN 'יפנית'
            WHEN 'indian' THEN 'הודית'
            WHEN 'thai' THEN 'תאילנדית'
            WHEN 'french' THEN 'צרפתית'
            WHEN 'american' THEN 'אמריקנית'
            WHEN 'mediterranean' THEN 'ים תיכונית'
            WHEN 'seafood' THEN 'פירות ים'
            WHEN 'vegetarian' THEN 'צמחונית'
            WHEN 'vegan' THEN 'טבעונית'
            WHEN 'bbq' THEN 'ברביקיו'
            WHEN 'pizza' THEN 'פיצה'
            WHEN 'sushi' THEN 'סושי'
            ELSE cuisine_item
          END
          FROM unnest(r.cuisine) AS cuisine_item
        )
      ELSE r.cuisine
    END as cuisine_localized,
    r.lat,
    r.lon,
    r.address_street1,
    r.address_street2,
    r.city,
    r.state,
    r.country,
    r.postal_code,
    r.address_string,
    r.web_url,
    r.write_review_url,
    r.photo_count,
    r.ranking,
    r.ranking_out_of,
    r.ranking_string,
    r.geo_location_id,
    r.geo_location_name,
    r.hours,
    r.awards,
    r.dietary_restrictions,
    r.created_at,
    r.updated_at
  FROM restaurants r
  ORDER BY r.name;
$$;