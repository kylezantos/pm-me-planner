use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use reqwest::Client;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum GoogleOauthError {
    #[error("missing environment variable: {0}")]
    MissingEnv(&'static str),
    #[error("network error: {0}")]
    Network(String),
    #[error("invalid response: {0}")]
    InvalidResponse(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    #[serde(default)]
    pub refresh_token: Option<String>,
    #[serde(default)]
    pub expires_in: Option<i64>,
    #[serde(default)]
    pub scope: Option<String>,
    #[serde(default)]
    pub token_type: Option<String>,
}

#[derive(Debug, Serialize)]
struct TokenRequest<'a> {
    client_id: &'a str,
    client_secret: &'a str,
    redirect_uri: &'a str,
    grant_type: &'a str,
    code: Option<&'a str>,
    code_verifier: Option<&'a str>,
    refresh_token: Option<&'a str>,
}

fn read_env(key: &'static str) -> Result<String, GoogleOauthError> {
    std::env::var(key).map_err(|_| GoogleOauthError::MissingEnv(key))
}

fn derive_client_secret() -> Result<String, GoogleOauthError> {
    if let Ok(secret) = std::env::var("GOOGLE_CLIENT_SECRET") {
        return Ok(secret);
    }

    let service_role = read_env("SUPABASE_SERVICE_ROLE_KEY")?;
    Ok(URL_SAFE_NO_PAD.encode(service_role))
}

async fn post_token(request: TokenRequest<'_>) -> Result<TokenResponse, GoogleOauthError> {
    let client = Client::new();

    let response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&request)
        .send()
        .await
        .map_err(|err| GoogleOauthError::Network(err.to_string()))?;

    if !response.status().is_success() {
        return Err(GoogleOauthError::InvalidResponse(format!(
            "Google token endpoint returned status {}",
            response.status()
        )));
    }

    response
        .json::<TokenResponse>()
        .await
        .map_err(|err| GoogleOauthError::InvalidResponse(err.to_string()))
}

#[derive(Debug, Serialize)]
struct UserInfoRequest<'a> {
    access_token: &'a str,
}

#[derive(Debug, Deserialize)]
struct UserInfoResponse {
    email: Option<String>,
    verified_email: Option<bool>,
}

async fn fetch_user_info(access_token: &str) -> Result<Option<String>, GoogleOauthError> {
    let client = Client::new();

    let response = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|err| GoogleOauthError::Network(err.to_string()))?;

    if response.status().as_u16() == 401 {
        return Ok(None);
    }

    if !response.status().is_success() {
        return Err(GoogleOauthError::InvalidResponse(format!(
            "Google userinfo endpoint returned status {}",
            response.status()
        )));
    }

    let payload = response
        .json::<UserInfoResponse>()
        .await
        .map_err(|err| GoogleOauthError::InvalidResponse(err.to_string()))?;

    Ok(payload.email)
}

#[tauri::command]
pub async fn exchange_google_code(
    code: String,
    code_verifier: String,
) -> Result<(TokenResponse, Option<String>), String> {
    let client_id = read_env("GOOGLE_CLIENT_ID").map_err(|err| err.to_string())?;
    let redirect_uri = read_env("GOOGLE_REDIRECT_URI").map_err(|err| err.to_string())?;
    let client_secret = derive_client_secret().map_err(|err| err.to_string())?;

    let tokens = post_token(TokenRequest {
        client_id: &client_id,
        client_secret: &client_secret,
        redirect_uri: &redirect_uri,
        grant_type: "authorization_code",
        code: Some(&code),
        code_verifier: Some(&code_verifier),
        refresh_token: None,
    })
    .await
    .map_err(|err| err.to_string())?;

    let email = fetch_user_info(&tokens.access_token)
        .await
        .map_err(|err| err.to_string())?;

    Ok((tokens, email))
}

#[tauri::command]
pub async fn refresh_google_token(refresh_token: String) -> Result<TokenResponse, String> {
    let client_id = read_env("GOOGLE_CLIENT_ID").map_err(|err| err.to_string())?;
    let client_secret = derive_client_secret().map_err(|err| err.to_string())?;

    post_token(TokenRequest {
        client_id: &client_id,
        client_secret: &client_secret,
        redirect_uri: "",
        grant_type: "refresh_token",
        code: None,
        code_verifier: None,
        refresh_token: Some(&refresh_token),
    })
    .await
    .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_env_var(key: String) -> Result<String, String> {
    match key.as_str() {
        "GOOGLE_CLIENT_ID" => read_env("GOOGLE_CLIENT_ID").map_err(|err| err.to_string()),
        "GOOGLE_CLIENT_SECRET" => derive_client_secret().map_err(|err| err.to_string()),
        "GOOGLE_REDIRECT_URI" => read_env("GOOGLE_REDIRECT_URI").map_err(|err| err.to_string()),
        "CALENDAR_TOKEN_SECRET" => read_env("CALENDAR_TOKEN_SECRET").map_err(|err| err.to_string()),
        _ => Err(format!("Environment variable '{}' is not allowed", key)),
    }
}
