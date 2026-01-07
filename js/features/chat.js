import { supabase } from '../supabase-client.js';

// --- Views ---

export async function renderChatList(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando conversaciones...</div>';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return container.innerHTML = '<p>Debes iniciar sesión.</p>';

    // 1. Get Friends (Mutual follows)
    // Optimization: Fetch relationships where I follow them AND they follow me
    const { data: rels } = await supabase
        .from('relationships')
        .select('following_id')
        .eq('follower_id', user.id);

    const followingIds = rels?.map(r => r.following_id) || [];

    if (followingIds.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Sigue a usuarios para chatear con ellos.</p></div>';
        return;
    }

    // Fetch Profiles of friends
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followingIds);

    // Clean up any stale modals
    const staleModal = document.getElementById('mobileChatModal');
    if (staleModal) staleModal.remove();

    container.innerHTML = `
        <div class="chat-layout">
            <!-- Sidebar list -->
            <div class="chat-sidebar" style="background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow-y: auto;">
                <div style="padding: 16px; border-bottom: 1px solid var(--border); font-weight: bold;">
                    Amigos
                </div>
                <div id="chatUserList">
                    ${profiles.map(p => `
                        <div class="chat-user-item" data-id="${p.id}" onclick="window.location.hash='#chat?id=${p.id}'" 
                             style="padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid var(--border-light);">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); display:flex; justify-content:center; align-items:center; overflow:hidden; font-size:0.8rem;">
                                ${p.avatar_url ? `<img src="${p.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (p.username || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div style="font-size: 0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                ${p.username || 'Usuario'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Chat Area -->
            <div id="chatArea" class="chat-area" style="background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow: hidden;">
                <div style="height: 100%; display: flex; justify-content: center; align-items: center; color: var(--text-muted);">
                    <p>Selecciona un amigo para chatear</p>
                </div>
            </div>
        </div>
    `;

    // Check if URL has id
    const hash = window.location.hash;
    if (hash.includes('?id=')) {
        const id = hash.split('?id=')[1];
        if (id) renderConversation(id);
    }
}

export async function renderConversation(targetUserId) {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        openChatModal(targetUserId);
        return;
    }

    // Desktop: Use existing chatArea
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;

    // Select sidebar active state
    document.querySelectorAll('.chat-user-item').forEach(el => el.style.background = 'transparent');
    const activeItem = document.querySelector(`.chat-user-item[data-id="${targetUserId}"]`);
    if (activeItem) activeItem.style.background = 'var(--surface-hover)';

    await renderChatIntoContainer(chatArea, targetUserId, false);
}

// --- Mobile Modal Logic ---
async function openChatModal(targetUserId) {
    let modal = document.getElementById('mobileChatModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'mobileChatModal';
    modal.className = 'modal-backdrop active';
    modal.style.zIndex = '11000'; // Top of everything
    modal.innerHTML = `
        <div class="modal-content" style="width:100%; height:100%; border-radius:0; background:var(--surface); display:flex; flex-direction:column; padding:0;">
            <div id="modalChatContainer" style="flex:1; display:flex; flex-direction:column; overflow:hidden;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const container = document.getElementById('modalChatContainer');
    await renderChatIntoContainer(container, targetUserId, true);
}

// --- Shared Renderer ---
async function renderChatIntoContainer(container, targetUserId, isMobileWrapper) {
    container.innerHTML = '<div class="loading">Cargando chat...</div>';

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Target Profile
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

    if (!targetProfile) {
        container.innerHTML = '<p style="padding:20px;">Usuario no encontrado.</p>';
        return;
    }

    // Fetch Messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(50);

    // Mark messages as read
    await markMessagesAsRead(targetUserId, user.id);

    // Back button for mobile modal
    // Note: window.history.back() might take us out of chat if deep linked. 
    // Safest is to remove modal + reset hash.
    const backBtn = isMobileWrapper
        ? `<button class="btn btn-sm" onclick="document.getElementById('mobileChatModal').remove(); window.location.hash='#chat';" style="margin-right:10px;"><i class="fas fa-arrow-left"></i></button>`
        : '';

    container.innerHTML = `
        <div class="chat-header" style="padding: 16px; border-bottom: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; gap: 10px;">
            ${backBtn}
            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); overflow:hidden;">
                 ${targetProfile.avatar_url ? `<img src="${targetProfile.avatar_url}" style="width:100%; height:100%; object-fit:cover;">` : (targetProfile.username || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div style="font-weight: bold;">${targetProfile.username}</div>
        </div>
        
        <div class="messages-list" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background:var(--background);">
            ${(messages || []).map(msg => renderMessageBubble(msg, user.id)).join('')}
        </div>

        <form class="chat-form" style="padding: 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; background:var(--surface);">
            <input type="text" placeholder="Escribe un mensaje..." autocomplete="off" style="flex: 1; padding: 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--background); color:var(--text);">
            <button type="submit" class="btn btn-primary" style="padding: 0 20px; border-radius: 20px;"><i class="fas fa-paper-plane"></i></button>
        </form>
    `;

    // Scroll
    const msgList = container.querySelector('.messages-list');
    msgList.scrollTop = msgList.scrollHeight;

    // Events
    const form = container.querySelector('.chat-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const content = input.value.trim();
        if (!content) return;

        input.value = '';

        // Optimistic
        const tempMsg = { id: 'temp', sender_id: user.id, content: content, created_at: new Date().toISOString() };
        msgList.insertAdjacentHTML('beforeend', renderMessageBubble(tempMsg, user.id));
        msgList.scrollTop = msgList.scrollHeight;

        await supabase.from('messages').insert([{ sender_id: user.id, receiver_id: targetUserId, content: content }]);
    };

    // Realtime
    // Reuse setupRealtime but pass new container
    setupRealtime(user.id, targetUserId, msgList);
}

function renderMessageBubble(msg, myId) {
    const isMe = msg.sender_id === myId;
    return `
        <div style="display: flex; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
            <div style="max-width: 70%; padding: 10px 16px; border-radius: 16px; 
                        background: ${isMe ? 'var(--primary)' : 'var(--border)'}; 
                        color: ${isMe ? 'black' : 'var(--text)'};
                        border-bottom-${isMe ? 'right' : 'left'}-radius: 4px;">
                ${msg.content}
            </div>
        </div>
    `;
}

let subscription = null;

function setupRealtime(myId, friendId, container) {
    if (subscription) {
        supabase.removeChannel(subscription);
    }

    subscription = supabase
        .channel('chat-room')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${myId}`
        }, payload => {
            // Check if matches current friend
            const msg = payload.new;
            if (msg.sender_id === friendId) {
                // Check if container is still valid (in DOM)
                if (document.body.contains(container)) {
                    container.insertAdjacentHTML('beforeend', renderMessageBubble(msg, myId));
                    container.scrollTop = container.scrollHeight;
                }
            }
        })
        .subscribe();
}

// --- Notifications ---

async function markMessagesAsRead(senderId, myId) {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', myId)
        .eq('is_read', false);

    if (!error) {
        checkUnreadCount();
    }
}

export async function checkUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We need 'is_read' column in DB boolean default false
    // Since we just created the table, assume is_read exists (default false)
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

    if (count && count > 0) {
        updateSidebarBadge(count);
    } else {
        updateSidebarBadge(0);
    }
}

function updateSidebarBadge(count) {
    // Find nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.querySelector('.fa-comments')) {
            // Check if badge exists
            let badge = item.querySelector('.nav-badge');
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'nav-badge';
                    badge.style.cssText = 'background:var(--danger); color:white; font-size:0.7rem; padding:2px 6px; border-radius:10px; margin-left:8px;position:absolute;top:5px;right:5px;';
                    item.appendChild(badge);
                    item.style.position = 'relative';
                }
                badge.textContent = count > 9 ? '9+' : count;
            } else {
                if (badge) badge.remove();
            }
        }
    });
}

// Global Helper
window.closeMobileChat = function () {
    const modal = document.getElementById('mobileChatModal');
    if (modal) modal.remove();

    const layout = document.querySelector('.chat-layout');
    if (layout) layout.classList.remove('chat-mobile-active');
    history.pushState("", document.title, window.location.pathname + window.location.search); // remove hash clean
    window.location.hash = '#chat'; // reset to chat root
}
