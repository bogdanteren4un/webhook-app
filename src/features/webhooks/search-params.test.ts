import { describe, expect, it } from "vitest"

import { parsePage, readListParams, webhookEditHref, webhookListHref } from "./search-params"

describe("list params in the URL", () => {
  it("accepts only positive integer pages", () => {
    expect(parsePage("2")).toBe(2)
    for (const invalid of ["abc", "0", "-1", "2.5", "", null]) {
      expect(parsePage(invalid)).toBeNull()
    }
  })

  it("falls back to page 1 and an empty search", () => {
    expect(readListParams(new URLSearchParams())).toEqual({ page: 1, search: "" })
    expect(readListParams(new URLSearchParams("page=abc&search=crm"))).toEqual({
      page: 1,
      search: "crm",
    })
  })

  it("builds canonical links that leave default values out", () => {
    expect(webhookListHref({ page: 1, search: "" })).toBe("/webhooks")
    expect(webhookListHref({ page: 2, search: "a b" })).toBe("/webhooks?page=2&search=a+b")
    expect(webhookEditHref(7, { page: 1, search: "crm" })).toBe("/webhooks/7?search=crm")
  })
})
