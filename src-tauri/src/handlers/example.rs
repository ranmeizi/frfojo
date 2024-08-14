use tokio;
use tauri;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn async_greet(name: &str) -> Result<String, ()> {
    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}
