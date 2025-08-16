import mongoose from 'mongoose';

// Get database connection status
export const getDatabaseStatus = () => {
  const state = mongoose.connection.readyState;
  
  switch (state) {
    case 0:
      return { status: 'disconnected', message: 'Database disconnected' };
    case 1:
      return { status: 'connected', message: 'Database connected successfully' };
    case 2:
      return { status: 'connecting', message: 'Database connecting...' };
    case 3:
      return { status: 'disconnecting', message: 'Database disconnecting...' };
    default:
      return { status: 'unknown', message: 'Database status unknown' };
  }
};

// Check if database is healthy
export const isDatabaseHealthy = () => {
  return mongoose.connection.readyState === 1;
};