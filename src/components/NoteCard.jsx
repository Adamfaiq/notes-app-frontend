function NoteCard(props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
      {/* Pin indicator */}
      {props.isPinned && (
        <div className="text-yellow-500 text-xl mb-2">📌 Pinned</div>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-2">{props.title}</h3>
      <p className="text-gray-600 mb-4">{props.content}</p>

      {/* Tags display */}
      {props.tags && props.tags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {props.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ✅ TAMBAH: Pin button */}
      <button
        onClick={props.onPin}
        className="w-full mb-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
      >
        {props.isPinned ? "📌 Unpin" : "📍 Pin"}
      </button>

      <div className="flex gap-2">
        <button
          onClick={props.onEdit}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          ✏️ Edit
        </button>
        <button
          onClick={props.onDelete}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default NoteCard;
