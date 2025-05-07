// /home/ubuntu/christian_journal_app/mobile_app/src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

// Define backend URL (replace with your actual IP/domain if testing on device)
// For Android emulator, localhost corresponds to 10.0.2.2
// For iOS simulator, localhost works directly
// Using 10.0.2.2 for broader emulator compatibility initially
const API_URL = 'http://10.0.2.2:5000'; // Flask backend running on host machine

function LoginScreen({ navigation, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter username and password.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            console.log('Login success:', response.data);
            if (onLoginSuccess) {
                onLoginSuccess(response.data); // Pass user data up to App state
            }
            // Navigation to Dashboard will be handled by App.js based on auth state
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
            Alert.alert('Login Failed', err.response?.data?.error || 'Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
            <Button title="Don't have an account? Register" onPress={() => navigation.navigate('Register')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default LoginScreen;

