/** First, last and the neighbours of the current page; gaps become an ellipsis. */
export function getPageItems(current: number, last: number): Array<number | "ellipsis"> {
  const pages = [...new Set([1, current - 1, current, current + 1, last])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b)

  const items: Array<number | "ellipsis"> = []
  let previous = 0
  for (const page of pages) {
    if (page - previous > 1) items.push("ellipsis")
    items.push(page)
    previous = page
  }
  return items
}
