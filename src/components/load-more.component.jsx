const LoadMoreDataBtn = ({ state, fetchDataFunc }) => {
    if (state != null && state.totalDocs > state.results.length) {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => fetchDataFunc({ page: state.page + 1 })}
            className="mt-4 bg-black text-white p-3 px-4 rounded-md flex items-center gap-2 hover:bg-gray-800"
          >
            Load More
          </button>
        </div>
      );
    }
  };
  
  export default LoadMoreDataBtn;
  