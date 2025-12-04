# Dark Mode Quick Start Guide

## 🚀 For Users

### To Use Dark Mode in Admin Panel:

1. **Navigate** to the Admin Dashboard (`/admin`)
2. **Look** for the sun/moon icon in the **top-right corner** of the page
3. **Click** the icon to toggle between light and dark mode
4. **Enjoy!** Your preference is automatically saved

### Features:
- ☀️ **Light Mode**: Default clean white interface
- 🌙 **Dark Mode**: Eye-friendly dark slate colors
- 💾 **Auto-Save**: Your preference is saved automatically
- 🔄 **Instant Toggle**: Switch modes instantly without reload

---

## 👨‍💻 For Developers

### Adding Dark Mode to New Admin Components

**Step 1**: Import the theme store
```jsx
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
```

**Step 2**: Use the hook in your component
```jsx
function MyComponent() {
  const { isDarkMode } = useAdminThemeStore();
  
  return (
    <div className={isDarkMode ? "dark-styles" : "light-styles"}>
      Content
    </div>
  );
}
```

**Step 3**: Apply Tailwind classes based on mode
```jsx
<div className={`
  p-4 rounded-lg transition-colors
  ${isDarkMode 
    ? "bg-slate-800 text-slate-100 border-slate-700"
    : "bg-white text-gray-900 border-gray-200"
  }
`}>
  Your content here
</div>
```

### Color Reference for Dark Mode

```jsx
// Backgrounds
bg-slate-950  // Main page background
bg-slate-900  // Sidebar/header background
bg-slate-800  // Card backgrounds

// Borders
border-slate-700  // Card borders, dividers

// Text
text-slate-100    // Primary text (headings)
text-slate-200    // Secondary text
text-slate-400    // Tertiary/muted text
text-slate-500    // Hints/placeholders

// Backgrounds (hover states)
bg-slate-700/50   // Slight background tint on hover
hover:bg-slate-700 // Stronger hover effect
```

### Conditional Classes Helper

For cleaner code, consider using a utility function:

```jsx
const getThemeClasses = (isDarkMode, lightClass, darkClass) => {
  return isDarkMode ? darkClass : lightClass;
};

// Usage:
<div className={getThemeClasses(
  isDarkMode,
  "bg-white text-gray-900",
  "bg-slate-800 text-slate-100"
)}>
```

---

## 📍 Where Dark Mode is Active

### Admin Panel Routes
- ✅ `/admin` - Dashboard
- ✅ `/admin/users` - Users Management
- ✅ `/admin/companies` - Companies Management
- ✅ `/admin/requests` - Requests Management
- ✅ `/admin/payments` - Payments Management
- ✅ `/admin/settings` - Admin Settings
- ✅ `/admin/support` - Admin Support

### NOT Affected (Light Mode Only)
- ❌ User Dashboard (`/dashboard`)
- ❌ Public Pages (Home, About, Blog, etc.)
- ❌ Logistics Dashboard (`/logistic-dashboard/*`)
- ❌ Onboarding Pages

---

## 🎯 Common Patterns

### Text Based on Theme
```jsx
<p className={isDarkMode ? "text-slate-300" : "text-gray-700"}>
  Regular text
</p>
```

### Cards Based on Theme
```jsx
<div className={`
  rounded-lg p-4 border transition-colors
  ${isDarkMode
    ? "bg-slate-800 border-slate-700 text-slate-100"
    : "bg-white border-gray-200 text-gray-900"
  }
`}>
  Card content
</div>
```

### Buttons Based on Theme
```jsx
<button className={`
  px-4 py-2 rounded-lg transition-colors
  ${isDarkMode
    ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
  }
`}>
  Click me
</button>
```

### Input Fields Based on Theme
```jsx
<input
  type="text"
  className={`
    w-full px-3 py-2 rounded-lg border transition-colors
    ${isDarkMode
      ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
    }
  `}
  placeholder="Enter text..."
/>
```

### Tables Based on Theme
```jsx
<thead className={isDarkMode ? "bg-slate-700/50 text-slate-200" : "bg-gray-100 text-gray-700"}>
  <tr>
    <th>Header</th>
  </tr>
</thead>
<tbody>
  <tr className={isDarkMode ? "hover:bg-slate-700/30" : "hover:bg-gray-50"}>
    <td>Data</td>
  </tr>
</tbody>
```

---

## 🔧 Troubleshooting

### Dark Mode Not Working?
1. Check if you're using the correct store import
2. Make sure you're in an admin route (`/admin/*`)
3. Clear browser cache and refresh
4. Check browser console for errors

### Styles Not Applying?
1. Ensure `transition-colors` class is included for smooth transitions
2. Check Tailwind class names are correct
3. Verify `isDarkMode` is being read correctly from store
4. Make sure component is wrapped in proper class names

### Performance Issues?
1. Avoid re-rendering large lists unnecessarily
2. Use `useMemo` for complex conditional classes
3. Consider extracting theme-dependent classes to constants

---

## 📚 Store API Reference

```javascript
// Import the store
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// In your component
const { isDarkMode, toggleDarkMode, setDarkMode } = useAdminThemeStore();

// isDarkMode (boolean)
// - Current theme state
// - true = dark mode active
// - false = light mode active

// toggleDarkMode() (function)
// - Toggles between light and dark
// - Automatically saves preference
// - Usage: onClick={() => toggleDarkMode()}

// setDarkMode(boolean) (function)
// - Set dark mode to specific state
// - Automatically saves preference
// - Usage: setDarkMode(true) or setDarkMode(false)
```

---

## 💡 Pro Tips

1. **Always use `transition-colors`** for smooth theme changes
2. **Test both modes** when creating new admin components
3. **Use consistent color values** across your components
4. **Keep dark mode classes near light mode classes** for easy reference
5. **Use CSS variables in tailwind.config** if building many themed components

---

## 🎓 Further Reading

- Check `DARK_MODE_VERIFICATION.md` for complete implementation details
- Review `AdminDashboard.jsx` for advanced example implementations
- See `useAdminThemeStore.js` for store implementation details

---

**Happy theming! 🌙**
