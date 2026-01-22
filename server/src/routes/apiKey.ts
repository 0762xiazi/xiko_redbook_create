import express from 'express';
import { supabase } from '../utils/supabase';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

interface APIKeyRequest {
  service: string; // e.g., 'dify', 'gemini', 'deepseek'
  api_key: string;
}

// Get API keys for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { data: apiKeys, error } = await supabase
      .from('user_api_keys')
      .select('id, service, api_key')
      .eq('user_id', req.user.id);
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ message: 'Failed to get API keys', error: (error as Error).message });
  }
});

// Get specific API key by service
router.get('/:service', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { service } = req.params;
    
    const { data: apiKey, error } = await supabase
      .from('user_api_keys')
      .select('id, service, api_key')
      .eq('user_id', req.user.id)
      .eq('service', service)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: `API key for ${service} not found` });
      }
      throw error;
    }
    
    return res.status(200).json({ apiKey });
  } catch (error) {
    console.error('Get API key error:', error);
    return res.status(500).json({ message: 'Failed to get API key', error: (error as Error).message });
  }
});

// Save or update API key
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { service, api_key }: APIKeyRequest = req.body;
    
    if (!service || !api_key) {
      return res.status(400).json({ message: 'Service and API key are required' });
    }
    
    // Check if API key already exists for this service
    const { data: existingKey, error: checkError } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('service', service)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means not found
      throw checkError;
    }
    
    let result;
    
    if (existingKey) {
      // Update existing API key
      result = await supabase
        .from('user_api_keys')
        .update({
          api_key,
          df_api_key: '', // Provide default value for df_api_key
          updated_at: new Date().toISOString()
        })
        .eq('id', existingKey.id)
        .select('id, service, api_key')
        .single();
    } else {
      // Create new API key
      result = await supabase
        .from('user_api_keys')
        .insert({
          user_id: req.user.id,
          service,
          api_key,
          df_api_key: '', // Provide default value for df_api_key
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, service, api_key')
        .single();
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return res.status(200).json({ apiKey: result.data });
  } catch (error) {
    console.error('Save API key error:', error);
    return res.status(500).json({ message: 'Failed to save API key', error: (error as Error).message });
  }
});

// Delete API key
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { id } = req.params;
    
    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ message: 'Failed to delete API key', error: (error as Error).message });
  }
});

export { router as apiKeyRoutes };