const countingSort = async (
  array,
  updateArray,
  highlightIndices,
  delay,
  updateSkip
) => {
  const max = Math.max(...array);
  const min = Math.min(...array);
  const range = max - min + 1;

  const count = new Array(range).fill(0);
  const output = new Array(array.length).fill(0);

  let updateCounter = 0; 

  
  for (let i = 0; i < array.length; i++) {
    count[array[i] - min]++;
    highlightIndices([i]);

    
    updateCounter++;
    if (updateCounter % 50 === 0) {
      updateArray([...array]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  
  for (let i = array.length - 1; i >= 0; i--) {
    output[count[array[i] - min] - 1] = array[i];
    count[array[i] - min]--;

    
    updateCounter++;
    if (updateCounter % updateSkip === 0) {
      updateArray([...output]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  
  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    highlightIndices([i]);

    
    updateCounter++;
    if (updateCounter % 50 === 0) {
      updateArray([...array]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  
  updateArray([...array]);
  highlightIndices([-1, -1]);
};
export default countingSort;
