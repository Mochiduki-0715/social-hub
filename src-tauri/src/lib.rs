use std::collections::HashMap;

use tauri::{
    webview::WebviewBuilder, AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, WebviewUrl,
};

const SERVICES: &[(&str, &str)] = &[
    ("youtube", "https://www.youtube.com/"),
    ("x", "https://x.com/"),
    ("instagram", "https://www.instagram.com/"),
    ("tiktok", "https://www.tiktok.com/"),
    ("twitch", "https://www.twitch.tv/"),
];

const PAUSE_MEDIA_SCRIPT: &str = r#"
(() => {
  const pauseMedia = (root) => {
    for (const media of root.querySelectorAll?.('video,audio') ?? []) {
      try {
        media.pause();
      } catch (_) {}
    }
  };

  pauseMedia(document);
  for (const element of document.querySelectorAll('*')) {
    if (element.shadowRoot) {
      pauseMedia(element.shadowRoot);
    }
  }
})();
"#;

#[derive(Debug, serde::Serialize)]
struct ServiceInfo {
    id: &'static str,
    url: &'static str,
}

fn services() -> HashMap<&'static str, &'static str> {
    SERVICES.iter().copied().collect()
}

fn service_label(service: &str) -> String {
    format!("service-{service}")
}

fn bounds(x: f64, y: f64, width: f64, height: f64) -> tauri::Rect {
    tauri::Rect {
        position: tauri::Position::Logical(LogicalPosition { x, y }),
        size: tauri::Size::Logical(LogicalSize { width, height }),
    }
}

#[tauri::command]
fn list_services() -> Vec<ServiceInfo> {
    SERVICES
        .iter()
        .map(|(id, url)| ServiceInfo { id, url })
        .collect()
}

#[tauri::command]
fn show_layout(
    app: AppHandle,
    layout: String,
    left_service: String,
    right_service: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let service_map = services();
    if !service_map.contains_key(left_service.as_str()) {
        return Err(format!("unknown service: {left_service}"));
    }
    if !service_map.contains_key(right_service.as_str()) {
        return Err(format!("unknown service: {right_service}"));
    }

    let split = layout == "split" && left_service != right_service;
    let left_bounds = if split {
        bounds(x, y, width / 2.0, height)
    } else {
        bounds(x, y, width, height)
    };
    let right_bounds = bounds(x + width / 2.0, y, width / 2.0, height);

    for (id, _) in SERVICES {
        let webview = app
            .get_webview(&service_label(id))
            .ok_or_else(|| format!("missing webview: {id}"))?;

        if *id == left_service {
            webview
                .set_bounds(left_bounds)
                .map_err(|error| error.to_string())?;
            webview.show().map_err(|error| error.to_string())?;
        } else if split && *id == right_service {
            webview
                .set_bounds(right_bounds)
                .map_err(|error| error.to_string())?;
            webview.show().map_err(|error| error.to_string())?;
        } else {
            let _ = webview.eval(PAUSE_MEDIA_SCRIPT);
            webview.hide().map_err(|error| error.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
fn resize_content(app: AppHandle, x: f64, y: f64, width: f64, height: f64) -> Result<(), String> {
    show_layout(
        app,
        "single".to_string(),
        "youtube".to_string(),
        "twitch".to_string(),
        x,
        y,
        width,
        height,
    )
}

#[tauri::command]
fn reload_service(app: AppHandle, service: String) -> Result<(), String> {
    let webview = app
        .get_webview(&service_label(&service))
        .ok_or_else(|| format!("missing webview: {service}"))?;
    webview
        .eval("window.location.reload()")
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn open_external(app: AppHandle, service: String) -> Result<(), String> {
    let url = services()
        .get(service.as_str())
        .ok_or_else(|| format!("unknown service: {service}"))?
        .to_string();
    std::process::Command::new("open")
        .arg(url)
        .spawn()
        .map_err(|error| error.to_string())?;
    app.emit("opened-external", service)
        .map_err(|error| error.to_string())
}

fn create_service_webviews(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").ok_or("main window not found")?;
    let initial_bounds = bounds(280.0, 108.0, 1000.0, 692.0);

    for (index, (id, url)) in SERVICES.iter().enumerate() {
        let parsed_url = url.parse()?;
        let webview_builder =
            WebviewBuilder::new(service_label(id), WebviewUrl::External(parsed_url));
        let webview = window.add_child(
            webview_builder,
            initial_bounds.position,
            initial_bounds.size,
        )?;

        if index != 0 {
            webview.hide()?;
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            create_service_webviews(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_services,
            show_layout,
            resize_content,
            reload_service,
            open_external
        ])
        .run(tauri::generate_context!())
        .expect("error while running social hub");
}
