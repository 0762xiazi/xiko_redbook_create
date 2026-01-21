import express from 'express';
import { supabase } from '../utils/supabase';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

interface GenerationRequest {
  type: string; // e.g., 'wechat_article', 'content_image', 'product_copy'
  content: any; // JSON object containing the generated content
  metadata?: any; // Additional metadata
}

// Get all generations for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { data: generations, error } = await supabase
      .from('user_generations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ generations });
  } catch (error) {
    console.error('Get generations error:', error);
    return res.status(500).json({ message: 'Failed to get generations', error: (error as Error).message });
  }
});

// Get specific generation by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { id } = req.params;
    
    const { data: generation, error } = await supabase
      .from('user_generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: 'Generation not found' });
      }
      throw error;
    }
    
    return res.status(200).json({ generation });
  } catch (error) {
    console.error('Get generation error:', error);
    return res.status(500).json({ message: 'Failed to get generation', error: (error as Error).message });
  }
});

// Save generation result
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { type, content, metadata }: GenerationRequest = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }
    
    // Save generation result
    const { data: newGeneration, error } = await supabase
      .from('user_generations')
      .insert({
        user_id: req.user.id,
        type,
        content,
        metadata,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return res.status(201).json({ generation: newGeneration });
  } catch (error) {
    console.error('Save generation error:', error);
    return res.status(500).json({ message: 'Failed to save generation', error: (error as Error).message });
  }
});

// Delete generation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { id } = req.params;
    
    const { error } = await supabase
      .from('user_generations')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({ message: 'Generation deleted successfully' });
  } catch (error) {
    console.error('Delete generation error:', error);
    return res.status(500).json({ message: 'Failed to delete generation', error: (error as Error).message });
  }
});

export { router as generationRoutes };