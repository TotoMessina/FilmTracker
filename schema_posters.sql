-- Add custom_poster_path to logs table
ALTER TABLE logs 
ADD COLUMN custom_poster_path text;
