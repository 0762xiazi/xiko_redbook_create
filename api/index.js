// Serverless Function entry point for Vercel
// Lightweight implementation for login requests to avoid Express app overhead
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Cache Supabase client instance
let supabaseClient = null;

// Get Supabase client
function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            timeout: 5000, // 5 second timeout for Supabase requests
          });
        }
      }
    });
  }
  return supabaseClient;
}

// Generate JWT token
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiration = process.env.JWT_EXPIRATION || '10800s';
  return jwt.sign(payload, secret, { expiresIn: expiration });
}

export default async (req, res) => {
  try {
    console.time('Request processing time');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }
    
    // Parse request body
    let body = {};
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
    
    console.log('Handling request:', req.method, req.url);
    console.log('Request body:', body);
    
    // Check if this is a login request
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email, password } = body;
      
      if (!email || !password) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Email and password are required' }));
        return;
      }
      
      // Get Supabase client
      const supabase = getSupabase();
      
      // Get user from database
      console.log('Querying user from database:', email);
      console.time('Database query time');
      
      try {
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
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Invalid email or password' }));
            return;
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
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Invalid email or password' }));
          return;
        }
        
        // Generate JWT token
        console.log('Generating JWT token');
        console.time('JWT token generation time');
        const token = generateToken({ id: user.id, email: user.email });
        console.timeEnd('JWT token generation time');
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        console.log('Login successful:', userWithoutPassword);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          user: userWithoutPassword,
          token
        }));
      } catch (error) {
        console.error('Supabase operation error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Database operation failed', error: error.message }));
      }
    } else if (req.method === 'POST' && req.url === '/api/auth/register') {
      // Handle registration request
      const { email, password, name } = body;
      
      if (!email || !password) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Email and password are required' }));
        return;
      }
      
      // Get Supabase client
      const supabase = getSupabase();
      
      // Check if user already exists
      console.log('Checking if user exists:', email);
      console.time('User existence check time');
      
      try {
        const { data: existingUsers, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email);
        
        console.timeEnd('User existence check time');
        console.log('User existence check result:', { data: existingUsers, error: checkError });
        
        if (checkError) {
          throw checkError;
        }
        
        if (existingUsers && existingUsers.length > 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'User with this email already exists' }));
          return;
        }
        
        // Hash password
        console.log('Hashing password');
        console.time('Password hashing time');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.timeEnd('Password hashing time');
        
        // Create new user
        console.log('Creating new user');
        console.time('User creation time');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            password: hashedPassword,
            name,
            created_at: new Date().toISOString()
          })
          .select('id, email, name');
        
        console.timeEnd('User creation time');
        console.log('User creation result:', { data: newUser, error: createError });
        
        if (createError) {
          throw createError;
        }
        
        if (!newUser || newUser.length === 0) {
          throw new Error('Failed to create user: no data returned');
        }
        
        const createdUser = newUser[0];
        
        // Generate JWT token
        const token = generateToken({ id: createdUser.id, email: createdUser.email });
        
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          user: createdUser,
          token
        }));
      } catch (error) {
        console.error('Registration error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Registration failed', error: error.message }));
      }
    } else {
      // Handle other requests by loading Express app
      console.log('Loading Express app for non-auth request');
      const { createServer } = await import('http');
      const { default: app } = await import('../server/dist/index.js');
      const server = createServer(app);
      server.emit('request', req, res);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
  } finally {
    console.timeEnd('Request processing time');
  }
};