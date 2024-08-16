#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowStyleMask};
#[cfg(target_os = "windows")]
use window_shadows::{set_shadow};
use tauri::{App, Runtime, Window,Manager};

/** 先只支持 macos 和 windows 需要自己根据平台实现 WindowExt Trait */
pub trait WindowExt {

    fn custom_window(&self);

    fn hide_titlebar(&self);
}

#[cfg(target_os = "macos")]
impl<R: Runtime> WindowExt for Window<R> {
    fn custom_window(&self) {
        self.hide_titlebar();
    }

    /**
     * 隐藏window 头部，为了使用 html 绘制头部
     * 使用原生操作按钮
     */
    fn hide_titlebar(&self) {
        use cocoa::appkit::NSWindowTitleVisibility;

        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;

            let mut style_mask = id.styleMask();
            style_mask.set(
                NSWindowStyleMask::NSFullSizeContentViewWindowMask,
                true,
            );
            id.setStyleMask_(style_mask);

            id.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);
            id.setTitlebarAppearsTransparent_( cocoa::base::YES);
        }
    }
}

#[cfg(target_os = "windows")]
impl<R: Runtime> WindowExt for Window<R> {
    fn custom_window(&self) {
        self.hide_titlebar();
    }

    /**
     * 隐藏window 头部，为了使用 html 绘制头部
     * windows不使用原生操作按钮，由html绘制
     */
    fn hide_titlebar(&self) {
        self.set_decorations(false).ok();
        set_shadow(&self,true).ok();
    }
}