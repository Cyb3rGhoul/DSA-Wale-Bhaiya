// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Test Successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ API Connection Test Failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API Connection Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Test registration endpoint
export const testRegistration = async () => {
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    console.log('Registration Test Response:', data);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('❌ Registration Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Run tests
if (import.meta.env.DEV) {
  console.log('🧪 Running API Connection Tests...');
  testApiConnection();
}