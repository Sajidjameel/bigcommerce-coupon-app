"use client"

interface Tag {
  id: number
  name: string
}

interface TagInputProps {
  tags: Tag[]
  placeholder: string
  onClick: () => void
  disabled?: boolean
  showCount?: boolean
}

export function TagInput({ tags, placeholder, onClick, disabled = false, showCount = true }: TagInputProps) {
  const displayTags = tags.slice(0, 1)
  const remainingCount = tags.length - displayTags.length

  return (
    <div
      className={`flex items-center flex-wrap w-full border border-gray-300 rounded pl-10 pr-3 py-1.5 text-sm focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      {displayTags.length > 0 ? (
        <>
          {displayTags.map((tag) => (
            <div key={tag.id} className="flex items-center bg-gray-200 rounded mr-1.5 my-0.5 px-2 py-0.5 text-gray-800">
              <span>{tag.name}</span>
            </div>
          ))}
          {remainingCount > 0 && showCount && (
            <div className="flex items-center bg-gray-200 rounded mr-1.5 my-0.5 px-2 py-0.5 text-gray-800">
              <span>+{remainingCount}</span>
            </div>
          )}
        </>
      ) : (
        <span className="text-gray-500">{placeholder}</span>
      )}
    </div>
  )
}
