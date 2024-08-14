use crate::setups::window::{self, WindowExt};
use serde_json::json;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu,WindowEvent};
use tokio;

mod handlers;
mod setups;

pub const INIT_SCRIPT: &str = r#"
  console.log("hi, use WindowBuilder.initialization_script to inject javascript in your html")
"#;

fn main() {
    // 这里 `"quit".to_string()` 定义菜单项 ID，第二个参数是菜单项标签。
    let quit = CustomMenuItem::new("x".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .setup(|app| {
            let win = tauri::WindowBuilder::new(
                app,
                "main", /* the unique window label */
                tauri::WindowUrl::App("index.html".into()),
            )
            .initialization_script(INIT_SCRIPT)
            .inner_size(1200.0, 900.0)
            .build()
            .unwrap();

            win.custom_window();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            handlers::example::greet,
            handlers::example::async_greet,
            handlers::common::open_window,
            handlers::common::open_browser
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
