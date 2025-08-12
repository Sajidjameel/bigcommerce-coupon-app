  // Render skeleton loading UI for categories
  export const renderSkeletonCategories = () => {
    return (
      <div className="animate-pulse">
        {[...Array(2)].map((_, index) => (
          <div
            key={`skeleton-category-${index}`}
            className={`flex items-center px-4 py-3 rounded ${
              index === 1 ? "bg-gray-50" : ""
            }`}
          >
            {/* Chevron icon placeholder */}
            <div className="w-4 h-4 bg-gray-200 rounded-sm mr-3"></div>
  
            {/* Store/category icon */}
            <div className="w-5 h-5 bg-gray-300 rounded mr-3"></div>
  
            {/* Label line */}
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  };