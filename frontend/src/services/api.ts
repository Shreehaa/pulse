import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("pulse_token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (!error.response) {
            window.dispatchEvent(
                new CustomEvent(
                    "pulse:api-error",
                    {
                        detail: {
                            type: "error",
                            message:
                                "Unable to connect to the Pulse backend.",
                        },
                    },
                ),
            );

            return Promise.reject(error);
        }

        const status =
            error.response.status;

        if (status === 401) {
            localStorage.removeItem(
                "pulse_token",
            );

            window.dispatchEvent(
                new CustomEvent(
                    "pulse:api-error",
                    {
                        detail: {
                            type: "warning",
                            message:
                                "Your session has expired. Please sign in again.",
                        },
                    },
                ),
            );

            if (
                window.location.pathname !==
                "/login"
            ) {
                window.location.href =
                    "/login";
            }

            return Promise.reject(error);
        }

        if (status === 403) {
            window.dispatchEvent(
                new CustomEvent(
                    "pulse:api-error",
                    {
                        detail: {
                            type: "error",
                            message:
                                "You do not have permission to perform this action.",
                        },
                    },
                ),
            );
        }

        if (status === 404) {
            window.dispatchEvent(
                new CustomEvent(
                    "pulse:api-error",
                    {
                        detail: {
                            type: "error",
                            message:
                                "The requested resource was not found.",
                        },
                    },
                ),
            );
        }

        if (status >= 500) {
            window.dispatchEvent(
                new CustomEvent(
                    "pulse:api-error",
                    {
                        detail: {
                            type: "error",
                            message:
                                "Pulse encountered a server error. Please try again.",
                        },
                    },
                ),
            );
        }

        return Promise.reject(error);
    },
);

export default api;