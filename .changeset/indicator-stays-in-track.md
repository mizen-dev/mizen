---
"@mizen-labs/ui": patch
---

The selection indicator of `Tabs` and `SegmentedControl` no longer springs past the edge of its track. Moving to the first or last item made the track scroll sideways for a moment and drew the indicator up to 15px outside the track. The edge that lands on the track edge now stops there, and the opposite edge still springs.
