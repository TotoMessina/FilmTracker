-- Interactions: Watched With
CREATE TABLE IF NOT EXISTS log_companions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    log_id UUID REFERENCES logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for log_companions
ALTER TABLE log_companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read log companions" ON log_companions
    FOR SELECT USING (true);

CREATE POLICY "Users can add companions to their own logs" ON log_companions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM logs 
            WHERE logs.id = log_companions.log_id 
            AND logs.user_id = auth.uid()
        )
    );

-- Chat: Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );
