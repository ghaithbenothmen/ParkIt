import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/auth`; 


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

      // Check if response has content before parsing as JSON
      const text = await response.text();
      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        try {
          const errorData = text ? JSON.parse(text) : {};
          errorMessage = errorData.message || errorMessage;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      // If response is empty, return an empty object
      if (!text) return {};
      const data = JSON.parse(text);
      return data; // Return data if registration is successful
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };


  export const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, { email, password });
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
