import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// ----- CONFIGURE THESE -----
const CLIENT_ID = "340519404208914436";
const ISSUER = "http://localhost"; // Replace with your Zitadel project URL
const REDIRECT_URI = window.location.origin + "/callback";
const SCOPES = "openid profile email";
const API_ENDPOINT = "http://localhost/api/interview/start";
// ---------------------------

// Utility: base64url encode
function base64urlencode(buffer) {
  const uint8 = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < uint8.byteLength; i++) str += String.fromCharCode(uint8[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Generate a random code_verifier
function generateCodeVerifier() {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return base64urlencode(array);
}

// Generate code_challenge from verifier (SHA-256 -> base64url)
async function generateCodeChallenge(verifier) {
  const enc = new TextEncoder();
  const data = enc.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64urlencode(digest);
}

// Session storage helpers
const save = (k, v) => sessionStorage.setItem(k, JSON.stringify(v));
const load = (k) => JSON.parse(sessionStorage.getItem(k));
const clearAll = () => sessionStorage.clear();

function Home({ discovery }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [apiResponse, setApiResponse] = useState("");

  useEffect(() => {
    const storedTokens = load("zitadel_tokens");
    if (storedTokens && discovery) {
      setTokens(storedTokens);
      fetch(discovery.userinfo_endpoint, {
        headers: { Authorization: `Bearer ${storedTokens.access_token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          // Set custom headers in session storage for future API calls
          save("X-User-ID", data.sub);
          save("X-Name-ID", data.preferred_username);
          save("X-Email-ID", data.email);

          // After login, automatically hit the API endpoint
          fetch(API_ENDPOINT, {
            headers: {
              "X-User-ID": data.sub,
              "X-Name-ID": data.preferred_username,
              "X-Email-ID": data.email,
            },
          })
            .then((r) => r.text())
            .then(setApiResponse)
            .catch((e) => console.error("API request error", e));
        })
        .catch((e) => console.error("userinfo error", e));
    }
  }, [discovery]);

  const login = async () => {
    if (!discovery) return alert("Discovery not loaded yet");
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    save("pkce_verifier", verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: Math.random().toString(36).substring(2),
    });

    const url = `${discovery.authorization_endpoint}?${params.toString()}`;
    window.location.href = url;
  };

  const logout = () => {
    clearAll();
    if (discovery && discovery.end_session_endpoint && tokens) {
      const params = new URLSearchParams({
        id_token_hint: tokens.id_token,
        post_logout_redirect_uri: window.location.origin,
      });
      window.location.href = `${discovery.end_session_endpoint}?${params.toString()}`;
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow mb-6">
        <h1 className="text-2xl font-semibold mb-4">ZITADEL Quickstart (React)</h1>
        {!profile ? (
          <>
            <p className="mb-4">You are not logged in.</p>
            <button
              onClick={login}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Login with ZITADEL
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="font-medium">Logged in as:</div>
              <div>{profile.name || profile.preferred_username || profile.email}</div>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
            {tokens && (
              <div className="mb-4">
                <div className="font-medium">Tokens:</div>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                  {JSON.stringify(tokens, null, 2)}
                </pre>
              </div>
            )}
            {apiResponse && (
              <div className="mb-4">
                <div className="font-medium">API Response:</div>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                  {apiResponse}
                </pre>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={logout}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Callback({ discovery }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!discovery) return;

    const handle = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      if (!code) return navigate("/");

      const verifier = load("pkce_verifier");
      if (!verifier) return alert("Missing PKCE verifier in sessionStorage");

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: verifier,
      });

      try {
        const tokenResp = await fetch(discovery.token_endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        const tokenJson = await tokenResp.json();
        if (tokenJson.error) throw tokenJson;
        save("zitadel_tokens", tokenJson);

        const userResp = await fetch(discovery.userinfo_endpoint, {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });
        const userJson = await userResp.json();
        save("zitadel_profile", userJson);

        // Save custom headers for API usage
        save("X-User-ID", userJson.sub);
        save("X-Name-ID", userJson.preferred_username);
        save("X-Email-ID", userJson.email);

        sessionStorage.removeItem("pkce_verifier");
        navigate("/");
      } catch (e) {
        console.error("token exchange error", e);
        alert("Token exchange failed. Check console.");
      }
    };

    handle();
  }, [location.search, discovery]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        Processing login... If you are not redirected, check the console.
      </div>
    </div>
  );
}

export default function AppWrapper() {
  const [discovery, setDiscovery] = useState(null);

  useEffect(() => {
    const url = `${ISSUER}/.well-known/openid-configuration`;
    fetch(url)
      .then((r) => r.json())
      .then(setDiscovery)
      .catch((e) => console.error("failed to load discovery", e));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/callback" element={<Callback discovery={discovery} />} />
        <Route path="/" element={<Home discovery={discovery} />} />
      </Routes>
    </BrowserRouter>
  );
}