use crate::setups::window::{ WindowExt};
use open;
use tauri::Manager;

#[tauri::command]
pub async fn open_window(
    handle: tauri::AppHandle,
    url: &str,
    label: &str,
    height: Option<f64>,
    width: Option<f64>,
) -> Result<(), ()> {
    // 识别label，若当前有label = label的window，那么把它调到顶层"
    if let Some((_, win)) = handle.windows().get_key_value(label) {
        let __ = win.set_focus();

        return Ok(());
    }

    // 创建 window
    let docs_window = tauri::WindowBuilder::new(
        &handle,
        label, /* the unique window label */
        tauri::WindowUrl::External(url.parse().unwrap()),
    )
    .initialization_script(crate::INIT_SCRIPT)
    .inner_size(width.unwrap_or(800.0), height.unwrap_or(600.0))
    .build()
    .unwrap();

    // 使用主线程修改window
    handle
        .run_on_main_thread(move || docs_window.custom_window())
        .unwrap();

    Ok(())
}

// 打开浏览器
#[tauri::command]
pub async fn open_browser(url: &str) -> Result<(), ()> {
    let res = open::that(url);

    match res{
       Ok(_)=>Ok(()),
       Err(err)=>Err(())
    }
}
