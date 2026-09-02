import SearchInput from "./SearchInput";
import ReelsGrid from "@/components/ReelsGrid";

function Search() {
  return (
    <div className="w-full mx-auto px-2 sm:px-4 py-4 max-w-7xl">
      {/* Search Input Section */}
      <div className="mb-8">
        <SearchInput />
      </div>
    
      <ReelsGrid />
    </div>
  );
}

export default Search;
