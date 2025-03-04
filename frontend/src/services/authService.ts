import axios from "axios";

const API_URL = "http://localhost:4000/api/auth"; 


export const register = async (userData: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send the correct user data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed. Please try again.');
      }
  
      const data = await response.json();
      return data; // Return data if registration is successful
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };


  export const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error; // Propager l'erreur pour qu'elle soit gérée dans `handleLogin`
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};
