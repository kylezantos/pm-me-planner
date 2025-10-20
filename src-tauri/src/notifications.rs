use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub async fn send_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    let res = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show();

    match res {
        Ok(_) => Ok(()),
        Err(error) => {
            eprintln!("Failed to display notification: {}", error);
            Err(format!("Failed to display notification: {error}"))
        }
    }
}
