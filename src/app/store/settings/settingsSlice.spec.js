import settingsReducer from "./settingsSlice"

describe("settings reducer", () => {
  it("should handle initial state", () => {
    expect(settingsReducer(undefined, { type: "unknown" })).toEqual({
      qsos: undefined,
      refs: undefined,
      status: "idle",
    })
  })
})
