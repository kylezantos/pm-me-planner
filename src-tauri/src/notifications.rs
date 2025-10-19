use tauri_plugin_notification::{NotificationExt, NotificationOpts};

pub fn send_notification(app: &tauri::AppHandle, title: &str, body: &str, identifier: Option<&str>) {
    let opts = NotificationOpts {
        identifier: identifier.map(|id| id.to_string()).unwrap_or_default(),
        title: title.to_string(),
        body: Some(body.to_string()),
        ..Default::default()
    };

    let _ = app.notification().show(opts);
}
