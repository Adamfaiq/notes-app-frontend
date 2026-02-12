# ⚛️ REACT SESSION 2 — Connect Frontend to Backend

---

## ✅ SESSION CHECKLIST

- [x] CORS Setup (Backend)
- [x] Login + JWT Token
- [x] Fetch Notes dari MongoDB
- [x] Add Note ke Backend
- [x] Delete Note dari Backend
- [x] Update Note ke Backend

---

## 1. CORS SETUP

> Frontend (port 5173) nak call Backend (port 5000) — kena bagi permission dulu.

```bash
npm install cors
```

```js
// server.js
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
```

---

## 2. LOGIN + JWT TOKEN

> Flow: User login → Backend bagi token → Frontend simpan token dalam state.

### State untuk Login:

```jsx
const [token, setToken] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

### Login Function:

```jsx
const login = async () => {
  const res = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  setToken(data.token)  // Simpan token dalam state
}
```

### Login Form (JSX):

```jsx
<input type="email" placeholder="Email"
  value={email} onChange={(e) => setEmail(e.target.value)} />
<input type="password" placeholder="Password"
  value={password} onChange={(e) => setPassword(e.target.value)} />
<button onClick={login}>Login</button>
```

> ⚠️ Token hilang bila refresh — sebab simpan dalam state je (bukan localStorage)

---

## 3. FETCH NOTES (useEffect)

> Fetch notes dari backend bila token dah ada.

```jsx
useEffect(() => {
  if (!token) return           // Stop kalau takde token
  fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setNotes(data.notes))  // data.notes bukan data!
}, [token])  // Run bila token berubah
```

> 💡 `data.notes` bukan `data` terus — sebab backend return `{ success: true, notes: [...] }`

---

## 4. ADD NOTE KE BACKEND

```jsx
const addNote = async () => {
  const res = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  })
  const data = await res.json()
  setNotes([...notes, data.note])  // Tambah note baru ke state
  setTitle('')
  setContent('')
}
```

---

## 5. DELETE NOTE DARI BACKEND

```jsx
const deleteNote = async (id) => {
  await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notes/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  setNotes(notes.filter((note) => note._id !== id)); // Remove dari state
};
```

---

## 6. UPDATE NOTE KE BACKEND

### State tambahan:

```jsx
const [editId, setEditId] = useState(null);
```

### Update Function:

```jsx
const updateNote = async (id) => {
  await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    },
  );
  setNotes(
    notes.map((note) => (note._id === id ? { ...note, title, content } : note)),
  );
  setTitle("");
  setContent("");
  setEditId(null);
};
```

### Button Toggle Add/Update:

```jsx
<button onClick={editId ? () => updateNote(editId) : addNote}>
  {editId ? "Update Note" : "Add Note"}
</button>
```

### Trigger Edit dari NoteCard:

```jsx
onEdit={() => {
  setEditId(note._id)
  setTitle(note.title)
  setContent(note.content)
}}
```

---

## 7. NOTECARD COMPONENT (Final)

```jsx
function NoteCard(props) {
  return (
    <div style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
      <h3>{props.title}</h3>
      <p>{props.content}</p>
      <button onClick={props.onDelete}>Delete</button>
      <button onClick={props.onEdit}>Edit</button>
    </div>
  );
}

export default NoteCard;
```

---

## 8. FULL APP.JSX

```jsx
import { useState, useEffect } from 'react'
import NoteCard from './components/NoteCard'

function App() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editId, setEditId] = useState(null)

  const login = async () => {
    const res = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    setToken(data.token)
  }

  useEffect(() => {
    if (!token) return
    fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotes(data.notes))
  }, [token])

  const addNote = async () => {
    const res = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    })
    const data = await res.json()
    setNotes([...notes, data.note])
    setTitle('')
    setContent('')
  }

  const updateNote = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    })
    setNotes(notes.map(note =>
      note._id === id ? { ...note, title, content } : note
    ))
    setTitle('')
    setContent('')
    setEditId(null)
  }

  const deleteNote = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setNotes(notes.filter(note => note._id !== id))
  }

  return (
    <div>
      <h1>Notes App</h1>
      <input type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <hr />
      <input type="text" placeholder="Title"
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content"
        value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={editId ? () => updateNote(editId) : addNote}>
        {editId ? 'Update Note' : 'Add Note'}
      </button>
      {notes.map(note => (
        <NoteCard
          key={note._id}
          title={note.title}
          content={note.content}
          onDelete={() => deleteNote(note._id)}
          onEdit={() => {
            setEditId(note._id)
            setTitle(note.title)
            setContent(note.content)
          }}
        />
      ))}
    </div>
  )
}

export default App
```

---

## 9. KEY CONCEPTS

| Konsep          | Penjelasan                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| **CORS**        | Backend bagi permission kepada frontend untuk call API                         |
| **JWT Token**   | Key untuk akses protected routes. Hantar dalam `Authorization: Bearer <token>` |
| **useEffect**   | Run code bila component mount atau dependency berubah                          |
| **async/await** | Tunggu API response sebelum proceed                                            |
| **data.notes**  | Backend return `{ success, notes: [...] }` — kena drill down ke `.notes`       |
| **\_id**        | MongoDB auto-generate ID dengan underscore. Bukan `id`, tapi `_id`!            |

---

## 10. NEXT SESSION PREVIEW

Session 3 kita akan buat:

- Pages (Login page, Home page) dengan React Router
- Tags management
- Pin/unpin notes
- Filter & search notes
- Improve UI/UX

---

> 🎉 **SESSION 2 COMPLETE — Full CRUD Connected to Backend!**
