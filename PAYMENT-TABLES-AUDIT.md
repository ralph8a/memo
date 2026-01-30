# Auditoría de Discrepancias de Tablas

## ✅ CORRECCIONES APLICADAS

### 1. ❌→✅ payment_trends (Línea 1503)
**Problema**: Query usaba `payments.agent_id` que NO existe  
**Solución**: JOIN con policies para obtener agent_id  
```php
// ANTES (❌)
FROM payments WHERE agent_id = ?

// AHORA (✅)
FROM payments p 
JOIN policies pol ON p.policy_id = pol.id
WHERE pol.agent_id = ?
```

### 2. ❌→✅ users.name en 4 lugares
**Problema**: Queries usaban `u.name` pero tabla users solo tiene `first_name` y `last_name`  
**Ubicaciones corregidas**:
- Línea 867: Claim details query
- Línea 882: Claim comments query  
- Línea 918: Claim notification query
- Línea 1476: Pending actions agent view

**Solución**: Cambiar a `CONCAT(u.first_name, ' ', u.last_name)`

### 3. ❌→✅ claims.user_id en 2 lugares
**Problema**: Queries usaban `c.user_id` pero tabla claims tiene `client_id`  
**Ubicaciones corregidas**:
- Línea 870: Claim details JOIN
- Línea 920: Claim notification JOIN

**Solución**: Cambiar a `c.client_id`

---

## Esquema Real de Tablas

### users (database-schema.sql)
```sql
- id              ✅ PRIMARY KEY
- email           ✅
- user_type       ✅
- first_name      ✅ (NO hay "name")
- last_name       ✅ (NO hay "name")
- phone
- password_hash
```

### payments (database-schema.sql línea 117)
```sql
- id
- policy_id       ✅
- client_id       ✅
- amount
- status          (pending, completed, failed, refunded)
- payment_date
```
**NO TIENE**: `agent_id` (debe usar JOIN con policies)

### claims (database-schema.sql línea 51)
```sql
- id
- claim_number
- policy_id
- client_id       ✅ (NO "user_id")
- assigned_agent_id
```

### policies (database-schema.sql)
```sql
- id
- policy_number
- client_id       ✅
- agent_id        ✅
- status
- premium_amount
```

---

## Estado de Deployment
- ✅ Corregidos 7 problemas de schema
- 🚀 Listo para deploy
- 📊 Error 500 en payment_trends debería estar resuelto
