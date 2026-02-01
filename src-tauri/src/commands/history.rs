use crate::db::{self, DbState, HistoryItem, NewHistoryItem};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryListResult {
    pub items: Vec<HistoryItem>,
    pub total: i64,
    pub has_more: bool,
}

/// List history items with pagination
#[tauri::command]
pub async fn history_list(
    state: State<'_, DbState>,
    limit: Option<i64>,
    offset: Option<i64>,
    search: Option<String>,
) -> Result<HistoryListResult, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);

    let items = db::list_history(&conn, limit, offset, search.as_deref())
        .map_err(|e| format!("Failed to list history: {}", e))?;

    let total = db::count_history(&conn).map_err(|e| format!("Failed to count history: {}", e))?;

    let has_more = (offset + items.len() as i64) < total;

    Ok(HistoryListResult {
        items,
        total,
        has_more,
    })
}

/// Save a history item
#[tauri::command]
pub async fn history_save(
    state: State<'_, DbState>,
    item: NewHistoryItem,
) -> Result<i64, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::save_history(&conn, &item).map_err(|e| format!("Failed to save history: {}", e))
}

/// Delete a history item
#[tauri::command]
pub async fn history_delete(state: State<'_, DbState>, id: i64) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::delete_history(&conn, id).map_err(|e| format!("Failed to delete history: {}", e))
}

/// Clear all history
#[tauri::command]
pub async fn history_clear(state: State<'_, DbState>) -> Result<i64, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    db::clear_history(&conn).map_err(|e| format!("Failed to clear history: {}", e))
}
