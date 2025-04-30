const selectionSort = async (
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
  const start = performance.now();
  let swapCount = 0;
  let comparisonCount = 0;
  let arrayAccess = 0;

  const tempArray = [...array];
  let updateCounter = 0;

  for (let i = 0; i < tempArray.length; i++) {
    if (signal.aborted) {
      console.log("Sorting aborted");
      return;
    }
    let minIndex = i;

    for (let j = i + 1; j < tempArray.length; j++) {
      highlightIndices([minIndex, j]);

      comparisonCount++;
      setComparisonCount(comparisonCount);

      arrayAccess += 2;
      setArrayAccesses(arrayAccess);

      if (tempArray[j] < tempArray[minIndex]) {
        minIndex = j;
      }

      updateCounter++;
      if (updateCounter % updateSkip === 0) {
        updateArray([...tempArray]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (minIndex !== i) {
      swapCount++;
      setSwapCount(swapCount);
      [tempArray[i], tempArray[minIndex]] = [tempArray[minIndex], tempArray[i]];
      arrayAccess += 4;
      setArrayAccesses(arrayAccess);
    }

    updateArray([...tempArray]);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  highlightIndices([-1, -1]);
  setSortTime(performance.now() - start);
};

export default selectionSort;
