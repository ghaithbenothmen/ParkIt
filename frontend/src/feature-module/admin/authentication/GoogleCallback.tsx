import React from "react";
import axios from 'axios';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {api} from "../../../api"
const exchangeCodeForToken = async (code: string): Promise<void> => {
    const clientId = "198801170360-1m8sop4r23hle1a8de8v09fi8c053o56.apps.googleusercontent.com";
    const clientSecret = "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"; // Remplacez par votre client secret
    const redirectUri = `${process.env.REACT_APP_FRONT_BASE_URL}/react/template/auth/google/callback`; // Remplacez par votre URI de redirection

    try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'échange du code");
        }

        const data = await response.json();
        const { access_token } = data;

        // Vous pouvez maintenant utiliser le jeton d'accès pour d'autres actions si nécessaire
        console.log("Jeton d'accès reçu :", access_token);
    } catch (error) {
        console.error("Erreur lors de l'échange du code :", error);
        throw error;
    }
};
const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get("code");

        if (code) {
            // Envoyez le code au backend
            api.get(`/auth/google?code=${code}`)
                .then((response : any) => {
                    const { token, user } = response.data;
                    console.log("Utilisateur connecté :", user);

                    // Stockez le jeton JWT dans le localStorage ou les cookies
                    localStorage.setItem("token", token);

                    // Redirigez l'utilisateur vers le tableau de bord
                    navigate("/react/template/admin/dashboard");
                });
                
                
        }
    }, [location, navigate]);

    return <div>Connexion en cours...</div>;
};

export default GoogleCallback;