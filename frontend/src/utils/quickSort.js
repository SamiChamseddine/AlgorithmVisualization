const quickSort = async (
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
  let swapCount = 0;
  let arrayAccessCount = 0;
  let comparisonCount = 0;
  const start = performance.now();

  const quickSortHelper = async (arr, low, high) => {
    if (low < high) {
      const pivotIndex = await partition(arr, low, high);
      await quickSortHelper(arr, low, pivotIndex - 1);
      await quickSortHelper(arr, pivotIndex + 1, high);
    }
  };

  const partition = async (arr, low, high) => {
    
    const pivot = arr[high];
    arrayAccessCount++; 
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (signal.aborted) {
        console.log("Sorting aborted");
        return; 
      }
      highlightIndices([j, high]); 

      
      comparisonCount++;
      setComparisonCount(comparisonCount);

      
      arrayAccessCount += 2;
      setArrayAccesses(arrayAccessCount);

      if (arr[j] <= pivot) {
        i++;
        
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swapCount++;
        setSwapCount(swapCount);

        
        arrayAccessCount += 4;
        setArrayAccesses(arrayAccessCount);

        if ((i * arr.length + j) % updateSkip === 0) {
          updateArray([...arr]);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      
      if ((i * arr.length + j) % updateSkip === 0) {
        updateArray([...arr]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swapCount++;
    setSwapCount(swapCount);

    
    arrayAccessCount += 4;
    setArrayAccesses(arrayAccessCount);

    updateArray([...arr]);
    return i + 1;
  };
  await quickSortHelper(array, 0, array.length - 1);
  highlightIndices([-1, -1]);
  setSortTime(performance.now() - start);
  setSwapCount(swapCount); 
};

export default quickSort;
