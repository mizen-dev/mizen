---
"@mizen-labs/ui": patch
---

A `PaginationLink` page number stays on one line. A two-digit number such as "10" broke into two lines, because the 32px square kept 8px of inline padding. The link is now square up to two digits and grows wider past that.
