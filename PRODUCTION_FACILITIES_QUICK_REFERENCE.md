# Production Facilities - Quick Reference

## 🎯 Key URLs

| Purpose | URL |
|---------|-----|
| **Manage Facilities** | `http://localhost:3000/admin/production-facilities` |
| **Add New Facility** | `http://localhost:3000/admin/production-facilities/new` |
| **View on Homepage** | `http://localhost:3000/` (scroll down) |
| **Sidebar Menu** | Admin Dashboard → Content → Production Facilities |

---

## 📋 Checklist: Your First Upload

- [ ] Go to `/admin/production-facilities`
- [ ] Click "+ Add Facility"
- [ ] Enter title (e.g., "My Process")
- [ ] Optionally add description
- [ ] Upload image (WEBP, JPEG, PNG; max 5MB)
- [ ] Optionally add alt text
- [ ] Set display order (0-5 recommended)
- [ ] Check "Active" checkbox
- [ ] Click "Create Facility"
- [ ] Go to homepage to verify

---

## 📊 Database Model

```typescript
ProductionFacility {
  id: string              // auto-generated
  title: string           // required, max 100 chars
  description?: string    // optional, max 500 chars
  imageUrl: string        // required, Supabase URL
  imageAlt?: string       // optional, max 200 chars
  displayOrder: number    // default 0, used for sorting
  isActive: boolean       // default true
  createdAt: Date
  updatedAt: Date
}
```

---

## 🖼️ Image Requirements

| Property | Value |
|----------|-------|
| Format | WEBP, JPEG, or PNG |
| Max Size | 5MB |
| Aspect Ratio | 4:5 or 3:4 portrait |
| Storage | Supabase public bucket |
| Alt Text | Recommended (accessibility) |

---

## 🔧 Admin Actions

| Action | Icon | Result |
|--------|------|--------|
| Show/Hide | 👁️ | Toggle `isActive` |
| Edit | ✏️ | Go to edit page |
| Delete | 🗑️ | Remove from database & homepage |
| Reorder | 🔄 (drag) | Update `displayOrder` |

---

## 🎨 Frontend Display

### Homepage Section
- Automatically shows top 5 active facilities (sorted by `displayOrder`)
- Grid layout responsive (4-5 cols desktop, 2 cols tablet, 1 col mobile)
- Image overlay with title + description
- Hover: Scale 1.05 + zoom image

### Empty State
- Section hidden if no active facilities
- No broken UI, completely removed

---

## 🔐 Permissions

| Role | Can Manage? |
|------|-------------|
| SUPER_ADMIN | ✅ Yes |
| ADMIN | ✅ Yes |
| EDITOR | ✅ Yes |
| CUSTOMER | ❌ No (read-only on homepage) |

---

## 📝 Current Sample Data

Pre-seeded with:
1. **R&D** - Research and development lab
2. **Cutting** - Material cutting process
3. **Printing** - Branding and printing
4. **Stitching** - Assembly and stitching
5. **Quality Control** - Final inspection

All using Unsplash placeholder images. Replace with your own.

---

## 🚀 Quick Commands

```bash
# View database records (if you have access)
pnpm db:studio

# Re-seed sample data
pnpm db:seed

# Build for production
pnpm build

# Type check
pnpm typecheck
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not uploading | Confirm `.env` has SUPABASE_SERVICE_ROLE_KEY |
| Homepage section not showing | Verify at least one facility has `isActive = true` |
| Can't access admin | Confirm your role is ADMIN/EDITOR/SUPER_ADMIN |
| Images look distorted | Ensure images are portrait orientation (height > width) |
| Drag-drop not working | Try full page refresh or use number input for order |

---

## 💾 Backup Current State

Before major changes:
```bash
# Export all facilities
SELECT * FROM production_facilities;

# Backup images
# (Stored in Supabase, URLs are in the table)
```

---

## 📊 Audit Trail

All changes logged in `audit_logs` table:
- `CREATE` - New facility added
- `UPDATE` - Facility or order changed
- `DELETE` - Facility removed

Filter: `entityType = 'ProductionFacility'`

---

## 🎯 Performance Notes

- ✅ Images lazy-loaded on homepage
- ✅ Grid responsive, no layout shift
- ✅ No animation on mobile (prefers-reduced-motion respected)
- ✅ Queries indexed on `displayOrder` and `isActive`
- ✅ Storage uses public URLs (no auth overhead)

---

## 📞 Files Reference

```
Admin Pages:
- /admin/production-facilities          → List & manage
- /admin/production-facilities/new      → Create
- /admin/production-facilities/[id]     → Edit

Features:
- actions/production-facility.actions.ts  → Server actions
- components/production-facility-*.tsx    → UI components
- repositories/...repository.ts           → Database layer
- schemas/...schema.ts                    → Validation

Homepage:
- sections/production-facilities-section.tsx → Display component
```

---

## ✅ Status

- Build: ✅ Passing
- Tests: ✅ All checks passed
- Database: ✅ Migrated
- Sample Data: ✅ Seeded
- Ready: ✅ Production-ready

**Next Step**: Go to `/admin/production-facilities` and start managing your facilities!
