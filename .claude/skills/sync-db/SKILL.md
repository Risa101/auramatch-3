---
name: sync-db
description: Sync local MySQL database to Railway production. Use when the user wants to push local DB changes to Railway, or says "sync database", "อัปเดต database".
disable-model-invocation: true
---

Sync the AuraMatch MySQL database to Railway production.

## Railway MySQL connection
```
Host:     caboose.proxy.rlwy.net
Port:     33764
User:     root
Password: QlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ
Database: railway
```

## Steps

### 1. Export from local XAMPP
```bash
mysqldump -u root -p auramatch > /tmp/auramatch_$(date +%Y%m%d).sql
```
If password is blank: `mysqldump -u root auramatch > /tmp/auramatch_$(date +%Y%m%d).sql`

### 2. Import to Railway
```bash
mysql -h caboose.proxy.rlwy.net -P 33764 -u root -pQlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ railway < /tmp/auramatch_$(date +%Y%m%d).sql
```

### 3. If the user provides a .sql file path
```bash
mysql -h caboose.proxy.rlwy.net -P 33764 -u root -pQlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ railway < $ARGUMENTS
```

## Important tables
| Table | Purpose |
|-------|---------|
| `products` | Cosmetics (categories: blush, cushion, eye, lip) |
| `looks` | Makeup looks by season |
| `hairstyles` | Hair recommendations by face shape |
| `orders` | Purchase history |
| `reviews` | Product reviews |
| `stock` | Inventory |
| `coupons` / `promotions` | Discount codes |

## Notes
- `personal_color_tags` column uses comma-separated values: `Spring,Summer,Autumn,Winter`
- All 4 seasons must have at least 1 product per category for the "More for Your Aura" feature to work
- After import, verify with: `mysql -h caboose.proxy.rlwy.net -P 33764 -u root -pQlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ railway -e "SELECT category, COUNT(*) FROM products GROUP BY category;"`
