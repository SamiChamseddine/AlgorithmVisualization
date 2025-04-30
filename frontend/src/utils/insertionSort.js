const insertionSort = async (
  array,
  updateArray,
  highlightIndices,
  delay,
  updateSkip,
  setSwapCount,
  setSortTime,
  setArrayAccesses,
  setComparisonCount,
  signal
) => {
  let comparisonCount = 0;
  let arrayAccess = 0;

  const tempArray = [...array];
  let updateCounter = 0; 

  for (let i = 1; i < tempArray.length; i++) {
    if (signal.aborted) {
      console.log("Sorting aborted");
      return; 
    }
    let key = tempArray[i];
    let j = i - 1;

    
    comparisonCount++;
    setComparisonCount(comparisonCount);

    
    highlightIndices([j, j + 1]);

    
    while (j >= 0 && tempArray[j] > key) {
      comparisonCount++;
      setComparisonCount(comparisonCount);

      arrayAccess += 2; 
      setArrayAccesses(arrayAccess);

      tempArray[j + 1] = tempArray[j];
      j--;

      
      updateCounter++;
      if (updateCounter % updateSkip === 0) {
        updateArray([...tempArray]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    
    tempArray[j + 1] = key;
    arrayAccess++; 
    setArrayAccesses(arrayAccess);

    
    updateArray([...tempArray]);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  highlightIndices([-1, -1]); 
  setSortTime(performance.now() - start);
};

export default insertionSort;
