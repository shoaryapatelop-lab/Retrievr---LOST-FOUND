# ER Diagram - Retrievr

```mermaid
erDiagram
  users ||--o{ students : "is_a"
  users ||--o{ admins : "is_a"
  users ||--o{ items : "reports"
  items ||--o{ claims : "has"
  items ||--o{ item_matches : "matched"
  items ||--o{ item_images : "has"
  categories ||--o{ items : "categorizes"
  users ||--o{ claims : "claims"
  users ||--o{ notifications : "receives"
```
