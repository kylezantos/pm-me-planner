use reqwest::StatusCode;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize, Serialize)]
pub struct CalendarConnectionRecord {
    pub id: String,
    pub user_id: String,
    pub provider: String,
    pub account_email: String,
    pub token_expiry: Option<String>,
    pub scopes: Vec<String>,
    pub is_primary: bool,
    pub created_at: String,
    pub updated_at: String,
    pub sync_token: Option<String>,
    pub last_synced_at: Option<String>,
}

fn env_var(key: &str) -> Result<String, String> {
    std::env::var(key).map_err(|_| format!("Missing {key} environment variable"))
}

fn supabase_url() -> Result<String, String> {
    std::env::var("SUPABASE_URL")
        .or_else(|_| std::env::var("VITE_SUPABASE_URL"))
        .map_err(|_| "Missing SUPABASE_URL environment variable".to_string())
}

#[tauri::command]
pub async fn store_calendar_connection(
    user_id: String,
    provider: Option<String>,
    account_email: String,
    access_token: String,
    refresh_token: Option<String>,
    token_expiry: Option<String>,
    scopes: Vec<String>,
    is_primary: Option<bool>,
    connection_id: Option<String>,
) -> Result<CalendarConnectionRecord, String> {
    let calendar_secret = env_var("CALENDAR_TOKEN_SECRET")?;
    let supabase_url = supabase_url()?;
    let service_key = env_var("SUPABASE_SERVICE_ROLE_KEY")?;

    let payload = serde_json::json!({
        "p_user_id": user_id,
        "p_provider": provider.unwrap_or_else(|| "google".to_string()),
        "p_account_email": account_email,
        "p_access_token": access_token,
        "p_refresh_token": refresh_token,
        "p_token_expiry": token_expiry,
        "p_scopes": scopes,
        "p_is_primary": is_primary.unwrap_or(false),
        "p_secret": calendar_secret,
        "p_connection_id": connection_id,
    });

    let client = reqwest::Client::new();

    let response = client
        .post(format!(
            "{}/rest/v1/rpc/upsert_calendar_connection",
            supabase_url.trim_end_matches('/')
        ))
        .header("apikey", &service_key)
        .header("Authorization", format!("Bearer {}", service_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .body(payload.to_string())
        .send()
        .await
        .map_err(|err| format!("Failed to contact Supabase: {err}"))?;

    let status = response.status();

    if status == StatusCode::UNAUTHORIZED {
        return Err("Supabase rejected service role credentials".to_string());
    }

    if !status.is_success() {
        let text = response
            .text()
            .await
            .unwrap_or_else(|_| "<unable to read response body>".to_string());
        return Err(format!(
            "Supabase RPC upsert_calendar_connection failed ({status}): {text}",
            status = status
        ));
    }

    response
        .json::<CalendarConnectionRecord>()
        .await
        .map_err(|err| format!("Failed to parse calendar connection: {err}"))
}
