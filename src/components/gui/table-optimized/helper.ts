/**
 * Giving the container, we calculate visible rows and column
 *
 * @param e container elements
 * @param headerSizes size of each headers
 * @param totalRowCount total number of rows
 * @param rowHeight fixed height of each row
 * @param renderAhead number of rows that we need to pre-render ahead
 * @returns
 */
export function getVisibleCellRange(
  e: HTMLDivElement,
  headerSizes: number[],
  totalRowCount: number,
  rowHeight: number,
  renderAhead: number,
  gutterWidth: number
) {
  const currentRowStart = Math.max(
    0,
    Math.floor(e.scrollTop / rowHeight) - 1 - renderAhead
  );
  const currentRowEnd = Math.min(
    totalRowCount,
    currentRowStart +
      Math.ceil(e.getBoundingClientRect().height / rowHeight) +
      renderAhead
  );

  let currentColStart = -1;
  let currentColAccumulateSize = gutterWidth;
  let currentColEnd = -1;

  const visibleXStart = e.scrollLeft;
  const visibleXEnd = visibleXStart + e.getBoundingClientRect().width;

  for (let i = 0; i < headerSizes.length; i++) {
    if (currentColAccumulateSize >= visibleXStart && currentColStart < 0) {
      currentColStart = i - 1;
    }

    currentColAccumulateSize += headerSizes[i] ?? 0;

    if (currentColAccumulateSize >= visibleXEnd && currentColEnd < 0) {
      currentColEnd = i;
      break;
    }
  }

  if (currentColEnd < 0) currentColEnd = headerSizes.length - 1;
  if (currentColStart < 0) currentColStart = 0;
  if (currentColEnd >= headerSizes.length)
    currentColEnd = headerSizes.length - 1;

  return {
    colStart: currentColStart,
    colEnd: currentColEnd,
    rowStart: currentRowStart,
    rowEnd: currentRowEnd,
  };
}
