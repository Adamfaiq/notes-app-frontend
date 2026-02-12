import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard";

function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetch(
      "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setNotes(data.notes));
  }, []);

  const addNote = async () => {
    const res = await fetch(
      "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        }),
      },
    );
    const data = await res.json();
    setNotes([...notes, data.note]);
    setTitle("");
    setContent("");
    setTags("");
  };

  const updateNote = async (id) => {
    const updatedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag); // ✅ TAMBAH - calculate once

    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notes/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags: updatedTags,
        }),
      },
    );

    setNotes(
      notes.map(
        (note) =>
          note._id === id
            ? { ...note, title, content, tags: updatedTags }
            : note, // ✅ UBAH - include tags
      ),
    );
    setTitle("");
    setContent("");
    setTags("");
    setEditId(null);
  };

  const deleteNote = async (id) => {
    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notes/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setNotes(notes.filter((note) => note._id !== id));
  };

  // ✅ TAMBAH: After deleteNote function
  const togglePin = async (id, currentPinStatus) => {
    await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notes/${id}/pin`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setNotes(
      notes.map((note) =>
        note._id === id ? { ...note, isPinned: !currentPinStatus } : note,
      ),
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📝 Notes App</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto p-6">
        {/* ✅ TAMBAH: Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            rows="4"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {/* ✅ TAMBAH: Tags input */}
          <input
            type="text"
            placeholder="Tags (comma separated, e.g: work, important)"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button
            onClick={editId ? () => updateNote(editId) : addNote}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {editId ? "✏️ Update Note" : "➕ Add Note"}
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ✅ UBAH: Tambah props tags & isPinned */}
          {notes
            .filter(
              (note) =>
                note.title.toLowerCase().includes(search.toLowerCase()) ||
                note.content.toLowerCase().includes(search.toLowerCase()),
            )
            .sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return 0;
            })
            .map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                content={note.content}
                tags={note.tags} // ✅ TAMBAH
                isPinned={note.isPinned} // ✅ TAMBAH
                onDelete={() => deleteNote(note._id)}
                onPin={() => togglePin(note._id, note.isPinned)}
                onEdit={() => {
                  setEditId(note._id);
                  setTitle(note.title);
                  setContent(note.content);
                  setTags(note.tags ? note.tags.join(", ") : "");
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
