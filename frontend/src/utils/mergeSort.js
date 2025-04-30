const mergeSort = async (
  array,
  updateArray,
  highlightIndices,
  delay,
  updateSkip,
  setSwapCount,
  setSortTime,
  setArrayAccesses,
  setComparisonCount,
  signal,
) => {
  const start = performance.now();
  let swapCount = 0; 
  let comparisonCount = 0;
  let arrayAccess = 0;

  let updateCounter = 0; 

  const merge = async (left, right, leftStartIndex) => {
    let sorted = [];
    let i = 0;
    let j = 0; 

    while (i < left.length && j < right.length) {
      if (signal.aborted) {
        console.log("Sorting aborted");
        return; 
      }
      highlightIndices([leftStartIndex + i, leftStartIndex + left.length + j]); 

      comparisonCount++;
      setComparisonCount(comparisonCount);

      if (left[i] <= right[j]) {
        sorted.push(left[i++]);
      } else {
        sorted.push(right[j++]);
      }

      arrayAccess += 1; 
      setArrayAccesses(arrayAccess);

    
      updateCounter++;
      if (updateCounter % updateSkip === 0) {
        
        updateArray(prevArray => [
          ...prevArray.slice(0, leftStartIndex),
          ...sorted,
          ...left.slice(i),
          ...right.slice(j),
          ...prevArray.slice(leftStartIndex + left.length + right.length)
        ]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    sorted = [...sorted, ...left.slice(i), ...right.slice(j)];

    arrayAccess += left.slice(i).length + right.slice(j).length;
    setArrayAccesses(arrayAccess);

    updateArray(prevArray => [
      ...prevArray.slice(0, leftStartIndex),
      ...sorted,
      ...prevArray.slice(leftStartIndex + left.length + right.length)
    ]);

    return sorted;
  };

  const mergeSortHelper = async (arr, startIndex) => {
    if (arr.length < 2) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = await mergeSortHelper(arr.slice(0, mid), startIndex);
    const right = await mergeSortHelper(arr.slice(mid), startIndex + mid);
    return merge(left, right, startIndex);
  };

  await mergeSortHelper(array, 0);
  highlightIndices([-1, -1]); 

  setSortTime(performance.now() - start);
};

export default mergeSort;
