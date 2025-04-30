const heapSort = async (
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

  const heapify = async (arr, n, i) => {
    if (signal.aborted) {
      console.log("Sorting aborted");
      return; 
    }
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      comparisonCount++;
      setComparisonCount(comparisonCount);
      if (arr[left] > arr[largest]) largest = left;
      arrayAccess += 1; 
      setArrayAccesses(arrayAccess);
    }
    
    if (right < n) {
      comparisonCount++;
      setComparisonCount(comparisonCount);
      if (arr[right] > arr[largest]) largest = right;
      arrayAccess += 1; 
      setArrayAccesses(arrayAccess);
    }

    if (largest !== i) {
      highlightIndices([i, largest]); 
      [arr[i], arr[largest]] = [arr[largest], arr[i]]; 
      arrayAccess += 2; 
      setArrayAccesses(arrayAccess);
      
      swapCount++;
      setSwapCount(swapCount);

      
      if (swapCount % updateSkip === 0) {
        updateArray([...arr]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      await heapify(arr, n, largest);
    }
  };

  const tempArray = [...array];
  let updateCounter = 0; 

  
  for (let i = Math.floor(tempArray.length / 2) - 1; i >= 0; i--) {
    await heapify(tempArray, tempArray.length, i);
  }

  
  for (let i = tempArray.length - 1; i > 0; i--) {
    if (signal.aborted) {
      console.log("Sorting aborted");
      return; 
    }
    
    
    highlightIndices([0, i]);
    [tempArray[0], tempArray[i]] = [tempArray[i], tempArray[0]];

    arrayAccess += 2;
    setArrayAccesses(arrayAccess);
    swapCount++;
    setSwapCount(swapCount);

    
    updateCounter++;
    if (updateCounter % updateSkip === 0) {
      updateArray([...tempArray]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    
    await heapify(tempArray, i, 0);
  }

  
  updateArray([...tempArray]);
  highlightIndices([-1, -1]);

  setSortTime(performance.now() - start);
};

export default heapSort;
