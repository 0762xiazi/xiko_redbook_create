import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase';
import { generateToken } from '../utils/jwt';

const router = express.Router();

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    let existingUser = null;
    try {
      const { data, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);
      
      console.log('Check existing user result:', data, checkError);
      
      existingUser = data && data.length > 0 ? data[0] : null;
      
      if (checkError) {
        console.error('Error checking existing user:', checkError);
        throw checkError;
      }
    } catch (error) {
      console.error('Exception checking existing user:', error);
      throw error;
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString()
      })
      .select('id, email, name');
    
    console.log('Create user result:', newUser, createError);
    
    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }
    
    if (!newUser || newUser.length === 0) {
      throw new Error('Failed to create user: no data returned');
    }
    
    // Get the first user from the result
    const createdUser = newUser[0];
    
    // Generate JWT token
    const token = generateToken({ id: createdUser.id, email: createdUser.email });
    
    return res.status(201).json({
      user: createdUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: (error as Error).message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    console.time('Login request processing');
    console.log('Login request received:', req.body);
    
    const { email, password }: LoginRequest = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Get user from database
    console.log('Querying user from database:', email);
    console.time('Database query time');
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, password')
      .eq('email', email)
      .single();
    console.timeEnd('Database query time');
    console.log('Database query result:', { data: user, error: fetchError });
    
    if (fetchError) {
      console.log('Database query error:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      throw fetchError;
    }
    
    // Verify password
    console.log('Verifying password');
    console.time('Password verification time');
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.timeEnd('Password verification time');
    console.log('Password verification result:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    console.log('Generating JWT token');
    console.time('JWT token generation time');
    const token = generateToken({ id: user.id, email: user.email });
    console.timeEnd('JWT token generation time');
    console.log('JWT token generated successfully');
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful:', userWithoutPassword);
    console.timeEnd('Login request processing');
    return res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    console.timeEnd('Login request processing');
    return res.status(500).json({ message: 'Login failed', error: (error as Error).message });
  }
});

export { router as authRoutes };