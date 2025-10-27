import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
    console.log('Testing Authentication System...\n');

    try {
        console.log('1. Testing user registration...');
        const registerResponse = await fetch(`${BASE_URL}/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                givenName: 'Test',
                familyName: 'User',
                role: 'user'
            })
        });

        const registerData = await registerResponse.json();
        console.log('Registration response:', registerData);

        if (registerResponse.ok) {
            console.log('✅ User registration successful\n');
        } else {
            console.log('❌ User registration failed\n');
        }

        console.log('2. Testing user login...');
        const loginResponse = await fetch(`${BASE_URL}/auth/sign-in/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (loginResponse.ok && loginData.token) {
            console.log('✅ User login successful\n');

            console.log('3. Testing protected route access...');
            const protectedResponse = await fetch(`${BASE_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json',
                }
            });

            const protectedData = await protectedResponse.json();
            console.log('Protected route response:', protectedData);

            if (protectedResponse.ok) {
                console.log('✅ Protected route access successful\n');
            } else {
                console.log('❌ Protected route access failed\n');
            }

            console.log('4. Testing user logout...');
            const logoutResponse = await fetch(`${BASE_URL}/auth/sign-out`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${loginData.token}`,
                    'Content-Type': 'application/json',
                }
            });

            const logoutData = await logoutResponse.json();
            console.log('Logout response:', logoutData);

            if (logoutResponse.ok) {
                console.log('✅ User logout successful\n');
            } else {
                console.log('❌ User logout failed\n');
            }

        } else {
            console.log('❌ User login failed\n');
        }

    } catch (error) {
        console.error('Test failed with error:', error.message);
    }
}

testAuth();
