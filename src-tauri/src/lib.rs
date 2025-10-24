pub mod google;
pub mod notifications;
pub mod store;

pub use google::{exchange_google_code, get_env_var, refresh_google_token};
pub use notifications::send_notification;
pub use store::store_calendar_connection;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            google::exchange_google_code,
            google::refresh_google_token,
            google::get_env_var,
            notifications::send_notification,
            store::store_calendar_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
