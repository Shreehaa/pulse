import api from "./api";

interface LoginResponse {
    token: string;
}

interface RegisterResponse {
    message: string;
}

const TOKEN_KEY = "pulse_token";

export async function login(
    username: string,
    password: string,
): Promise<string> {
    const response =
        await api.post<LoginResponse>(
            "/api/auth/login",
            {
                username,
                password,
            },
        );

    return response.data.token;
}

export async function register(
    username: string,
    password: string,
): Promise<void> {
    await api.post<RegisterResponse>(
        "/api/auth/register",
        {
            username,
            password,
        },
    );
}

export function saveToken(
    token: string,
): void {
    localStorage.setItem(
        TOKEN_KEY,
        token,
    );
}

export function getToken(): string | null {
    return localStorage.getItem(
        TOKEN_KEY,
    );
}

export function removeToken(): void {
    localStorage.removeItem(
        TOKEN_KEY,
    );
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}

export function logout(): void {
    removeToken();

    window.dispatchEvent(
        new CustomEvent("pulse:logout"),
    );
}