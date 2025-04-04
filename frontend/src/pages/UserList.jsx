export default function UserList({ users, onSelect, current }) {
    return (
      <div className="w-1/3 border-r pr-4">
        <h2 className="font-bold mb-2">Users</h2>
        {users.filter(u => u.username !== current).map((u, i) => (
          <div
            key={i}
            className="cursor-pointer p-2 rounded hover:bg-gray-100"
            onClick={() => onSelect(u.username)}
          >
            {u.username}
          </div>
        ))}
      </div>
    );
  }
  