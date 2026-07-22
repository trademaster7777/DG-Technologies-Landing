---
name: Task merges can drop uncommitted files
description: Concurrent project-task merges may silently remove new files/scripts from the working tree; re-verify before re-review.
---
Rule: after another task merges mid-work, re-check that your new files and package.json script edits still exist before re-running validation or completion review.
**Why:** A merge once removed a newly written test file and the `test` script, causing a completion review rejection for "missing" work that had been written and passing minutes earlier.
**How to apply:** On review rejection claiming something is missing that you wrote, first `ls`/`git show --stat` to confirm the file survived recent merges, then restore and re-run.
