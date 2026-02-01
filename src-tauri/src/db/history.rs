use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryItem {
    pub id: i64,
    pub content: String,
    pub qr_type: String,
    pub label: Option<String>,
    pub style_json: String,
    pub thumbnail: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewHistoryItem {
    pub content: String,
    pub qr_type: String,
    pub label: Option<String>,
    pub style_json: String,
    pub thumbnail: Option<String>,
}

/// List history items with pagination
pub fn list_history(
    conn: &Connection,
    limit: i64,
    offset: i64,
    search: Option<&str>,
) -> Result<Vec<HistoryItem>, rusqlite::Error> {
    let mut stmt = if let Some(search_term) = search {
        let query = r#"
            SELECT id, content, qr_type, label, style_json, thumbnail, created_at, updated_at
            FROM history
            WHERE content LIKE ?1 OR label LIKE ?1
            ORDER BY created_at DESC
            LIMIT ?2 OFFSET ?3
        "#;
        let mut stmt = conn.prepare(query)?;
        let search_pattern = format!("%{}%", search_term);
        let items = stmt
            .query_map(params![search_pattern, limit, offset], |row| {
                Ok(HistoryItem {
                    id: row.get(0)?,
                    content: row.get(1)?,
                    qr_type: row.get(2)?,
                    label: row.get(3)?,
                    style_json: row.get(4)?,
                    thumbnail: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        return Ok(items);
    } else {
        conn.prepare(
            r#"
            SELECT id, content, qr_type, label, style_json, thumbnail, created_at, updated_at
            FROM history
            ORDER BY created_at DESC
            LIMIT ?1 OFFSET ?2
        "#,
        )?
    };

    let items = stmt
        .query_map(params![limit, offset], |row| {
            Ok(HistoryItem {
                id: row.get(0)?,
                content: row.get(1)?,
                qr_type: row.get(2)?,
                label: row.get(3)?,
                style_json: row.get(4)?,
                thumbnail: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Save a new history item
pub fn save_history(conn: &Connection, item: &NewHistoryItem) -> Result<i64, rusqlite::Error> {
    conn.execute(
        r#"
        INSERT INTO history (content, qr_type, label, style_json, thumbnail)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![
            item.content,
            item.qr_type,
            item.label,
            item.style_json,
            item.thumbnail
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

/// Delete a history item
pub fn delete_history(conn: &Connection, id: i64) -> Result<bool, rusqlite::Error> {
    let affected = conn.execute("DELETE FROM history WHERE id = ?1", params![id])?;
    Ok(affected > 0)
}

/// Clear all history
pub fn clear_history(conn: &Connection) -> Result<i64, rusqlite::Error> {
    let affected = conn.execute("DELETE FROM history", [])?;
    Ok(affected as i64)
}

/// Get history count
pub fn count_history(conn: &Connection) -> Result<i64, rusqlite::Error> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM history", [], |row| row.get(0))?;
    Ok(count)
}
