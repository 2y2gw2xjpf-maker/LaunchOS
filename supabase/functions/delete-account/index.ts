// Supabase Edge Function: Delete User Account
// Deploy with: supabase functions deploy delete-account
//
// This function:
// 1. Verifies the user's JWT authentication
// 2. Deletes all user data from related tables
// 3. Deletes the user from Supabase Auth

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create client with user's JWT to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized - Invalid or expired token');
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Optional: Parse request body for confirmation
    let body: { confirmEmail?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    // If confirmEmail is provided, verify it matches
    if (body.confirmEmail && body.confirmEmail !== user.email) {
      throw new Error('Email confirmation does not match');
    }

    // Delete user data from all related tables in order
    // Order matters due to foreign key constraints

    // 1. Delete chat messages
    const { error: chatMessagesError } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (chatMessagesError) {
      console.error('Error deleting chat messages:', chatMessagesError);
      // Continue anyway - table might not exist
    }

    // 2. Delete chat sessions
    const { error: chatSessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('user_id', userId);

    if (chatSessionsError) {
      console.error('Error deleting chat sessions:', chatSessionsError);
    }

    // 3. Delete deliverables
    const { error: deliverablesError } = await supabaseAdmin
      .from('deliverables')
      .delete()
      .eq('user_id', userId);

    if (deliverablesError) {
      console.error('Error deleting deliverables:', deliverablesError);
    }

    // 4. Delete valuations
    const { error: valuationsError } = await supabaseAdmin
      .from('valuations')
      .delete()
      .eq('user_id', userId);

    if (valuationsError) {
      console.error('Error deleting valuations:', valuationsError);
    }

    // 5. Delete ventures
    const { error: venturesError } = await supabaseAdmin
      .from('ventures')
      .delete()
      .eq('user_id', userId);

    if (venturesError) {
      console.error('Error deleting ventures:', venturesError);
    }

    // 6. Delete profile (last, as it may have FKs to other tables)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 7. Finally, delete the user from Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw new Error(`Failed to delete user account: ${deleteUserError.message}`);
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account successfully deleted'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to delete account',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized - Invalid or expired token' ? 401 : 400,
      }
    );
  }
});
