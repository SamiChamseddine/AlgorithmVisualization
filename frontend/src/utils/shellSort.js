const shellSort = async (
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
  const tempArray = [...array];
  let gap = Math.floor(tempArray.length / 2);
  let comparisonCount = 0;
  let arrayAccess = 0;
  let updateCounter = 0; 

  while (gap > 0) {
    for (let i = gap; i < tempArray.length; i++) {
      if (signal.aborted) {
        console.log("Sorting aborted");
        return; 
      }
      const temp = tempArray[i];
      let j = i;

      while (j >= gap && tempArray[j - gap] > temp) {
        highlightIndices([j, j - gap]); 
        comparisonCount++;
        setComparisonCount(comparisonCount);
        tempArray[j] = tempArray[j - gap];
        arrayAccess += 2; 
        setArrayAccesses(arrayAccess);
        j -= gap;

        
        updateCounter++;
        if (updateCounter % updateSkip === 0) {
          updateArray([...tempArray]);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      tempArray[j] = temp;
      arrayAccess++; 

      
      updateCounter++;
      if (updateCounter % updateSkip === 0) {
        updateArray([...tempArray]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    gap = Math.floor(gap / 2); 
  }
  highlightIndices([-1, -1]); 
};
export default shellSort;
